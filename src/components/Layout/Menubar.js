import React from 'react';
import { Link } from 'react-router-dom';
import './Menubar.css';

function Menubar({ isOpen, toggleMenubar }) {
    return (
        <>
            <div className={`menubar ${isOpen ? 'open' : ''}`}>
                <div className="menubar-header">
                    <button className="close-button" onClick={toggleMenubar}>
                        ×
                    </button>
                </div>
                <nav className="menubar-menu">
                    <ul>
                        <li><Link to="/board" onClick={toggleMenubar}>게시판</Link></li>
                        <li><Link to="/notice" onClick={toggleMenubar}>공지사항</Link></li>
                        <li><Link to="/mypage" onClick={toggleMenubar}>마이페이지</Link></li>
                        <li><Link to="/settings" onClick={toggleMenubar}>설정</Link></li>
                    </ul>
                </nav>
            </div>
            {isOpen && <div className="menubar-overlay" onClick={toggleMenubar}></div>}
        </>
    );
}

export default Menubar;
