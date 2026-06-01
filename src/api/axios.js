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
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

export const resetAuthState = () => {
  isRefreshing = false;
  refreshPromise = null;
  failedQueue = [];
  logoutInProgress = false;
  window.isLoggingOut = false;
};

export const handleLogout = async () => {
  if (logoutInProgress) return;

  logoutInProgress = true;
  window.isLoggingOut = true;

  try {
    await instance.post('/auth/logout', {}, { _skipAuth: true, timeout: 3000 });
  } catch {
    // 서버 로그아웃 실패 무시
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
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (logoutInProgress || window.isLoggingOut) {
      return Promise.reject(new Error('로그아웃 진행 중'));
    }

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

    // refresh token 자체가 만료/무효 응답이면 즉시 로그아웃 (무한 루프 방지)
    const errorCode = error.response?.data?.code;
    if (errorCode === 'REFRESH_TOKEN_EXPIRED') {
      await handleLogout();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (!storedRefreshToken) {
      await handleLogout();
      return Promise.reject(new Error('No refresh token'));
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return instance(originalRequest);
      }).catch(err => Promise.reject(err));
    }

    isRefreshing = true;

    if (!refreshPromise) {
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

      if (!newAccessToken) throw new Error('새 액세스 토큰이 없습니다');

      localStorage.setItem('accessToken', newAccessToken);
      if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

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