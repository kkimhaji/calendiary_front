import React, { useEffect } from 'react';
import { Navigate, useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsAuthenticated, selectIsTeamMember } from '../store/authSlice';

const PrivateRoute = ({ children }) => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const location = useLocation();
    
    if (!isAuthenticated) {
      // 현재 URL을 쿼리 파라미터로 포함시켜 로그인 페이지로 리다이렉트
      return <Navigate to={`/login?redirectUrl=${encodeURIComponent(location.pathname + location.search)}`} replace />;
    }
    
    return children;
  };
  
  export default PrivateRoute;