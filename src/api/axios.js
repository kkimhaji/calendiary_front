import axios from 'axios';

// API 클라이언트 설정
const instance = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
  timeout: 10000,
});

// 토큰 관리 변수
let isRefreshing = false;
let failedQueue = [];

// 토큰 갱신 시 대기 요청 처리
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

// 요청 인터셉터
instance.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('accessToken') || 
                    sessionStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('토큰 설정 중 오류:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 로그아웃 중이면 처리 중단
    if (window.__isLoggingOut || error.config?._skipAuthRetry) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    
    // 리프레시 토큰 요청이 실패한 경우
    if (originalRequest?.url?.includes('/auth/refresh-token')) {
      handleLogout();
      return Promise.reject(error);
    }

    // 401 오류 & 아직 재시도 안한 요청
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      
      // 이미 토큰 갱신 중인 경우
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
      
      isRefreshing = true;
      
      try {
        // 직접 토큰 갱신 요청
        const refreshResult = await instance.post('/auth/refresh-token', {}, {
          withCredentials: true,
          _skipAuthRetry: true
        });
        
        const newToken = refreshResult.data.accessToken;
        
        // 토큰 저장
        const rememberMe = localStorage.getItem('rememberMe') === 'true';
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('accessToken', newToken);
        
        instance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        processQueue(null, newToken);
        isRefreshing = false;
        
        return instance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        
        handleLogout();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// store 직접 참조 대신 별도 함수로 로그아웃 처리
export const handleLogout = () => {
  window.__isLoggingOut = true;
  
  // 로컬 스토리지 정리
  localStorage.removeItem('accessToken');
  sessionStorage.removeItem('accessToken');
  localStorage.removeItem('rememberMe');
  
  // 인증 헤더 제거
  delete instance.defaults.headers.common['Authorization'];
  
  // 로그인 페이지로 리다이렉트
  if (window.location.pathname !== '/login') {
    window.location.href = '/login?expired=true';
  }
  
  window.__isLoggingOut = false;
};

// 인스턴스 생성 확인
console.log('axios 인스턴스가 생성되었습니다.');

export default instance;
