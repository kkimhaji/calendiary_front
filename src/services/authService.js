import axios from '../api/axios';
import { resetAuthState } from '../api/axios';

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
    
    // 로그인 성공 시 자동 로그인 시도 상태 초기화
    resetAuthState();
    
    return response.data;
  },
  
  // 자동 로그인 시도 (중복 방지 개선)
  attemptAutoLogin: async () => {
    // 로그인 유지 옵션 확인
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    if (!rememberMe) {
      console.log('로그인 유지 옵션이 없어 자동 로그인 시도 안함');
      return false;
    }
    
    // 이미 자동 로그인 시도 중이면 중복 실행 방지
    if (window.__attemptingAutoLogin) {
      return false;
    }
    
    window.__attemptingAutoLogin = true;
    
    try {
      const response = await axios.post('/auth/auto-login', {}, {
        _skipAuthRetry: true
      });
      
      const { accessToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      window.__attemptingAutoLogin = false;
      resetAuthState(); // 성공 시 플래그 초기화
      return true;
    } catch (error) {
      window.__attemptingAutoLogin = false;
      // localStorage.setItem('autoLoginAttempted', 'true');
      return false;
    }
  },
  
  // 그 외 메소드는 변경 필요 없음
  logout: async () => {
    window.__isLoggingOut = true;
    
    try {
      await axios.post('/auth/logout', {}, {
        _skipAuthRetry: true
      });
    } finally {
      localStorage.removeItem('accessToken');
      sessionStorage.removeItem('accessToken');
      localStorage.removeItem('rememberMe');
      delete axios.defaults.headers.common['Authorization'];
      
      window.__isLoggingOut = false;
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  },
  
  getCurrentUser: async () => {
    return axios.get('/user/me');
  }
};

export default authService;
