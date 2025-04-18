import React from 'react';
import { useNavigate } from 'react-router-dom';

const CategoryActions = ({ teamId, categoryId, onDeleteClick, hasPermission }) => {
  const navigate = useNavigate();

  if (!hasPermission) return null;

  return (
    <div className="category-actions">
      <button
        className="btn-edit"
        onClick={() => navigate(`/teams/${teamId}/categories/${categoryId}/edit`)}
      >
        카테고리 수정
      </button>
      <button 
        className="btn-delete"
        onClick={onDeleteClick}
      >
        카테고리 삭제
      </button>
    </div>
  );
};

export default CategoryActions;
