import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../api/axios';

const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
const rememberMe = localStorage.getItem('rememberMe') === 'true';

const initialState = {
  accessToken: accessToken,
  refreshToken: null,
  isLoggedIn: !!accessToken,
  rememberMe: rememberMe,
  loading: false,
  error: null
};

// 로그인 액션 (비동기)
export const loginUser = createAsyncThunk(
  'auth/authenticate',
  async (loginData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/auth/authenticate', {
        email: loginData.email,
        password: loginData.password,
        rememberMe: loginData.rememberMe
      });
      const { accessToken, refreshToken } = response.data;
      
      // rememberMe에 따라 저장소 선택
      const storage = loginData.rememberMe ? localStorage : sessionStorage;
      storage.setItem('accessToken', accessToken);
      localStorage.setItem('rememberMe', loginData.rememberMe.toString());
      
      // 인증 헤더 설정
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      return { accessToken, refreshToken, rememberMe: loginData.rememberMe };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || '로그인에 실패했습니다.');
    }
  }
);

// 로그아웃 액션 (비동기)
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // 서버에 로그아웃 요청
      await axios.post('/auth/logout');
      
      // 스토리지에서 토큰 제거
      localStorage.removeItem('accessToken');
      sessionStorage.removeItem('accessToken');
      localStorage.removeItem('rememberMe');
      
      // 인증 헤더 제거
      delete axios.defaults.headers.common['Authorization'];
      
      return true;
    } catch (error) {
       // 서버 오류가 있어도 로컬 상태는 정리
       localStorage.removeItem('accessToken');
       sessionStorage.removeItem('accessToken');
       localStorage.removeItem('rememberMe');
       delete axios.defaults.headers.common['Authorization'];
      return rejectWithValue(error.response?.data?.message || '로그아웃에 실패했습니다.');
    }
  }
);

// 토큰 갱신 액션 (비동기)
export const refreshAccessToken = createAsyncThunk(
  'auth/refresh',
  async (_, { getState, rejectWithValue }) => {
    try {
      // 리프레시 토큰은 자동으로 쿠키에서 전송됨
      const response = await axios.post('/auth/refresh-token');
      const { accessToken } = response.data;
      
      // 새 액세스 토큰 저장
      const state = getState().auth;
      const storage = state.rememberMe ? localStorage : sessionStorage;
      storage.setItem('accessToken', accessToken);
      
      // 인증 헤더 업데이트
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      return { accessToken };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || '토큰 갱신에 실패했습니다.');
    }
  }
);

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

      // 스토리지에 저장
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('accessToken', access);
      localStorage.setItem('rememberMe', rememberMe.toString());
      
      // 인증 헤더 설정 (리듀서 외부에서도 처리 필요)
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
      state.rememberMe = false;

      // localStorage와 sessionStorage에서 직접 제거 (사이드 이펙트지만 필요한 경우)
      localStorage.removeItem('accessToken');
      sessionStorage.removeItem('accessToken');
      localStorage.removeItem('rememberMe');

      // 인증 헤더 제거 (리듀서 외부에서도 처리 필요)
      delete axios.defaults.headers.common['Authorization'];
    }
  },
  extraReducers: (builder) => {
    builder
      // 로그인 처리
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isLoggedIn = true;
        state.rememberMe = action.payload.rememberMe;
        state.loading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      
      // 로그아웃 처리
      .addCase(logoutUser.fulfilled, (state) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.isLoggedIn = false;
        state.rememberMe = false;
      })
      
      // 토큰 갱신 처리
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.isLoggedIn = true;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.isLoggedIn = false;
      });
  }
});

// 액션 생성자 내보내기
export const { setCredentials, setLoading, setError, clearCredentials } = authSlice.actions;

// 선택자 함수들
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isLoggedIn;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectRefreshToken = (state) => state.auth.refreshToken;

export default authSlice.reducer;
