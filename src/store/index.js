import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer, { refreshAccessToken, logoutUser, setLoading } from './authSlice';
import routerReducer from './routerSlice';
import instance from '../api/axios';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'router'], // 상태 중 'auth', 'router'만 지속
};

const rootReducer = combineReducers({
  auth: authReducer,
  router: routerReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export const forceLogout = async () => {
  try {
    window.__isLoggingOut = true;
    store.dispatch(setLoading(false));
    localStorage.clear();
    sessionStorage.clear();
    await store.dispatch(logoutUser());
  } catch (err) {
    console.error('로그아웃 처리 중 오류:', err);
  } finally {
    window.location.replace('/login?expired=true');
  }
};

// Axios 토큰 갱신 인터셉터 설정 함수
export const setupAxiosInterceptors = (axiosInstance = instance) => {

  if (!axiosInstance || !axiosInstance.interceptors){
    console.error('유효한 axios 인스턴스가 전달되지 않았습니다');
    return;
  }

  axiosInstance.interceptors.response.use(
    response => response,
    async (error) => {
      const originalRequest = error.config;
  
      if (window.isLoggingOut) {
        return Promise.reject(error);
      }
  
      const status = error.response?.status;
      const url = originalRequest?.url || '';
  
      // 1) 로그인, 회원가입, 비밀번호 관련 요청은 여기서 바로 반환 (전역 로그아웃/리다이렉트 금지)
      const isAuthEndpoint =
        url.includes('/auth/authenticate') ||
        url.includes('/auth/register') ||
        url.includes('/auth/verify') ||
        url.includes('/auth/get-temp-password') ||
        url.includes('/auth/resend-verification');
  
      if (status === 401 && isAuthEndpoint) {
        // 단순히 호출한 곳(Login.js 등)이 에러를 처리하도록 넘긴다
        return Promise.reject(error);
      }
  
      // 2) 리프레시 토큰 재발급 요청에서 401 → 강제 로그아웃 + expired=true
      if (status === 401 && url.includes('/auth/refresh-token')) {
        if (!originalRequest.retry) {
          originalRequest.retry = true;
          window.isLoggingOut = true;
          store.dispatch(setLoading(false));
          try {
            await store.dispatch(logoutUser());
          } catch (e) {
            console.error('Logout failed after refresh-token 401:', e);
          } finally {
            localStorage.clear();
            sessionStorage.clear();
            window.location.replace('login?expired=true');
          }
        }
        return Promise.reject(error);
      }
  
      // 3) 그 외 401 → 엑세스 토큰 만료로 보고 리프레시 토큰 플로우 실행 (기존 로직 유지)
      if (status === 401 && !originalRequest.retry) {
        originalRequest.retry = true;
        try {
          await store.dispatch(refreshAccessToken());
          const newToken = store.getState().auth.accessToken;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }
  
      return Promise.reject(error);
    }
  );
};
try {
  setupAxiosInterceptors();
} catch (e) {
  console.error('인터셉터 설정 중 오류:', e);
}

export default store;
