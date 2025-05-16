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
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 이미 로그아웃 처리 중인지 확인
    if (window.__isLoggingOut) {
      return Promise.reject(error);
    }

    // 401 에러 처리
    if (error.response?.status === 401) {

      await forceLogout();
      // 리프레시 토큰 요청 자체가 실패한 경우 - 즉시 로그아웃
    //   if (originalRequest.url?.includes('/auth/refresh-token') || originalRequest._retry) {
    //     window.__isLoggingOut = true;
        
    //     // 로딩 상태 해제
    //     store.dispatch(setLoading(false));
        
    //     // 로그아웃 처리
    //     try {
    //       await store.dispatch(logoutUser());
    //     } catch (e) {
    //       console.error('로그아웃 액션 디스패치 실패:', e);
    //     } finally {
    //       // 로컬 스토리지 직접 정리 (안전장치)
    //       localStorage.clear();
    //       sessionStorage.clear();
          
    //       // 로그인 페이지로 강제 이동
    //       window.location.replace('/login?expired=true');
    //     }
        
    //     return Promise.reject(error);
    //   }
      
    //   // 일반 401 오류 - 리프레시 시도
    //   if (!originalRequest._retry) {
    //     originalRequest._retry = true;
        
    //     try {
    //       await store.dispatch(refreshAccessToken());
          
    //       // 새 토큰으로 원래 요청 재시도
    //       const newToken = store.getState().auth.accessToken;
    //       originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
    //       return axiosInstance(originalRequest);
    //     } catch (refreshError) {
    //       // 리프레시 실패 - 위 로직으로 처리됨
    //       return Promise.reject(refreshError);
    //     }
    //   }
    // }
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
