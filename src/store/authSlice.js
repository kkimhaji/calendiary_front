import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../api/axios';  // authService 대신 직접 axios 사용

const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
const rememberMe = localStorage.getItem('rememberMe') === 'true';

const initialState = {
  accessToken: accessToken,
  refreshToken: null,
  isLoggedIn: !!accessToken,
  rememberMe: rememberMe,
  loading: false,
  error: null,
  user: null
};

// 로그인 액션
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
      
      // 토큰 저장
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

// 사용자 정보 가져오기 액션
export const fetchUserInfo = createAsyncThunk(
  'auth/fetchUserInfo',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/member/get-info');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || '사용자 정보를 가져오는데 실패했습니다.');
    }
  }
);

// 로그아웃 액션
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    window.__isLoggingOut = true;
    
    try {
      await axios.post('/auth/logout', {}, {
        _skipAuthRetry: true
      });
      
      // 스토리지 정리
      localStorage.removeItem('accessToken');
      sessionStorage.removeItem('accessToken');
      localStorage.removeItem('rememberMe');
      
      // 인증 헤더 제거
      delete axios.defaults.headers.common['Authorization'];
      
      window.__isLoggingOut = false;
      return true;
    } catch (error) {
      // 서버 오류가 있어도 로컬 상태는 정리
      localStorage.removeItem('accessToken');
      sessionStorage.removeItem('accessToken');
      localStorage.removeItem('rememberMe');
      delete axios.defaults.headers.common['Authorization'];
      
      window.__isLoggingOut = false;
      console.error('로그아웃 API 호출 실패:', error);
      return true;
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
      
      // 인증 헤더 설정
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    },
    clearCredentials: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.isLoggedIn = false;
      state.rememberMe = false;
      state.user = null;
      
      // 스토리지 정리
      localStorage.removeItem('accessToken');
      sessionStorage.removeItem('accessToken');
      localStorage.removeItem('rememberMe');
      
      // 인증 헤더 제거
      delete axios.defaults.headers.common['Authorization'];
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
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
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.isLoggedIn = false;
        state.rememberMe = false;
        state.user = null;
        state.loading = false;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.isLoggedIn = false;
        state.rememberMe = false; 
        state.user = null;
        state.loading = false;
      })
      // 사용자 정보 조회
      .addCase(fetchUserInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setCredentials, setLoading, setError, clearCredentials } = authSlice.actions;

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isLoggedIn;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectRefreshToken = (state) => state.auth.refreshToken;

export default authSlice.reducer;
