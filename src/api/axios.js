import axios from 'axios';
import { store } from '../stroe';
import { logout } from '../stroe/authSlice';

const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = store.getState().auth.token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터 - 401 오류 시 로그아웃
api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // 인증 만료 시 로그아웃
        store.dispatch(logout());
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

export default axios;