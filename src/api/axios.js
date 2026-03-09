import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const instance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

let isRefreshing = false;
let refreshPromise = null;
let failedQueue = [];
let logoutInProgress = false;

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const resetAuthState = () => {
  isRefreshing = false;
  refreshPromise = null;
  failedQueue = [];
  logoutInProgress = false;
};

export const handleLogout = async () => {
  if (logoutInProgress) return;

  logoutInProgress = true;
  window.isLoggingOut = true; // index.js 인터셉터와 상태 공유

  try {
    await instance.post('/auth/logout', {}, {
      _skipAuth: true,
      timeout: 3000
    });
  } catch (error) {
    // 서버 로그아웃 실패는 무시
  }

  localStorage.clear();
  sessionStorage.clear();
  delete instance.defaults.headers.common['Authorization'];

  resetAuthState();

  setTimeout(() => {
    if (window.location.pathname !== '/login') {
      window.location.replace('/login?expired=true');
    }
  }, 100);
};

// 요청 인터셉터
instance.interceptors.request.use(
  (config) => {
    if (logoutInProgress) {
      return Promise.reject(new Error('로그아웃 진행 중'));
    }

    // _skipAuth가 true인 경우 인터셉터 통과 (refresh 요청 등)
    if (config._skipAuth) {
      return config;
    }

    // auth 관련 URL은 토큰 주입 스킵
    const skipAuthUrls = ['/auth/authenticate', '/auth/logout', '/auth/register'];
    if (skipAuthUrls.some(url => config.url?.includes(url))) {
      return config;
    }

    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (logoutInProgress || window.isLoggingOut) {
      return Promise.reject(new Error('로그아웃 진행 중'));
    }

    // 이미 재시도했거나 skipAuth 요청이거나 auth 관련 URL이면 그대로 reject
    if (
      originalRequest._retry ||
      originalRequest._skipAuth ||
      originalRequest.url?.includes('/auth/')
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const storedRefreshToken = localStorage.getItem('refreshToken');

    // refresh token이 없으면 로그아웃
    if (!storedRefreshToken) {
      await handleLogout();
      return Promise.reject(new Error('No refresh token'));
    }

    // 이미 갱신 중이면 큐에 추가
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return instance(originalRequest);
      }).catch(err => Promise.reject(err));
    }

    // 토큰 갱신 시작
    isRefreshing = true;

    if (!refreshPromise) {
      // ✅ 핵심 수정: refresh token을 Authorization 헤더에 명시적으로 설정
      // instance.defaults.headers의 만료된 access token이 전송되는 것을 방지
      refreshPromise = instance.post('/auth/refresh-token', {}, {
        headers: { Authorization: `Bearer ${storedRefreshToken}` },
        timeout: 10000,
        _skipAuth: true,
      });
    }

    try {
      const refreshResponse = await refreshPromise;
      const newAccessToken = refreshResponse.data.accessToken;
      const newRefreshToken = refreshResponse.data.refreshToken;

      if (!newAccessToken) {
        throw new Error('새 액세스 토큰이 없습니다');
      }

      localStorage.setItem('accessToken', newAccessToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }

      instance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      processQueue(null, newAccessToken);
      return instance(originalRequest);

    } catch (refreshError) {
      processQueue(refreshError, null);
      await handleLogout();
      return Promise.reject(new Error('토큰 갱신 실패'));
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  }
);

export const getBaseURL = () => API_BASE_URL;

export default instance;