import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/Header.css';
import Menubar from './Menubar';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsAuthenticated, logoutUser, clearCredentials, fetchUserInfo, selectCurrentUser } from '../../store/authSlice';
import { persistor } from '../../store';
import axios from '../../api/axios';

function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const isLoggedIn = useSelector(selectIsAuthenticated);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const currentUser = useSelector(selectCurrentUser);

    // 컴포넌트 마운트 시 사용자 정보 가져오기
    useEffect(() => {
        if (isLoggedIn && (!currentUser || !currentUser.nickname)) {
            dispatch(fetchUserInfo());
        }
    }, [isLoggedIn, currentUser, dispatch]);

    const toggleMenubar = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = () => {
        try {
            // 1. 직접 로컬/세션 스토리지에서 토큰 제거
            localStorage.removeItem('accessToken');
            sessionStorage.removeItem('accessToken');
            
            // 2. Redux 상태 초기화 (동기적으로 먼저 처리)
            dispatch(clearCredentials());
            
            // 3. 로컬 스토리지의 Redux 상태 초기화
            persistor.purge();
            
            // 4. 서버 로그아웃 요청 (백그라운드로 처리)
            dispatch(logoutUser()).catch(error => {
                console.error('서버 로그아웃 요청 실패:', error);
                // 실패해도 UI는 이미 로그아웃 상태
            });
            
            // 5. 로그인 페이지로 리다이렉트
            navigate('/login');
        } catch (error) {
            console.error('로그아웃 처리 중 오류 발생:', error);
            alert('로그아웃 처리 중 오류가 발생했습니다.');
        }
    };


    const handleAuth = () => {
        if (isLoggedIn) {
            handleLogout();
        } else {
            navigate('/login');
        }
    };
    return (
        <>
            <header className="header">
                <div className='header-left'>
                    <button className={`menu-button ${isOpen ? 'active' : ''}`} onClick={toggleMenubar}>
                        <span className='menu-icon'></span>
                    </button>
                    <div className="logo">
                        <Link to="/">게시판 프로젝트</Link>
                    </div>
                </div>
                <nav className="nav">
                    <ul>
                    {isLoggedIn && (
                        <li>
                            <Link to="/account" className='user-nickname-link'>
                            {currentUser?.nickname ? `${currentUser.nickname}님` : '사용자님'}
                            </Link>
                        </li>
                        )}
                        <li>
                            <button
                                onClick={handleAuth}
                                className='property'
                            >
                                {isLoggedIn ? '로그아웃' : '로그인'}
                            </button>
                        </li>
                    </ul>
                </nav>
            </header>
            <Menubar isOpen={isOpen} setIsOpen={setIsOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}

export default Header;
