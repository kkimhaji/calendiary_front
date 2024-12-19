import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
    // 팀 카테고리 예시 데이터
    const categories = [
        { id: 1, name: '일정' },
        { id: 2, name: '게시판' },
        { id: 3, name: '갤러리' },
        { id: 4, name: '팀원 관리' }
    ];

    return (
        <div className="sidebar-fixed">
            <div className="team-info">
                <h2>게시판 프로젝트</h2>
            </div>
            <nav className="category-menu">
                <ul>
                    {categories.map(category => (
                        <li key={category.id}>
                            <Link to={`/${category.name}`}>
                                {category.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}

export default Sidebar;
