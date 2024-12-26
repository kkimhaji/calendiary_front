import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';
import { useTeam } from '../../contexts/TeamContext';
import axios from 'axios';

//팀의 카테고리
function Sidebar() {
    const { categories, setCategories } = useTeam();
    const {
        selectedTeamId,
        selectedCategoryId,
        setSelectedCategoryId
    } = useTeam();

    const fetchCategories = async (teamId) => {
        try {
            const response = await axios.get(`/api/teams/${teamId}/categories`);
            setCategories(response.data);
        } catch (error) {
            console.error('카테고리 목록 조회 실패:', error);
        }
    };

    useEffect(() => {
        const fetchCategories = async () => {
            //     fetch(`/teams/${selectedTeam}/categories`)
            //         .then(res => res.json())
            //         .then(data => setCategories(data))
            //         .catch(error => {
            //             console.error('카테고리를 불러오는 데에 실패했습니다.: ', error);
            //             setCategories([])
            //         })
            // }, [selectedTeam, setCategories]);
            if (selectedTeamId) {
                // 선택된 팀의 카테고리 목록 가져오기
                try {
                    const response = await axios.get(`/teams/${selectedTeamId}/categories`);
                    setCategories(response.data);
                } catch (error) {
                    console.error('카테고리 목록 조회 실패: ', error);
                    setCategories([]);
                }
            }
        };

        fetchCategories();

    }, [selectedTeamId]);

    const handleCategorySelect = (categoryId) => {
        setSelectedCategoryId(categoryId);
    };

    if (!selectedTeamId) {
        return <div className='sidebar'>
            팀을 선택해주세요
        </div>;
    }

    return (
        //     <div className="sidebar-fixed">
        //         <div className="team-info">
        //             <h2>게시판 프로젝트</h2>
        //         </div>
        //         <nav className="category-list">
        //             <ul>
        //                 {categories.map(category => (
        //                     <li key={category.id} className="category-item">
        //                         <Link to={`/${category.id}`}>
        //                             {category.name}
        //                         </Link>
        //                     </li>
        //                 ))}
        //             </ul>
        //         </nav>
        //     </div>
        // );
        <div className="sidebar">
            <h3>카테고리</h3>
            <nav className="category-list">
                <ul>
                    {categories.map(category => (
                        <li
                            key={category.id}
                            className={selectedCategoryId === category.id ? 'selected' : ''}
                            onClick={() => handleCategorySelect(category.id)}
                        >
                            {category.name}
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}

export default Sidebar;
