import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';
import { useTeam } from '../../contexts/TeamContext';

function Sidebar() {
    const {selectedTeam, categories, setCategories} = useTeam();

    useEffect(() =>{
        fetch(`/teams/${selectedTeam}/categories`)
        .then(res => res.json())
        .then(data => setCategories(data))
        .catch(error => {
            console.error('카테고리를 불러오는 데에 실패했습니다.: ', error);
            setCategories([])
        })
    }, [selectedTeam, setCategories]);

    if (!selectedTeam){
        return <div className='sidebar'>
            팀을 선택해주세요
        </div>;
    }

    return (
        <div className="sidebar-fixed">
            <div className="team-info">
                <h2>게시판 프로젝트</h2>
            </div>
            <nav className="category-list">
                <ul>
                    {categories.map(category => (
                        <li key={category.id} className="category-item">
                            <Link to={`/${category.id}`}>
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
