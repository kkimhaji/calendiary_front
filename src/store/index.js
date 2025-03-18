import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer, { refreshAccessToken, logoutUser } from './authSlice';
import routerReducer from './routerSlice';
import axios, {setLogoutCallback} from '../api/axios';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'router'], // 상태 중 'auth', 'router'만 지속
};

const rootReducer = combineReducers({
  auth: authReducer,
  router: routerReducer,
});

setLogoutCallback(() => {
  store.dispatch(logoutUser());
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

// Axios 토큰 갱신 인터셉터 설정 함수
export const setupAxiosInterceptors = (axios) => {
  if (!axios || !axios.interceptors) {
    console.error('유효한 axios 인스턴스가 전달되지 않았습니다');
    return;
  }
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // 401 에러이고 갱신 시도 중이 아닐 때
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // dispatch로 토큰 갱신 액션 호출
          await store.dispatch(refreshAccessToken());
          
          // 기존 요청 재시도
          const newToken = store.getState().auth.accessToken;
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return axios(originalRequest);
        } catch (refreshError) {
          // 리프레시 토큰 만료 시 로그아웃
          await store.dispatch(logoutUser());
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );
};

export default store;
