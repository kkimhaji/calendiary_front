import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/authSlice';

const PrivateRoute = ({ children }) => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const location = useLocation();

    if (!isAuthenticated) {
        return (
            <Navigate
                to={`/login?redirectUrl=${encodeURIComponent(location.pathname + location.search)}`}
                replace
            />
        );
    }

    return children;
};

export default PrivateRoute;