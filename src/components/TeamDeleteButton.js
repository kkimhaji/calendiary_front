import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const TeamDeleteButton = ({ teamId, teamName }) => {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleDeleteTeam = async () => {
    setDeleteLoading(true);
    setDeleteError('');

    try {
      await axios.delete(`/team/delete/${teamId}`);
      navigate('/', {
        state: { message: "팀이 성공적으로 삭제되었습니다." }
      });
    } catch (err) {
      console.error("팀 삭제 실패:", err);
      
      if (err.response?.status === 403) {
        setDeleteError("팀을 삭제할 권한이 없습니다.");
      } else if (err.response?.status === 409) {
        setDeleteError("이 팀에 콘텐츠가 있어 삭제할 수 없습니다.");
      } else {
        setDeleteError("팀 삭제 중 오류가 발생했습니다.");
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <button
        className="btn-delete-team"
        onClick={() => setShowDeleteModal(true)}
      >
        팀 삭제
      </button>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h3>팀 삭제</h3>
            <p>
              정말로 <strong>{teamName}</strong> 팀을 삭제하시겠습니까?
            </p>
            <p className="warning-text">
              이 작업은 되돌릴 수 없으며, 팀의 모든 카테고리와 게시글이 삭제됩니다.
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
                onClick={handleDeleteTeam}
                disabled={deleteLoading}
              >
                {deleteLoading ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TeamDeleteButton;
