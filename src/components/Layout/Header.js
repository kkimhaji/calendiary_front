import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import Menubar from './Menubar';
import { useAuth } from '../../contexts/AuthContext';

function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const { isLoggedIn, logout } = useAuth();
    const navigate = useNavigate();

    const toggleMenubar = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    }

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
