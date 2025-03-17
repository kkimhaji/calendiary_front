import { createSlice } from '@reduxjs/toolkit';
import axios from '../api/axios';

const initialState = {
    accessToken: null,
    refreshToken: null,
    isLoggedIn: false,
    rememberMe: false,
    loading: false,
    error: null
  };
  
  const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
      setCredentials: (state, action) => {
        const { access, refresh, rememberMe } = action.payload;
        state.accessToken = access;
        state.refreshToken = refresh;
        state.isLoggedIn = true;
        state.rememberMe = rememberMe;
        
        // Axios 헤더 설정 (리듀서 외부에서 처리해야 함)
        axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      },
      setLoading: (state, action) => {
        state.loading = action.payload;
      },
      setError: (state, action) => {
        state.error = action.payload;
      },
      clearCredentials: (state) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.isLoggedIn = false;
        
        // Axios 헤더 제거 (리듀서 외부에서 처리해야 함)
        delete axios.defaults.headers.common['Authorization'];
      }
    }
  });
  
  // 액션 생성자 내보내기
  export const { setCredentials, setLoading, setError, clearCredentials } = authSlice.actions;
  
  // 사용자 로그인 비동기 액션
  export const loginUser = (loginData) => async (dispatch) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const response = await axios.post('/auth/authenticate', loginData);
      const { accessToken, refreshToken } = response.data;
      
      // 자격 증명 저장
      dispatch(setCredentials({
        access: accessToken,
        refresh: refreshToken,
        rememberMe: loginData.rememberMe
      }));
      
      // 스토리지에 토큰 저장 (Redux Persist와 별개로)
      const storage = loginData.rememberMe ? localStorage : sessionStorage;
      storage.setItem('accessToken', accessToken);
      storage.setItem('refreshToken', refreshToken);
      localStorage.setItem('rememberMe', loginData.rememberMe.toString());
      
      return { success: true };
    } catch (error) {
      dispatch(setError('로그인에 실패했습니다. 다시 시도해 주세요.'));
      return { success: false, error };
    } finally {
      dispatch(setLoading(false));
    }
  };
  
  // 로그아웃 액션
  export const logoutUser = () => async (dispatch, getState) => {
    try {
      const { refreshToken } = getState().auth;
      
      // 서버에 로그아웃 요청
      await axios.post('/auth/logout', { refreshToken }, {
        headers: {
          'Authorization': `Bearer ${getState().auth.accessToken}`
        }
      });
    } catch (error) {
      console.error('로그아웃 실패:', error);
    } finally {
      // 로컬 스토리지 정리
      [localStorage, sessionStorage].forEach(storage => {
        storage.removeItem('accessToken');
        storage.removeItem('refreshToken');
      });
      localStorage.removeItem('rememberMe');
      
      // 상태 정리
      dispatch(clearCredentials());
    }
  };
  
  // 리프레시 토큰 갱신 액션
  export const refreshAccessToken = () => async (dispatch, getState) => {
    try {
      const state = getState().auth;
      
      const response = await axios.post('/auth/reissue', {
        refreshToken: state.refreshToken
      }, {
        headers: {
          'Authorization': `Bearer ${state.refreshToken}`
        }
      });
      
      const { accessToken: newAccess, refreshToken: newRefresh } = response.data;
      
      // 새 토큰 저장
      dispatch(setCredentials({
        access: newAccess,
        refresh: newRefresh,
        rememberMe: state.rememberMe
      }));
      
      // 스토리지 업데이트
      const storage = state.rememberMe ? localStorage : sessionStorage;
      storage.setItem('accessToken', newAccess);
      storage.setItem('refreshToken', newRefresh);
      
      return newAccess;
    } catch (error) {
      dispatch(clearCredentials());
      return null;
    }
  };
  
  // 선택자 함수들
  export const selectCurrentUser = (state) => state.auth.user;
  export const selectIsAuthenticated = (state) => state.auth.isLoggedIn;
  export const selectAccessToken = (state) => state.auth.accessToken;
  export const selectRefreshToken = (state) => state.auth.refreshToken;
  
  export default authSlice.reducer;