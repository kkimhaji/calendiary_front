import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

    // 토큰 설정 및 검증 함수
    const setAuthToken = (newToken) => {
        if (newToken) {
            localStorage.setItem('token', newToken);
            setToken(newToken);
            // setIsAuthenticated(true);
            // axios 기본 헤더 설정
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        } else {
            localStorage.removeItem('token');
            setToken(null);
            // setIsAuthenticated(false);
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    // 앱 시작 시 토큰 유효성 검사
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            setIsLoggedIn(true);
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
    }, []);

    const login = useCallback((accessToken) => {
        setToken(accessToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        // setIsAuthenticated(true);
        setIsLoggedIn(true);
    }, []);

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        // setIsAuthenticated(false);
        setIsLoggedIn(false);
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ token, isLoggedIn, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
