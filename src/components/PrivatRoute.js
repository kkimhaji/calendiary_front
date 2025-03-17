import React, { useEffect } from 'react';
import { Navigate, useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsAuthenticated, selectIsTeamMember } from '../store/authSlice';
import { updateRoute } from '../store/routerSlice';

// 보호된 라우트 컴포넌트 (팀 멤버만 접근 가능)
const TeamMemberRoute = ({ children }) => {
  const { teamId } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isTeamMember = useSelector((state) => selectIsTeamMember(state, teamId));
  
  // URL 정보 저장 (새로고침 시 복원용)
  useEffect(() => {
    dispatch(updateRoute({
      path: location.pathname,
      params: { teamId },
    }));
  }, [dispatch, location.pathname, teamId]);
  
  // 인증 및 팀 멤버십 확인
  if (!isAuthenticated) {
    // 로그인 페이지로 리다이렉트 (현재 URL 정보 전달)
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (!isTeamMember) {
    // 팀 멤버가 아닌 경우 접근 거부 페이지로 이동
    return <Navigate to="/access-denied" replace />;
  }
  
  return children;
};

export default TeamMemberRoute;
