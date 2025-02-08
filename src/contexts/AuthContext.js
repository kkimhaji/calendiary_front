import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
    const [isLoggedIn, setIsLoggedIn] = useState(false);


    // 토큰 설정 함수 수정
    const setAuthTokens = useCallback(({ access, refresh, rememberMe }) => {
        const storage = rememberMe ? localStorage : sessionStorage;

        if (access) {
            storage.setItem('accessToken', access);
            setAccessToken(access);
            axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        }
        if (rememberMe && refresh) {
            localStorage.setItem('refreshToken', refresh);
            setRefreshToken(refresh);
        }
        setIsLoggedIn(!!access);
    }, []);

    // // 토큰 설정 및 검증 함수
    // const setAuthToken = (newToken) => {
    //     if (newToken) {
    //         localStorage.setItem('accessToken', newToken);
    //         setAccessToken(newToken);
    //         // setIsAuthenticated(true);
    //         // axios 기본 헤더 설정
    //         axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    //     } else {
    //         localStorage.removeItem('accessToken');
    //         setAccessToken(null);
    //         // setIsAuthenticated(false);
    //         delete axios.defaults.headers.common['Authorization'];
    //     }
    // };

    // 초기 로드 시 토큰 검증
    useEffect(() => {
        const verifyToken = async () => {
            try {
                if (accessToken) {
                    await axios.get('/api/auth/validate');
                    setIsLoggedIn(true);
                }
            } catch (error) {
                clearAuthTokens();
            }
        };
        verifyToken();
    }, [accessToken]);

    // 앱 시작 시 토큰 유효성 검사
    useEffect(() => {
        // const storedToken = localStorage.getItem('accessToken');
        // if (storedToken) {
        //     setAccessToken(storedToken);
        //     setIsLoggedIn(true);
        //     axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        // }

        const interceptor = axios.interceptors.response.use(
            response => response,
            async error => {
                const originalRequest = error.config;

                // 401 에러이고 갱신 시도 중이 아닐 때
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        // 리프레시 토큰으로 새로운 액세스 토큰 요청
                        const response = await axios.post('/api/auth/refresh', {}, {
                            headers: {
                                'Authorization': `Bearer ${refreshToken}`
                            }
                        });

                        const { accessToken: newAccess, refreshToken: newRefresh } = response.data;

                        // 새 토큰 저장
                        setAuthTokens({ access: newAccess, refresh: newRefresh });

                        // 기존 요청 재시도
                        originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
                        return axios(originalRequest);
                    } catch (refreshError) {
                        // 리프레시 토큰도 만료된 경우 로그아웃
                        clearAuthTokens();
                        window.location.href = '/login';
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            });
        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [refreshToken, setAuthTokens]);

    const login = useCallback((accessToken) => {
        setAccessToken(accessToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        // setIsAuthenticated(true);
        setIsLoggedIn(true);
    }, []);


    // 로그아웃 시 처리
    const clearAuthTokens = () => {
        [localStorage, sessionStorage].forEach(storage => {
            storage.removeItem('accessToken');
            storage.removeItem('refreshToken');
        });
        setAccessToken(null);
        setRefreshToken(null);
        delete axios.defaults.headers.common['Authorization'];
        setIsLoggedIn(false);
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        setAccessToken(null);
        // setIsAuthenticated(false);
        setIsLoggedIn(false);
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{
            accessToken,
            refreshToken,
            isLoggedIn,
            setAuthTokens,
            logout: clearAuthTokens }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
