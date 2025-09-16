import axios, { resetAuthState } from '../api/axios';

const authService = {
  // 일반 로그인
  login: async (email, password, rememberMe = false) => {
    try {
      const response = await axios.post('/auth/authenticate', { 
        email, 
        password, 
        rememberMe 
      });
      
      const { accessToken, refreshToken } = response.data;
      
      // 토큰 저장
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.setItem('rememberMe', rememberMe.toString());
      
      // 인증 헤더 설정
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      // 로그인 성공 시 인증 상태 초기화
      resetAuthState();
      
      return response.data;
    } catch (error) {
      console.error('로그인 실패:', error);
      throw error;
    }
  },
  
  // 자동 로그인 시도
  attemptAutoLogin: async () => {
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    if (!rememberMe) {
      console.log('로그인 유지 옵션이 없어 자동 로그인 시도 안함');
      return false;
    }
    
    try {
      const response = await axios.post('/auth/auto-login', {}, {
        _skipAuth: true
      });
      
      const { accessToken, refreshToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      resetAuthState();
      
      return true;
    } catch (error) {
      console.error('자동 로그인 실패:', error.message);
      return false;
    }
  },
  
  // 로그아웃
  logout: async () => {
    try {
      await axios.post('/auth/logout', {}, {
        _skipAuth: true
      });
    } catch (error) {
      console.error('서버 로그아웃 요청 실패:', error);
    } finally {
      // 로컬 상태 정리
      localStorage.removeItem('accessToken');
      sessionStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('rememberMe');
      
      delete axios.defaults.headers.common['Authorization'];
      resetAuthState();
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  },
  
  getCurrentUser: async () => {
    return axios.get('/member/get-info');
  }
};

export default authService;
