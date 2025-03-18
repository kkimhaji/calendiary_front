import axios from 'axios';

// API 클라이언트 설정
const api = axios.create({
  baseURL: 'localhost:8080/',
  withCredentials: true, // 쿠키 전송을 위해 필수
});

// Access Token을 localStorage에 저장
const setAccessToken = (token) => {
  if (token) {
    localStorage.setItem('accessToken', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('accessToken');
    delete api.defaults.headers.common['Authorization'];
  }
};

// 초기 토큰 설정
const token = localStorage.getItem('accessToken');
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
        setAccessToken(newAccessToken);
        
        // 원래 요청 재시도
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // 토큰 갱신 실패 - 로그아웃 처리
        setAccessToken(null);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

const authService = {
  // 일반 로그인
  login: async (email, password) => {
    const response = await api.post('auth/authenticate', { email, password });
    setAccessToken(response.data.accessToken);
    return response.data;
  },
  
  // 자동 로그인 옵션으로 로그인
  loginWithRememberMe: async (email, password) => {
    const response = await api.post('/auth/authenticate/auto-login', { email, password });
    setAccessToken(response.data.accessToken);
    return response.data;
  },
  
  // 자동 로그인 시도 (페이지 로드 시)
  attemptAutoLogin: async () => {
    try {
      const response = await api.post('/auth/auto-login');
      setAccessToken(response.data.accessToken);
      return true;
    } catch (error) {
      return false;
    }
  },
  
  // 로그아웃
  logout: async () => {
    await api.post('/auth/logout');
    setAccessToken(null);
  },
  
  // 액세스 토큰 갱신
  refreshToken: async () => {
    const response = await api.post('/auth/refresh-token');
    setAccessToken(response.data.accessToken);
    return response.data;
  },
  
  // 현재 사용자 정보 조회
  getCurrentUser: async () => {
    return api.get('/user/me');
  }
};

export default authService;
