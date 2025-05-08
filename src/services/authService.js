import axios from 'axios';
import { store } from '../store'; // Redux store import 추가
import { clearCredentials } from '../store/authSlice';

// API 클라이언트 설정
const api = axios.create({
  baseURL: 'http://localhost:8080/',
  withCredentials: true,
});

// 토큰 관리를 위한 변수들
let isRefreshing = false;
let failedQueue = [];

// 대기 중인 요청 처리 함수
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

// Access Token을 저장소에 저장
const setAccessToken = (token, rememberMe) => {
  if (token) {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('accessToken', token);
    localStorage.setItem('rememberMe', rememberMe.toString());
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');
    localStorage.removeItem('rememberMe');
    delete api.defaults.headers.common['Authorization'];
  }
};

// 초기 토큰 설정
const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// 응답 인터셉터 수정
api.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;
    
    // 로그아웃 처리 중이거나 리프레시 요청 자체가 실패한 경우
    if (window.__isLoggingOut || 
        originalRequest.url?.includes('/refresh-token') || 
        originalRequest.url?.includes('/auth/refresh-token') ||
        originalRequest._skipAuthRetry) {
      return Promise.reject(error);
    }

    // 401 오류 & 토큰 만료 & 재시도 안함
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // 이미 토큰 갱신 중인 경우 대기열에 추가
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      isRefreshing = true;
      
      try {
        // 리프레시 토큰으로 재발급 시도
        const refreshResult = await api.post('/auth/refresh-token', {}, {
          withCredentials: true,
          _skipAuthRetry: true
        });
        
        const newToken = refreshResult.data.accessToken;
        
        // 새 토큰 저장
        const rememberMe = localStorage.getItem('rememberMe') === 'true';
        setAccessToken(newToken, rememberMe);
        
        // 대기 중인 요청 처리
        processQueue(null, newToken);
        
        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        isRefreshing = false;
        return api(originalRequest);
      } catch (refreshError) {
        // 리프레시 실패 = 로그아웃 처리
        window.__isLoggingOut = true;
        processQueue(refreshError, null);
        
        // Redux store를 통해 로그아웃 처리
        store.dispatch(clearCredentials());
        
        // 로컬 스토리지 정리
        localStorage.removeItem('accessToken');
        sessionStorage.removeItem('accessToken');
        localStorage.removeItem('rememberMe');
        delete api.defaults.headers.common['Authorization'];
        
        // 로그인 페이지로 리다이렉트 (중복 요청 방지)
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?expired=true';
        }
        
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

const authService = {
  // 일반 로그인
  login: async (email, password, rememberMe = false) => {
    const response = await api.post('auth/authenticate', { email, password, rememberMe });
    setAccessToken(response.data.accessToken, rememberMe);
    return response.data;
  },
  
  // 자동 로그인 시도 (세션 만료 감지 추가)
  attemptAutoLogin: async () => {
    // 이미 자동 로그인 시도 중인지 확인
    if (window.__attemptingAutoLogin) {
      return false;
    }
    
    window.__attemptingAutoLogin = true;
    
    try {
      const response = await api.post('/auth/auto-login', {}, {
        _skipAuthRetry: true // 인증 재시도 방지
      });
      setAccessToken(response.data.accessToken, true);
      window.__attemptingAutoLogin = false;
      return true;
    } catch (error) {
      window.__attemptingAutoLogin = false;
      // 세션 만료된 경우 로컬 스토리지 정리
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        sessionStorage.removeItem('accessToken');
        localStorage.removeItem('rememberMe');
        delete api.defaults.headers.common['Authorization'];
      }
      return false;
    }
  },
  
  // 로그아웃 (Redux store와 연동)
  logout: async () => {
    window.__isLoggingOut = true;
    
    try {
      await api.post('/auth/logout', {}, {
        _skipAuthRetry: true
      });
    } finally {
      // 로컬 스토리지 정리
      localStorage.removeItem('accessToken');
      sessionStorage.removeItem('accessToken');
      localStorage.removeItem('rememberMe');
      delete api.defaults.headers.common['Authorization'];
      
      // Redux store 상태 초기화
      store.dispatch(clearCredentials());
      
      window.__isLoggingOut = false;
      
      // 로그인 페이지로 리다이렉트
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  },
  
  // 현재 사용자 정보 조회
  getCurrentUser: async () => {
    return api.get('/user/me');
  }
};

export default authService;
export { api }; // axios 인스턴스 내보내기
