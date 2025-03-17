import { createSlice } from '@reduxjs/toolkit';

// 현재 라우팅 상태를 저장하는 슬라이스
const routerSlice = createSlice({
  name: 'router',
  initialState: {
    previousPath: '/',
    currentPath: '/',
    params: {}, // URL 파라미터 저장 (teamId 등)
  },
  reducers: {
    updateRoute: (state, action) => {
      state.previousPath = state.currentPath;
      state.currentPath = action.payload.path;
      state.params = action.payload.params || {};
    },
  },
});

export const { updateRoute } = routerSlice.actions;
export const selectCurrentPath = (state) => state.router.currentPath;
export const selectRouteParams = (state) => state.router.params;

export default routerSlice.reducer;
