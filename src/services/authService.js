import axios from 'axios';
import { logoutUser } from '../store/authSlice';

// API 클라이언트 설정
const api = axios.create({
  baseURL: 'http://localhost:8080/',
  withCredentials: true, // 쿠키 전송을 위해 필수
});

// Access Token을 localStorage에 저장
const setAccessToken = (token, rememberMe) => {
  if (token) {
    // rememberMe에 따라 다른 스토리지 사용
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('accessToken', token);

    // 로그인 유지 설정 저장
    localStorage.setItem('rememberMe', rememberMe.toString());

    // Authorization 헤더 설정
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');
    localStorage.removeItem('rememberMe');
    delete api.defaults.headers.common['Authorization'];
  }
};

// 초기 토큰 설정 (localStorage 또는 sessionStorage에서 복원)
const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// 응답 인터셉터 설정 (토큰 갱신)
api.interceptors.response.use(
  response => response,
  async (error) => {
    if (window.__isLoggingOut) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    if (originalRequest.url?.includes('/refresh-token') || 
    originalRequest.url?.includes('/auth/refresh-token')) {
  console.log('리프레시 토큰 갱신 실패 - 로그아웃 처리');
  window.__isLoggingOut = true;
  
  try {
    await authService.logout();
  } catch (e) {
    // 로그아웃 실패해도 로그인 페이지로 강제 이동
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace('/login?expired=true');
  }
  
  return Promise.reject(error);
}

  // 401 오류 & 토큰 만료 & 재시도 안함
  if (error.response?.status === 401 && 
    error.response?.data?.code === 'TOKEN_EXPIRED' && 
    !originalRequest._retry) {
  
  try {
    // 리프레시 토큰으로 재발급 시도
    originalRequest._retry = true;
    const refreshResult = await api.post('/auth/refresh-token', {}, {
      withCredentials: true,
      _skipAuthRetry: true // 새로운 플래그로 재시도 방지
    });
    console.log("refreshResult: ", refreshResult);
    const newToken = refreshResult.data.accessToken;
    
    // 새 토큰 저장
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('accessToken', newToken);
    
    // 원래 요청 재시도
    originalRequest.headers.Authorization = `Bearer ${newToken}`;
    return api(originalRequest);
  } catch (refreshError) {
    // 리프레시 실패 = 완전 만료 = 로그아웃
    console.log('토큰 갱신 실패, 로그아웃 실행');
    
    // 무한 루프 방지 플래그
    window.__isLoggingOut = true;
    
    // 로컬 정리
    localStorage.clear();
    sessionStorage.clear();
    
    // 로그인 페이지로 이동
    window.location.replace('/login');
    await authService.logout();
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
  
  // 자동 로그인 옵션으로 로그인
  loginWithRememberMe: async (email, password) => {
    return authService.login(email, password, true);
  },
  
  // 자동 로그인 시도 (페이지 로드 시)
  attemptAutoLogin: async () => {
    try {
      const response = await api.post('/auth/auto-login');
      setAccessToken(response.data.accessToken, true);
      return true;
    } catch (error) {
      return false;
    }
  },
  
  // 로그아웃
  logout: async () => {
    try{
      await api.post('/auth/logout');
    } finally{
      localStorage.clear();
      sessionStorage.clear();
      delete api.defaults.headers.common['Authorization'];
      
      // 페이지 리로드로 상태 완전 초기화
      window.location.href = '/login';
      window.location.reload(true);
    }
  },
  
  // 액세스 토큰 갱신
  refreshToken: async () => {
    const response = await api.post('/auth/refresh-token');
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    setAccessToken(response.data.accessToken, rememberMe);
    return response.data;
  },
  
  // 현재 사용자 정보 조회
  getCurrentUser: async () => {
    return api.get('/user/me');
  }
};

export default authService;
