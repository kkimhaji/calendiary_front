export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token;
};

export const logout = () => {
    localStorage.removeItem('token');
    // 필요한 경우 다른 저장된 사용자 정보도 제거
};
