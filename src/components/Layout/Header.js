import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import Sidebar from './Sidebar';

function Header() {
        const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
        const toggleSidebar = () => {
            setIsSidebarOpen(!isSidebarOpen);
        };

    return (
        <>
            <header className="header">
                <div className='header-left'>
                    <button className='menu-button' onClick={toggleSidebar}>
                        <span className='menu-icon'></span>
                    </button>
                    <div className="logo">
                        <Link to="/">게시판 프로젝트</Link>
                    </div>
                </div>
                <nav className="nav">
                    <ul>
                        <li><Link to="/board">게시판</Link></li>
                        <li><Link to="/login">로그인</Link></li>
                    </ul>
                </nav>
            </header>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        </>
    );
}

export default Header;
