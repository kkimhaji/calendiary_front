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
    try {
      const token = localStorage.getItem('accessToken') || 
                    sessionStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        delete config.headers?.Authorization;
      }
    } catch (e) {
      console.error('토큰 설정 중 오류:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// // 함수 정의만 하고 실제 로직은 외부에서 주입받도록 설정
// let logoutCallback = null;

// // 로그아웃 콜백 설정 함수
// export const setLogoutCallback = (callback) => {
//   logoutCallback = callback;
// };

// // 로그아웃 함수
// export const handleLogout = () => {
//   if (logoutCallback) {
//     logoutCallback();
//   }
// };
// 인스턴스 생성 확인 로그
console.log('axios 인스턴스가 생성되었습니다. 인터셉터 사용 가능: ', 
  !!instance.interceptors);

export default instance;
