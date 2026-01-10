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
  console.log('인증 상태 초기화 완료');
};

export const handleLogout = async () => {
  if (logoutInProgress) {
    console.log('이미 로그아웃 진행 중');
    return;
  }
  
  logoutInProgress = true;
  console.log('로그아웃 처리 시작');
  
  try {
    await instance.post('/auth/logout', {}, { 
      _skipAuth: true,
      timeout: 3000
    });
  } catch (error) {
    console.log('서버 로그아웃 실패 (무시):', error.message);
  }
  
  localStorage.clear();
  sessionStorage.clear();
  delete instance.defaults.headers.common['Authorization'];
  
  resetAuthState();
  
  console.log('로그아웃 처리 완료');
  
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

    const skipAuthUrls = ['/auth/login', '/auth/logout', '/auth/refresh-token', '/auth/register'];
    
    if (skipAuthUrls.some(url => config.url?.includes(url)) || config._skipAuth) {
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

// 핵심 개선된 응답 인터셉터 - 한 번만 토큰 갱신
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (logoutInProgress) {
      return Promise.reject(new Error('로그아웃 진행 중'));
    }

    if (originalRequest._retry || 
        originalRequest._skipAuth ||
        originalRequest.url?.includes('/auth/')) {
      return Promise.reject(error);
    }

    // 401 에러 처리
    if (error.response?.status === 401) {
      console.log(`401 에러 발생 - URL: ${originalRequest.url}`);
      originalRequest._retry = true;

      const rememberMe = localStorage.getItem('rememberMe') === 'true';

      if (!rememberMe) {
        console.log('로그인 유지 옵션 없음 - 즉시 로그아웃');
        await handleLogout();
        return Promise.reject(new Error('로그아웃'));
      }

      // 토큰 갱신 중이면 큐에 추가
      if (isRefreshing) {
        console.log('토큰 갱신 중 - 요청을 큐에 추가');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return instance(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      // 토큰 갱신 시작 - 한 번만 실행
      isRefreshing = true;
      
      if (!refreshPromise) {
        console.log('토큰 갱신 시작...');
        refreshPromise = instance.post('/auth/refresh-token', {}, {
          withCredentials: true,
          timeout: 10000,
          _skipAuth: true
        });
      }

      try {
        const refreshResponse = await refreshPromise;
        const newAccessToken = refreshResponse.data.accessToken;
        const newRefreshToken = refreshResponse.data.refreshToken;

        if (!newAccessToken) {
          throw new Error('새 액세스 토큰 없음');
        }

        localStorage.setItem('accessToken', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }
        
        instance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);

        console.log('토큰 갱신 성공 - 원래 요청 재시도');
        return instance(originalRequest);

      } catch (refreshError) {
        console.log('토큰 갱신 실패:', refreshError.message);
        processQueue(refreshError, null);
        await handleLogout();
        return Promise.reject(new Error('토큰 갱신 실패'));
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    }

    return Promise.reject(error);
  }
);
export const getBaseURL = () => API_BASE_URL;

export default instance;
