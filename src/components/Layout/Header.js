import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import Menubar from './Menubar';

function Header() {
        const [isOpen, setIsOpen] = useState(false);
    
        const toggleMenubar = () => {
            setIsOpen(!isOpen);
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
                        <li><Link to="/board">게시판</Link></li>
                        <li><Link to="/login">로그인</Link></li>
                    </ul>
                </nav>
            </header>
            <Menubar isOpen={isOpen} setIsOpen={setIsOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}

export default Header;
