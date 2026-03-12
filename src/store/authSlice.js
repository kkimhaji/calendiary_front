import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios, { resetAuthState } from '../api/axios';

const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

const initialState = {
  accessToken: accessToken || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  isLoggedIn: !!accessToken,
  loading: false,
  error: null,
  errorCode: null,
  user: null,
};

export const loginUser = createAsyncThunk(
  'auth/authenticate',
  async (loginData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/auth/authenticate', {
        email: loginData.email,
        password: loginData.password,
      });
      const { accessToken, refreshToken } = response.data;

      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      resetAuthState();

      return { accessToken, refreshToken };
    } catch (error) {
      return rejectWithValue({
        code: error.response?.data?.code,
        message: error.response?.data?.message || '로그인에 실패했습니다.',
        email: loginData.email,
      });
    }
  }
);

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

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    try {
      await axios.post('/auth/logout', {}, { _skipAuth: true });
    } catch {
      // 서버 오류 무시
    } finally {
      localStorage.removeItem('accessToken');
      sessionStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      delete axios.defaults.headers.common['Authorization'];
      resetAuthState();
    }
    return true;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { accessToken, refreshToken } = action.payload;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isLoggedIn = true;
      if (accessToken) localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    },
    clearCredentials: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.isLoggedIn = false;
      state.user = null;
      state.error = null;
      state.errorCode = null;
    },
    setLoading: (state, action) => { state.loading = action.payload; },
    setError: (state, action) => { state.error = action.payload; },
    clearError: (state) => { state.error = null; state.errorCode = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorCode = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isLoggedIn = true;
        state.loading = false;
        state.error = null;
        state.errorCode = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoggedIn = false;
        state.loading = false;
        state.error = action.payload?.message || '로그인에 실패했습니다.';
        state.errorCode = action.payload?.code || null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.isLoggedIn = false;
        state.user = null;
        state.loading = false;
        state.error = null;
        state.errorCode = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.isLoggedIn = false;
        state.user = null;
        state.loading = false;
      })
      .addCase(fetchUserInfo.pending, (state) => { state.loading = true; })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserInfo.rejected, (state) => { state.loading = false; });
  },
});

export const { setCredentials, setLoading, setError, clearCredentials, clearError } = authSlice.actions;

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isLoggedIn;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectRefreshToken = (state) => state.auth.refreshToken;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthErrorCode = (state) => state.auth.errorCode;

export default authSlice.reducer;