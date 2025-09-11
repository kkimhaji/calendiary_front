import React from 'react';
import { useNavigate } from 'react-router-dom';
import './InfoLayout.css';
import '../components/Buttons.css';

const InfoLayout = ({
  title,
  actionButtons,
  description,
  children,
  loading,
  error,
  onBackClick
}) => {
  const navigate = useNavigate();

  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="info-container">
      <div className="info-header">
        <h1>{title}</h1>
        <div className="info-button-group">
          {actionButtons}
          {onBackClick && (
            <button
              className="btn-back"
              onClick={onBackClick || (() => navigate(-1))}
            >
              돌아가기
            </button>
          )}
        </div>
      </div>

      {description && (
        <div className="description-section">
          <h3>설명</h3>
          <p>{description || '설명이 없습니다'}</p>
        </div>
      )}

      <div className="info-content">
        {children}
      </div>
    </div>
  );
};

export default InfoLayout;
