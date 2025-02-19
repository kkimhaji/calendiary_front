import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [rememberMe, setRememberMe] = useState(
        localStorage.getItem('rememberMe') === 'true'
    );

    // 토큰 설정 함수 수정
    const setAuthTokens = useCallback(({ access, refresh, rememberMe }) => {
        const storage = rememberMe ? localStorage : sessionStorage;
        const accessStorage = rememberMe ? localStorage : sessionStorage;
        const refreshStorage = rememberMe ? localStorage : sessionStorage;
        
        accessStorage.setItem('accessToken', access);
        refreshStorage.setItem('refreshToken', refresh);
        localStorage.setItem('rememberMe', rememberMe.toString());

        setAccessToken(access);
        setRefreshToken(refresh);
        setRememberMe(rememberMe);
        setIsLoggedIn(true);
        axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    }, []);

         // 토큰 자동 갱신 로직
    const refreshAccessToken = useCallback(async () => {
        try {
            const response = await axios.post('/auth/reissue', {
                refreshToken: refreshToken
            }, {
                headers: {
                    'Authorization': `Bearer ${refreshToken}`
                }
            });

            const { accessToken: newAccess, refreshToken: newRefresh } = response.data;

            // 새로운 토큰 저장
            const storage = rememberMe ? localStorage : sessionStorage;
            storage.setItem('accessToken', newAccess);
            storage.setItem('refreshToken', newRefresh);

            setAccessToken(newAccess);
            setRefreshToken(newRefresh);
            axios.defaults.headers.common['Authorization'] = `Bearer ${newAccess}`;

            return newAccess;
        } catch (error) {
            clearAuthTokens();
            return null;
        }
    }, [refreshToken, rememberMe]);
        // 초기 토큰 검증 + 자동 갱신
        const verifyToken = useCallback(async () => {
            if (!accessToken) return;
    
            try {
                // 1. 액세스 토큰 검증
                await axios.get('/auth/validate', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                setIsLoggedIn(true);
            } catch (error) {
                // 2. 액세스 토큰 만료 시 리프레시 토큰으로 갱신 시도
                if (error.response?.status === 401) {
                    const newAccessToken = await refreshAccessToken();
                    if (newAccessToken) {
                        setIsLoggedIn(true);
                    } else {
                        clearAuthTokens();
                    }
                }
            }
        }, [accessToken, refreshAccessToken]);

    // 초기 로드 시 토큰 검증
    useEffect(() => {
        verifyToken();
    }, [verifyToken]);

    // 앱 시작 시 토큰 유효성 검사
    useEffect(() => {

        const interceptor = axios.interceptors.response.use(
            response => response,
            async error => {
                const originalRequest = error.config;

                // 401 에러이고 갱신 시도 중이 아닐 때
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        // 리프레시 토큰으로 새로운 액세스 토큰 요청
                        const response = await axios.post('/auth/reissue', {}, {
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
        localStorage.setItem('accessToken', accessToken);
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

    const logout = async () => {
        try {
            // 1. 서버에 로그아웃 요청 (Refresh Token 전송)
            await axios.post('/auth/logout', {
                refreshToken: localStorage.getItem('refreshToken')
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
    
            // 2. 클라이언트 토큰 삭제
            [localStorage, sessionStorage].forEach(storage => {
                storage.removeItem('accessToken');
                storage.removeItem('refreshToken');
            });
            
            // 3. 상태 초기화
            setAccessToken(null);
            setRefreshToken(null);
            delete axios.defaults.headers.common['Authorization'];
            setIsLoggedIn(false);
            
            // 4. 홈으로 이동
            window.location.href = '/';
        } catch (error) {
            console.error('로그아웃 실패:', error);
            alert('로그아웃 처리 중 오류가 발생했습니다.');
        }
    };

    return (
        <AuthContext.Provider value={{
            accessToken,
            refreshToken,
            isLoggedIn,
            setAuthTokens,
            login,
            logout: clearAuthTokens }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
