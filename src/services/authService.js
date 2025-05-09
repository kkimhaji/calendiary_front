import axios from '../api/axios';

// authService.js는 axios 인스턴스를 사용만 하고 직접 생성하지 않음
const authService = {
  // 일반 로그인
  login: async (email, password, rememberMe = false) => {
    const response = await axios.post('auth/authenticate', { email, password, rememberMe });
    const { accessToken } = response.data;
    
    // 토큰 저장
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('accessToken', accessToken);
    localStorage.setItem('rememberMe', rememberMe.toString());
    
    // 인증 헤더 설정
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    
    return response.data;
  },
  
  // 자동 로그인 시도
  attemptAutoLogin: async () => {
    if (window.__attemptingAutoLogin) {
      return false;
    }
    
    window.__attemptingAutoLogin = true;
    
    try {
      const response = await axios.post('/auth/auto-login', {}, {
        _skipAuthRetry: true
      });
      
      const { accessToken } = response.data;
      const rememberMe = localStorage.getItem('rememberMe') === 'true';
      
      // 토큰 저장
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('accessToken', accessToken);
      
      // 인증 헤더 설정
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      window.__attemptingAutoLogin = false;
      return true;
    } catch (error) {
      window.__attemptingAutoLogin = false;
      return false;
    }
  },
  
  // 로그아웃
  logout: async () => {
    window.__isLoggingOut = true;
    
    try {
      await axios.post('/auth/logout', {}, {
        _skipAuthRetry: true
      });
    } finally {
      // 스토리지 정리
      localStorage.removeItem('accessToken');
      sessionStorage.removeItem('accessToken');
      localStorage.removeItem('rememberMe');
      delete axios.defaults.headers.common['Authorization'];
      
      window.__isLoggingOut = false;
      
      // 로그인 페이지로 리다이렉트
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  },
  
  // 현재 사용자 정보 조회
  getCurrentUser: async () => {
    return axios.get('/user/me');
  }
};

export default authService;
