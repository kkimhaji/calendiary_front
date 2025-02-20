import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/Sidebar.css';
import { useTeam } from '../../contexts/TeamContext';
import axios from 'axios';

//팀의 카테고리
function Sidebar() {
    const [categories, setCategories] = useState([]);
    const {
        selectedTeamId,
        selectedCategoryId,
        setSelectedCategoryId,
        shouldRefreshCategories, // 갱신 상태 추가
        refreshCategories // 갱신 함수 추가
    } = useTeam();

    const navigate = useNavigate();
    const handleCreateCategory = () => {
        navigate(`/teams/${selectedTeamId}/category/create`);
    };

    useEffect(() => {
        const fetchCategories = async () => {
            if (selectedTeamId) {
                // 선택된 팀의 카테고리 목록 가져오기
                try {
                    const response = await axios.get(`/teams/${selectedTeamId}/categories`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                        }
                    });

                    console.log('API Response:', response.data);

                    setCategories(response.data || []); // 응답이 없을 경우 빈 배열 설정
                } catch (error) {
                    console.error('카테고리 목록 조회 실패: ', error);
                    setCategories([]);
                }
            }
        };

        fetchCategories();

    }, [selectedTeamId, shouldRefreshCategories]);

    const handleCategorySelect = async (categoryId) => {
        await setSelectedCategoryId(categoryId);
        navigate(`/teams/${selectedTeamId}/category/${categoryId}/recent`);
    };

    if (!selectedTeamId) {
        return <div className='sidebar'>
            팀을 선택해주세요
        </div>;
    }

    return (
        <div className="sidebar">
            <h3>카테고리</h3>
            <hr></hr>
            <button
                className="create-category-button"
                onClick={handleCreateCategory}
            >
                카테고리 추가
            </button>
            <nav className="sidebar-category-list">
                <ul>
                    {Array.isArray(categories) && categories.length > 0 ? (
                        categories.map(category => (
                            <li
                                key={category.id}
                                className={`sidebar-category-item ${selectedCategoryId === category.id ? 'selected' : ''}`}
                                onClick={() => handleCategorySelect(category.id)}
                            >
                                {category.name}
                            </li>
                        ))
                    ) : (
                        <li className='sidebar-no-category'>카테고리가 없습니다</li>
                    )}
                </ul>
            </nav>
        </div>
    );
}

export default Sidebar;
