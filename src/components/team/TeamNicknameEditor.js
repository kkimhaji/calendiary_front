import React, { useState } from 'react';
import axios from '../../api/axios';

const TeamNicknameEditor = ({ teamId, currentNickname, onNicknameUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newNickname, setNewNickname] = useState(currentNickname);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateNickname = async (e) => {
    e.preventDefault();

    if (!newNickname.trim()) {
      setError('닉네임을 입력해주세요');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.put(`/team/${teamId}/nickname`, {
        newNickname: newNickname
      });

      onNicknameUpdate(newNickname);
      setIsEditing(false);
    } catch (error) {
      console.error('닉네임 변경 실패:', error);
      setError('닉네임 변경에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="info-row">
      <span className="info-label">팀 내 닉네임:</span>

      {isEditing ? (
        <form onSubmit={handleUpdateNickname} className="nickname-form">
          <input
            type="text"
            value={newNickname}
            onChange={(e) => setNewNickname(e.target.value)}
            className="nickname-input"
            placeholder="새 닉네임 입력"
            maxLength={20}
          />
          <div className="nickname-btn-group">
            <button
              type="submit"
              className="save-btn"
              disabled={loading}
            >
              {loading ? '저장 중...' : '저장'}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                setIsEditing(false);
                setNewNickname(currentNickname);
                setError('');
              }}
            >
              취소
            </button>
          </div>
          {error && <div className="error-message">{error}</div>}
        </form>
      ) : (
        <div className="nickname-display">
          <span className="info-value">{currentNickname}</span>
          <button
            className="edit-nickname-btn"
            onClick={() => setIsEditing(true)}
          >
            변경
          </button>
        </div>
      )}
    </div>
  );
};

export default TeamNicknameEditor;
