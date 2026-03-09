import axios, { resetAuthState } from '../api/axios';

const authService = {
  login: async (email, password) => {
    const response = await axios.post('/auth/authenticate', { email, password });
    const { accessToken, refreshToken } = response.data;

    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    resetAuthState();

    return response.data;
  },

  logout: async () => {
    try {
      await axios.post('/auth/logout', {}, { _skipAuth: true });
    } catch (error) {
      // 무시
    } finally {
      localStorage.removeItem('accessToken');
      sessionStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      delete axios.defaults.headers.common['Authorization'];
      resetAuthState();

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  },

  getCurrentUser: async () => {
    return axios.get('/member/get-info');
  },
};

export default authService;