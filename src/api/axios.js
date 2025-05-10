import axios from 'axios';

// API 클라이언트 설정
const instance = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
  timeout: 10000,
});

// 토큰 관리 변수
let isRefreshing = false;
let failedQueue = [];
let isAutoLoginAttempted = false; // 자동 로그인 시도 플래그
// 토큰 갱신 시 대기 요청 처리
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 요청 인터셉터
instance.interceptors.request.use(
  (config) => {
    try {
      // 자동 로그인 이미 시도했고 실패한 경우 추가 요청 방지
      if (isAutoLoginAttempted &&
        (config.url === '/auth/auto-login' ||
          config.url === '/member/get_teams' ||
          config.url === '/main')) {
        // 자동 로그인 요청이나 보호된 API 요청 취소
        const controller = new AbortController();
        config.signal = controller.signal;
        controller.abort('자동 로그인 이미 시도했고 실패했습니다.');
      }

      const token = localStorage.getItem('accessToken') ||
        sessionStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('토큰 설정 중 오류:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
instance.interceptors.response.use(
  (response) => response,
  async (error) => {

    if (axios.isCancel(error)) {
      console.log('요청 취소됨:', error.message);
      return Promise.reject(error);
    }

    // 로그아웃 중이면 처리 중단
    if (window.__isLoggingOut || error.config?._skipAuthRetry) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    // auto-login 요청이 실패한 경우
    if (originalRequest?.url?.includes('/auth/auto-login')) {
      console.log('자동 로그인 실패 - 로그인 페이지로 리다이렉트');
      isAutoLoginAttempted = true; // 자동 로그인 시도 표시

      // 로그인 페이지로 리다이렉트
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
      }

      return Promise.reject(error);
    }

    // 리프레시 토큰 요청이 실패한 경우
    if (originalRequest?.url?.includes('/auth/refresh-token')) {
      handleLogout();
      return Promise.reject(error);
    }

    // 401 오류 & 아직 재시도 안한 요청
    if ((error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest?._retry &&
      !isAutoLoginAttempted) {
      originalRequest._retry = true;

      // 로그인 페이지에 있으면 추가 시도 안함
      if (window.location.pathname === '/login') {
        return Promise.reject(error);
      }

      // 자동 로그인 먼저 시도
      try {
        console.log('자동 로그인 시도...');
        isAutoLoginAttempted = true; // 자동 로그인 시도 중 표시

        const autoLoginResponse = await instance.post('/auth/auto-login', {}, {
          _skipAuthRetry: true
        });

        const autoLoginToken = autoLoginResponse.data.accessToken;
        if (autoLoginToken) {
          console.log('자동 로그인 성공');

          // 토큰 저장
          const rememberMe = localStorage.getItem('rememberMe') === 'true';
          const storage = rememberMe ? localStorage : sessionStorage;
          storage.setItem('accessToken', autoLoginToken);

          instance.defaults.headers.common['Authorization'] = `Bearer ${autoLoginToken}`;
          originalRequest.headers.Authorization = `Bearer ${autoLoginToken}`;

          // 성공했으므로 원래 요청 재시도
          isAutoLoginAttempted = false; // 성공했으므로 플래그 초기화
          return instance(originalRequest);
        }
      } catch (autoLoginError) {
        console.log('자동 로그인 시도 실패');
        // 자동 로그인 실패 - 토큰 갱신 시도
        // isAutoLoginAttempted 상태 유지 (이미 시도했음)
      }

      // 자동 로그인 실패했거나 토큰 갱신 필요한 경우
      originalRequest._retry = true;

      // 이미 토큰 갱신 중인 경우
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return instance(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        // 직접 토큰 갱신 요청
        const refreshResult = await instance.post('/auth/refresh-token', {}, {
          withCredentials: true,
          _skipAuthRetry: true
        });

        const newToken = refreshResult.data.accessToken;

        // 토큰 저장
        const rememberMe = localStorage.getItem('rememberMe') === 'true';
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('accessToken', newToken);

        instance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);
        isRefreshing = false;

        return instance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        handleLogout();
        return Promise.reject(refreshError);
      }
    } else if ((error.response?.status === 401 || error.response?.status === 403) &&
      isAutoLoginAttempted) {
      // 이미 자동 로그인 시도했고 실패한 후 다른 401/403 오류 - 로그인 페이지로 이동
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
      }
    }

    return Promise.reject(error);
  }
);

// store 직접 참조 대신 별도 함수로 로그아웃 처리
export const handleLogout = () => {
  window.__isLoggingOut = true;

  // 로컬 스토리지 정리
  localStorage.removeItem('accessToken');
  sessionStorage.removeItem('accessToken');
  localStorage.removeItem('rememberMe');

  // 인증 헤더 제거
  delete instance.defaults.headers.common['Authorization'];

  isAutoLoginAttempted = false;

  // 로그인 페이지로 리다이렉트
  if (window.location.pathname !== '/login') {
    window.location.href = '/login?expired=true';
  }

  window.__isLoggingOut = false;
};

// 세션 만료 상태 초기화 (로그인 성공 시 호출)
export const resetAuthState = () => {
  isAutoLoginAttempted = false;
};

// 인스턴스 생성 확인
console.log('axios 인스턴스가 생성되었습니다.');

export default instance;
