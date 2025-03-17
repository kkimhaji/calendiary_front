import { createSlice } from '@reduxjs/toolkit';
import axios from '../api/axios';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    token: null,
    user: null,
    teamMemberships: [], // 사용자가 속한 팀 정보
  },
  reducers: {
    setCredentials: (state, action) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    setTeamMemberships: (state, action) => {
      state.teamMemberships = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.teamMemberships = [];
    },
  },
});

export const { setCredentials, setTeamMemberships, logout } = authSlice.actions;

// 선택자 함수들
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectToken = (state) => state.auth.token;
export const selectTeamMemberships = (state) => state.auth.teamMemberships;

// 특정 팀의 멤버인지 확인하는 선택자
export const selectIsTeamMember = (state, teamId) => {
  return state.auth.teamMemberships.some(
    (membership) => membership.teamId === parseInt(teamId)
  );
};

export default authSlice.reducer;
