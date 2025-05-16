import axios from 'axios';

// 상수 정의
const AUTO_LOGIN_FLAG = 'autoLoginAttempted';
const AUTO_LOGIN_TIMESTAMP = 'autoLoginAttemptedAt';
const AUTO_LOGIN_COOLDOWN = 60 * 1000; // 1분 동안 재시도 방지

// API 클라이언트 설정
const instance = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
  timeout: 10000,
});

// 토큰 관리 변수
let isRefreshing = false;
let failedQueue = [];
let isAutoLoginAttempted = localStorage.getItem(AUTO_LOGIN_FLAG) === 'true';

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
      // 자동 로그인 시도 상태 확인
      const autoLoginAttempted = localStorage.getItem(AUTO_LOGIN_FLAG) === 'true';
      const autoLoginTimestamp = parseInt(localStorage.getItem(AUTO_LOGIN_TIMESTAMP) || '0');
      const now = Date.now();
      const recentlyAttempted = now - autoLoginTimestamp < AUTO_LOGIN_COOLDOWN;
      
      // 최근에 자동 로그인 실패했으면 특정 요청 차단
      if (autoLoginAttempted && recentlyAttempted &&
          (config.url === '/auth/auto-login' || 
           config.url === '/member/get_teams' || 
           config.url === '/main')) {
        console.log('최근에 자동 로그인 시도 실패, 요청 취소');
        const controller = new AbortController();
        config.signal = controller.signal;
        controller.abort('자동 로그인 이미 시도했고 실패했습니다.');
      }

      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
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

    if (window.__isLoggingOut || error.config?._skipAuthRetry) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    // auto-login 요청이 실패한 경우
    if (originalRequest?.url?.includes('/auth/auto-login')) {
      console.log('자동 로그인 실패 - 로그인 페이지로 리다이렉트');
      markAutoLoginAttempted(true);
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
      }
      return Promise.reject(error);
    }

    // refresh-token 요청이 실패한 경우
    if (originalRequest?.url?.includes('/auth/refresh-token')) {
      handleLogout();
      return Promise.reject(error);
    }

    // 401/403 오류 처리
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest?._retry) {
      originalRequest._retry = true;
      
      // 로그인 페이지에서는 처리 중단
      if (window.location.pathname === '/login') {
        return Promise.reject(error);
      }

      const rememberMe = localStorage.getItem('rememberMe') === 'true';
      
      // 1. 로그인 유지를 선택하지 않았으면 즉시 로그아웃
      if (!rememberMe) {
        console.log('로그인 유지 옵션 없음, 세션 만료 - 로그아웃');
        handleLogout();
        return Promise.reject(error);
      }
      
      // 2. 로그인 유지 선택 & 자동 로그인 미시도 상태
      if (!isAutoLoginFailed()) {
        try {
          // 자동 로그인 시도
          console.log('자동 로그인 시도...');
          markAutoLoginAttempted(true);
          
          const autoLoginResponse = await instance.post('/auth/auto-login', {}, {
            _skipAuthRetry: true
          });
          
          if (autoLoginResponse.data.accessToken) {
            console.log('자동 로그인 성공');
            markAutoLoginAttempted(false);
            
            // 토큰 저장
            localStorage.setItem('accessToken', autoLoginResponse.data.accessToken);
            instance.defaults.headers.common['Authorization'] = `Bearer ${autoLoginResponse.data.accessToken}`;
            originalRequest.headers.Authorization = `Bearer ${autoLoginResponse.data.accessToken}`;
            
            // 원래 요청 재시도
            return instance(originalRequest);
          }
        } catch (autoLoginError) {
          console.log('자동 로그인 실패, 토큰 갱신 시도');
          // 자동 로그인 실패 시 토큰 갱신 시도
        }
      }

      // 3. 토큰 갱신 시도
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
        const refreshResult = await instance.post('/auth/refresh-token', {}, {
          withCredentials: true,
          _skipAuthRetry: true
        });
        
        const newToken = refreshResult.data.accessToken;
        localStorage.setItem('accessToken', newToken);
        instance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        processQueue(null, newToken);
        isRefreshing = false;
        markAutoLoginAttempted(false); // 토큰 갱신 성공 시 자동 로그인 시도 플래그 초기화
        
        return instance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        handleLogout();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// 자동 로그인 시도 여부 체크
function isAutoLoginFailed() {
  const attempted = localStorage.getItem(AUTO_LOGIN_FLAG) === 'true';
  const timestamp = parseInt(localStorage.getItem(AUTO_LOGIN_TIMESTAMP) || '0');
  const now = Date.now();
  return attempted && (now - timestamp < AUTO_LOGIN_COOLDOWN);
}

// 자동 로그인 시도 상태 저장
function markAutoLoginAttempted(attempted) {
  if (attempted) {
    localStorage.setItem(AUTO_LOGIN_FLAG, 'true');
    localStorage.setItem(AUTO_LOGIN_TIMESTAMP, Date.now().toString());
  } else {
    localStorage.removeItem(AUTO_LOGIN_FLAG);
    localStorage.removeItem(AUTO_LOGIN_TIMESTAMP);
  }
  isAutoLoginAttempted = attempted;
}

// 로그아웃 처리
export const handleLogout = () => {
  window.__isLoggingOut = true;
  
  // 로컬 저장소 정리
  localStorage.removeItem('accessToken');
  sessionStorage.removeItem('accessToken');
  localStorage.removeItem('rememberMe');
  markAutoLoginAttempted(false);
  
  // 인증 헤더 제거
  delete instance.defaults.headers.common['Authorization'];
  
  // 로그인 페이지로 리다이렉트
  if (window.location.pathname !== '/login') {
    window.location.href = '/login?expired=true';
  }
  
  window.__isLoggingOut = false;
};

// 세션 만료 상태 초기화
export const resetAuthState = () => {
  markAutoLoginAttempted(false);
};

console.log('axios 인스턴스가 생성되었습니다.');

export default instance;
