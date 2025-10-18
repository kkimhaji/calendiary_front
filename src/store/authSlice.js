import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios, { resetAuthState } from '../api/axios';

const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
const rememberMe = localStorage.getItem('rememberMe') === 'true';

const initialState = {
  accessToken: accessToken,
  refreshToken: localStorage.getItem('refreshToken'),
  isLoggedIn: !!accessToken,
  rememberMe: rememberMe,
  loading: false,
  error: null,
  errorCode: null, // 에러 코드 추가
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
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.setItem('rememberMe', loginData.rememberMe.toString());

      // 인증 헤더 설정
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      // 인증 상태 초기화
      resetAuthState();

      return { accessToken, refreshToken, rememberMe: loginData.rememberMe };
    } catch (error) {
      // 에러 코드와 메시지 모두 반환
      const errorCode = error.response?.data?.code;
      const errorMessage = error.response?.data?.message || '로그인에 실패했습니다.';

      return rejectWithValue({
        code: errorCode,
        message: errorMessage,
        email: loginData.email // 이메일 정보도 함께 전달
      });
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
    try {
      await axios.post('/auth/logout', {}, {
        _skipAuth: true
      });

      // 스토리지 정리
      localStorage.removeItem('accessToken');
      sessionStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('rememberMe');

      // 인증 헤더 제거
      delete axios.defaults.headers.common['Authorization'];

      // 인증 상태 초기화
      resetAuthState();

      return true;
    } catch (error) {
      // 서버 오류가 있어도 로컬 상태는 정리
      localStorage.removeItem('accessToken');
      sessionStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('rememberMe');
      delete axios.defaults.headers.common['Authorization'];
      resetAuthState();

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
      const { accessToken, refreshToken, rememberMe } = action.payload;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isLoggedIn = true;
      state.rememberMe = rememberMe;

      // 스토리지에 저장
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.setItem('rememberMe', rememberMe.toString());

      // 인증 헤더 설정
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    },
    clearCredentials: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.isLoggedIn = false;
      state.rememberMe = false;
      state.user = null;
      state.error = null;
      state.errorCode = null;

      // 스토리지 정리
      localStorage.removeItem('accessToken');
      sessionStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('rememberMe');

      // 인증 헤더 제거
      delete axios.defaults.headers.common['Authorization'];

      // 인증 상태 초기화
      resetAuthState();
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
      state.errorCode = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // 로그인 처리
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorCode = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isLoggedIn = true;
        state.rememberMe = action.payload.rememberMe;
        state.loading = false;
        state.error = null;
        state.errorCode = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload?.message || '로그인에 실패했습니다.';
        state.errorCode = action.payload?.code;
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
        state.error = null;
        state.errorCode = null;
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

export const { setCredentials, setLoading, setError, clearCredentials, clearError } = authSlice.actions;

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isLoggedIn;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectRefreshToken = (state) => state.auth.refreshToken;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthErrorCode = (state) => state.auth.errorCode;

export default authSlice.reducer;