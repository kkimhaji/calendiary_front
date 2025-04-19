import React, { useState } from 'react';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import './TeamLeaveButton.css';

const TeamLeaveButton = ({ teamId, isOwner }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLeaveTeam = async () => {
    setLoading(true);
    setError('');

    try {
      await axios.post(`/member/${teamId}/leave`);
      // 성공 시 메인 페이지로 이동
      navigate('/', { 
        state: { message: '팀에서 성공적으로 탈퇴했습니다.' } 
      });
    } catch (err) {
      console.error('팀 탈퇴 실패:', err);
      
      if (err.response?.status === 403) {
        setError('팀을 탈퇴할 권한이 없습니다.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('팀 탈퇴 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className="btn-leave-team"
        onClick={() => setShowModal(true)}
      >
        팀 탈퇴
      </button>

      {/* 확인 모달 */}
      {showModal && (
        <div className="modal-overlay">
          <div className="leave-team-modal">
            <h3>팀 탈퇴</h3>
            <p>정말로 이 팀에서 탈퇴하시겠습니까?</p>
            <p className="warning-text">
              탈퇴 후에는 팀 콘텐츠에 접근할 수 없으며, 다시 가입하려면 초대를 받아야 합니다.
            </p>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="modal-buttons">
              <button
                className="cancel-button"
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                취소
              </button>
              <button
                className="leave-confirm-button"
                onClick={handleLeaveTeam}
                disabled={loading}
              >
                {loading ? '처리 중...' : '탈퇴하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TeamLeaveButton;
