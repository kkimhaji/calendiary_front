import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import '../styles/CategoryInfo.css';

const CategoryInfo = () => {
    const { teamId, categoryId } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasManageCategoryPermission, setHasManageCategoryPermission] = useState(false);

    useEffect(() => {
        const checkPermission = async () => {
            try {
                const response = await axios.get('/permission-check', {
                    params: {
                        permission: 'MANAGE_CATEGORIES',
                        targetId: teamId
                    }});
                setHasManageCategoryPermission(response.data);
                console.log("categoryPermission: ", response.data);
            } catch (err) {
                console.error('권한 확인 실패:', err);
            }
        };
        checkPermission();
    }, [categoryId]);
    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const response = await axios.get(`/teams/${teamId}/categories/${categoryId}`);
                console.log("category info: ", response);
                setCategory(response.data);
            } catch (err) {
                setError('카테고리 정보를 불러오는데 실패했습니다');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCategory();
    }, [teamId, categoryId]);

    if (loading) return <div className="loading">로딩 중...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="category-info-container">
            <div className="category-header">
                <h1>{category.name}</h1>
<div className="button-group">
                    {/* ✅ 수정 버튼 추가 */}
                    {hasManageCategoryPermission && (
                        <button 
                            className="btn-edit"
                            onClick={() => navigate(`/teams/${teamId}/categories/${categoryId}/edit`)}
                        >
                            카테고리 수정
                        </button>
                    )}
                    <button 
                        className="btn-back"
                        onClick={() => navigate(-1)}
                    >
                        글 목록
                    </button>
                    </div>
            </div>
            
            <div className="category-content">
                <div className="description-section">
                    <h3>설명</h3>
                    <p>{category.description || '설명이 없습니다'}</p>
                </div>

                <div className="permissions-section">
                    <h3>역할별 권한 설정</h3>
                    <ul className="role-permission-list">
                        {category.rolePermissions.map(permission => (
                            <li key={permission.id} className="role-item">
                                <div className="role-header">
                                    <span className="role-name">{permission.roleName}</span>
                                </div>
                                <div className="permission-tags">
                                    {Array.from(permission.permissions).map((perm, idx) => (
                                        <span key={idx} className="permission-tag">
                                            {perm}
                                        </span>
                                    ))}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CategoryInfo;
