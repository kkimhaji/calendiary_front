import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage
import authReducer from './authSlice';
import routerReducer from './routerSlice';

// Persist 구성
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'router'], // 유지할 상태
};

const rootReducer = combineReducers({
  auth: authReducer,
  router: routerReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// 스토어 생성
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
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
  
        // 401 에러이고 갱신 시도 중이 아닐 때
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
  
          try {
            // dispatch로 토큰 갱신 액션 호출
            const newAccessToken = await store.dispatch(refreshAccessToken());
  
            if (newAccessToken) {
              // 기존 요청 재시도
              originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            // 리프레시 토큰 만료 시 로그아웃
            store.dispatch(logoutUser());
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
  };
  
  export default store;