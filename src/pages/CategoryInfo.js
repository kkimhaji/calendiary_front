import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import '../styles/InfoLayout.css';
import InfoLayout from '../components/layout/InfoLayout';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { usePermissions } from '../hooks/usePermissions';
// 카테고리 전용 컴포넌트
import CategoryActions from '../components/category/CategoryActions';
import CategoryPermissions from '../components/category/CategoryPermissions';

const CategoryInfo = () => {
  const { teamId, categoryId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // 권한 확인 커스텀 훅 사용
  const { hasPermission: hasManageCategoryPermission } = usePermissions('MANAGE_CATEGORIES', teamId);

  // 카테고리 정보 로드
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

  // 카테고리 삭제 처리
  const handleDeleteCategory = async () => {
    setDeleteLoading(true);
    setDeleteError('');

    try {
      await axios.delete(`/teams/${teamId}/categories/${categoryId}/delete`);
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

  // 공통 레이아웃 사용
  return (
    <>
      <InfoLayout
        title={category?.name}
        actionButtons={
          <CategoryActions
            teamId={teamId}
            categoryId={categoryId}
            onDeleteClick={() => setShowDeleteModal(true)}
            hasPermission={hasManageCategoryPermission}
          />
        }
        description={category?.description}
        loading={loading}
        error={error}
        onBackClick={() => navigate(`/teams/${teamId}/category/${categoryId}/recent`)}
      >
        {category && <CategoryPermissions rolePermissions={category.rolePermissions} />}
      </InfoLayout>

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <DeleteConfirmModal
          title="카테고리 삭제"
          entityName={category?.name}
          warningText="이 작업은 되돌릴 수 없으며, 카테고리 내 게시글이 있는 경우 삭제할 수 없습니다."
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteCategory}
          isLoading={deleteLoading}
          error={deleteError}
        />
      )}
    </>
  );
};

export default CategoryInfo;
