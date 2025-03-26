import axios from 'axios';

// API 클라이언트 설정
const api = axios.create({
  baseURL: 'localhost:8080/',
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
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // 401 에러이고 토큰 갱신 시도가 아직 없었던 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // 토큰 갱신 요청 (쿠키가 자동으로 전송됨)
        const refreshResponse = await axios.post('/auth/refresh-token', {}, {
          withCredentials: true
        });
        
        // 새 Access Token 저장
        const newAccessToken = refreshResponse.data.accessToken;
        const rememberMe = localStorage.getItem('rememberMe') === 'true';
        setAccessToken(newAccessToken, rememberMe);
        
        // 원래 요청 재시도
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // 토큰 갱신 실패 - 로그아웃 처리
        if (refreshError.response?.data?.code === 'REFRESH_TOKEN_EXPIRED') {
          await authService.logout();
          window.location.href = '/login?reason=session_expired';
        }
        setAccessToken(null, false);
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
