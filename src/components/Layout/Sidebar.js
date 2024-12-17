import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ isOpen, toggleSidebar }) {
    return (
        <>
            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <button className="close-button" onClick={toggleSidebar}>
                        ×
                    </button>
                </div>
                <nav className="sidebar-menu">
                    <ul>
                        <li><Link to="/board" onClick={toggleSidebar}>게시판</Link></li>
                        <li><Link to="/notice" onClick={toggleSidebar}>공지사항</Link></li>
                        <li><Link to="/mypage" onClick={toggleSidebar}>마이페이지</Link></li>
                        <li><Link to="/settings" onClick={toggleSidebar}>설정</Link></li>
                    </ul>
                </nav>
            </div>
            {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
        </>
    );
}

export default Sidebar;
