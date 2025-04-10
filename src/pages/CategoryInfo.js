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
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    useEffect(() => {
        const checkPermission = async () => {
            try {
                const response = await axios.get('/permission-check', {
                    params: {
                        permission: 'MANAGE_CATEGORIES',
                        targetId: teamId
                    }
                });
                setHasManageCategoryPermission(response.data);
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

    const handleDeleteCategory = async () => {
        setDeleteLoading(true);
        setDeleteError('');

        try {
            // DELETE 요청 보내기
            await axios.delete(`/teams/${teamId}/categories/${categoryId}/delete`);

            // 삭제 성공 후 팀 정보 페이지로 이동
            navigate(`/teams/${teamId}/info`, {
                state: { message: "카테고리가 성공적으로 삭제되었습니다." }
            });
        } catch (err) {
            console.error("카테고리 삭제 실패:", err);

            if (err.response?.status === 403) {
                setDeleteError("카테고리를 삭제할 권한이 없습니다.");
            } else if (err.response?.status === 409) {
                setDeleteError("이 카테고리에 게시글이 있어 삭제할 수 없습니다.");
            } else {
                setDeleteError("카테고리 삭제 중 오류가 발생했습니다.");
            }
        } finally {
            setDeleteLoading(false);
        }
    };

    if (loading) return <div className="loading">로딩 중...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="category-info-container">
            <div className="category-header">
                <h1>{category.name}</h1>
                <div className="category-button-group">
                    {hasManageCategoryPermission && (
                         <div className="category-actions">
                         <button
                             className="btn-edit"
                             onClick={() => navigate(`/teams/${teamId}/categories/${categoryId}/edit`)}
                         >
                             카테고리 수정
                         </button>
                         
                         <button 
                             className="btn-delete"
                             onClick={() => setShowDeleteModal(true)}
                         >
                             카테고리 삭제
                         </button>
                     </div>
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

            {showDeleteModal && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h3>카테고리 삭제</h3>
            <p>
              정말로 <strong>{category.name}</strong> 카테고리를 삭제하시겠습니까?
            </p>
            <p className="warning-text">
              이 작업은 되돌릴 수 없으며, 카테고리 내 게시글이 있는 경우 삭제할 수 없습니다.
            </p>
            
            {deleteError && <div className="error-message">{deleteError}</div>}
            
            <div className="modal-buttons">
              <button
                className="cancel-button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
              >
                취소
              </button>
              <button
                className="delete-confirm-button"
                onClick={handleDeleteCategory}
                disabled={deleteLoading}
              >
                {deleteLoading ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
    );
};

export default CategoryInfo;
