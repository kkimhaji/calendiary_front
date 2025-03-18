import axios from 'axios';

// API 클라이언트 설정
const instance = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
  timeout: 10000,
});

// 요청 인터셉터 (토큰 추가)
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken') || 
                  sessionStorage.getItem('accessToken');
    if (token) {
        if (!config.headers) {
            config.headers = {};
          }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 함수 정의만 하고 실제 로직은 외부에서 주입받도록 설정
let logoutCallback = null;

// 로그아웃 콜백 설정 함수
export const setLogoutCallback = (callback) => {
  logoutCallback = callback;
};

// 로그아웃 함수
export const handleLogout = () => {
  if (logoutCallback) {
    logoutCallback();
  }
};

export default instance;
