import React from 'react';
import '../styles/DeleteConfirmModal.css';

const DeleteConfirmModal = ({
  title,
  entityName,
  warningText,
  onCancel,
  onConfirm,
  isLoading,
  error
}) => {
  return (
    <div className="modal-overlay">
      <div className="delete-modal">
        <h3>{title || '삭제 확인'}</h3>
        <p>
          정말로 <strong>{entityName}</strong>을(를) 삭제하시겠습니까?
        </p>
        <p className="warning-text">{warningText}</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="modal-buttons">
          <button
            className="cancel-button"
            onClick={onCancel}
            disabled={isLoading}
          >
            취소
          </button>
          <button
            className="delete-confirm-button"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
