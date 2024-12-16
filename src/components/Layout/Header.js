import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
    return (
        <header className="header">
            <div className="logo">
                <Link to="/">게시판 프로젝트</Link>
            </div>
            <nav className="nav">
                <ul>
                    <li><Link to="/board">게시판</Link></li>
                    <li><Link to="/login">로그인</Link></li>
                </ul>
            </nav>
        </header>
    );
}

export default Header;
