import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState(!!token);

      // 토큰 설정 및 검증 함수
      const setAuthToken = (newToken) => {
        if (newToken) {
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setIsAuthenticated(true);
            // axios 기본 헤더 설정
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        } else {
            localStorage.removeItem('token');
            setToken(null);
            setIsAuthenticated(false);
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    // 앱 시작 시 토큰 유효성 검사
    useEffect(() => {
        // const validateToken = async () => {
        //     const storedToken = localStorage.getItem('token');
        //     if (storedToken) {
        //         try {
        //             // 토큰 유효성 검사 API 호출
        //             await axios.get('/auth/validate', {
        //                 headers: { Authorization: `Bearer ${storedToken}` }
        //             });
        //             setAuthToken(storedToken);
        //         } catch (error) {
        //             setAuthToken(null);
        //         }
        //     }
        // };
        // validateToken();
        const storedToken = localStorage.getItem('accessToken');
        if (storedToken) {
            setToken(storedToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
    }, []);

    const login = useCallback((accessToken) => {
        setToken(accessToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    }, []);
    // const login = (accessToken) => {
    //     localStorage.setItem('token', accessToken);
    //     setToken(accessToken);
    //     setIsAuthenticated(true);
    // };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ token, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
