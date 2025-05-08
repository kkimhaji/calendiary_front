import axios from 'axios';
import { store } from '../store'; // Redux store import
import { clearCredentials, refreshAccessToken } from '../store/authSlice';

// 토큰 갱신 관련 상태 변수
let isRefreshing = false;
let failedQueue = [];

// API 클라이언트 설정
const instance = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
  timeout: 10000,
});

// 대기 요청 처리 함수
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

// 요청 인터셉터 (토큰 추가)
instance.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('accessToken') || 
                    sessionStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        delete config.headers?.Authorization;
      }
    } catch (e) {
      console.error('토큰 설정 중 오류:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 추가
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 로그아웃 중이거나 특별 플래그가 있는 경우 처리 중단
    if (window.__isLoggingOut || error.config?._skipAuthRetry) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    
    // 리프레시 토큰 요청 자체가 실패한 경우 로그아웃 처리
    if (originalRequest?.url?.includes('/auth/refresh-token')) {
      console.log('리프레시 토큰 갱신 실패 - 로그아웃 처리');
      window.__isLoggingOut = true;
      
      // Redux 상태 정리
      store.dispatch(clearCredentials());
      
      // 로컬 정리
      localStorage.removeItem('accessToken');
      sessionStorage.removeItem('accessToken');
      localStorage.removeItem('rememberMe');
      
      // 로그인 페이지로 이동
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
      }
      
      return Promise.reject(error);
    }

    // 401 오류 & 토큰 만료 & 재시도 안함
    if (error.response?.status === 401 && 
        !originalRequest?._retry &&
        error.response?.data?.code === 'TOKEN_EXPIRED') {
      
      // 이미 갱신 중이면 대기열에 추가
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return instance(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }
      
      // 갱신 시작
      isRefreshing = true;
      originalRequest._retry = true;
      
      try {
        // Redux 액션을 통한 토큰 갱신
        const result = await store.dispatch(refreshAccessToken()).unwrap();
        const newToken = result.accessToken;
        
        // 대기 중인 요청 처리
        processQueue(null, newToken);
        isRefreshing = false;
        
        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return instance(originalRequest);
      } catch (refreshError) {
        // 리프레시 실패 = 완전 만료 = 로그아웃
        processQueue(refreshError, null);
        isRefreshing = false;
        window.__isLoggingOut = true;
        
        // Redux 상태 정리
        store.dispatch(clearCredentials());
        
        // 로컬 정리 및 리다이렉트
        localStorage.removeItem('accessToken');
        sessionStorage.removeItem('accessToken');
        localStorage.removeItem('rememberMe');
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?expired=true';
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// 인스턴스 생성 확인 로그
console.log('axios 인스턴스가 생성되었습니다. 인터셉터 사용 가능:', 
  !!instance.interceptors);

export default instance;
