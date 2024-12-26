import { useState } from 'react';
import Sidebar from './Sidebar';
import Menubar from './Menubar';
import '../../styles/Layout.css';
import Header from './Header';

function Layout({ children }) {
    const [isMenuOpen, setIsMenuOpen] = useState(true);

    return (
        <div className="layout">
            <Header />
            <div className="main-content">
                <Sidebar />
                <div className="content">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Layout;