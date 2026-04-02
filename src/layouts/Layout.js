import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Menubar from '../components/layout/Menubar';
import './Layout.css';
import Header from '../components/layout/Header';

function Layout({ children }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation(); 
    
    const isDiaryPage = () => {
        return location.pathname.startsWith('/diary');
    };

    return (
        <div className="layout">
            <Header 
                isMenuOpen={isMenuOpen} 
                setIsMenuOpen={setIsMenuOpen}
            />
            <Menubar 
                isOpen={isMenuOpen} 
                setIsOpen={setIsMenuOpen}
                onClose={() => setIsMenuOpen(false)}
            />
            <div className="main-content">
                {!isDiaryPage() && <Sidebar />}
                <div className={`content ${isDiaryPage() ? 'full-width' : ''}`}>
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Layout;
