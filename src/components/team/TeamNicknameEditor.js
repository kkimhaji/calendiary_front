import React, { useState } from 'react';
import axios from '../../api/axios';

const TeamNicknameEditor = ({ teamId, currentNickname, onNicknameUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newNickname, setNewNickname] = useState(currentNickname);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [duplicateChecked, setDuplicateChecked] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const handleCheckDuplicate = async () => {
    if (!newNickname.trim()) {
      setError('닉네임을 입력해주세요');
      return;
    }

    // 현재 닉네임과 동일한 경우 중복 확인 불필요
    if (newNickname.trim() === currentNickname) {
      setDuplicateChecked(true);
      setIsDuplicate(false);
      setError('');
      return;
    }

    setIsCheckingDuplicate(true);
    setError('');

    try {
      const response = await axios.get(`/team/${teamId}/nickname/check`, {
        params: { teamNickname: newNickname.trim() },
      });

      setIsDuplicate(response.data.isDuplicate);
      setDuplicateChecked(true);

      if (response.data.isDuplicate) {
        setError('이미 사용 중인 닉네임입니다');
      } else {
        setError('');
      }
    } catch (error) {
      console.error('닉네임 중복 확인 실패:', error);
      setError('중복 확인 중 오류가 발생했습니다');
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  const handleUpdateNickname = async (e) => {
    e.preventDefault();

    if (!newNickname.trim()) {
      setError('닉네임을 입력해주세요');
      return;
    }

    // 현재 닉네임과 동일한 경우 중복 확인 생략
    if (newNickname.trim() !== currentNickname) {
      if (!duplicateChecked) {
        setError('중복 확인을 먼저 해주세요');
        return;
      }

      if (isDuplicate) {
        setError('중복된 닉네임은 사용할 수 없습니다');
        return;
      }
    }

    setLoading(true);
    setError('');


    try {
      const response = await axios.put(`/team/${teamId}/nickname`, {
        newNickname: newNickname
      });

      const updatedNickname = response.data;

      onNicknameUpdate(updatedNickname);
      setIsEditing(false);
      setNewNickname(updatedNickname);
      resetValidationState();

    } catch (error) {
      console.error('닉네임 변경 실패:', error);
      if (error.response?.status === 409) {
        setError('이미 사용 중인 닉네임입니다');
      } else {
        setError('닉네임 변경에 실패했습니다');
      }
    } finally {
      setLoading(false);
    }
  };
  // 검증 상태 초기화 함수
  const resetValidationState = () => {
    setDuplicateChecked(false);
    setIsDuplicate(false);
    setError('');
  };

  // 닉네임 입력 변경 핸들러
  const handleNicknameChange = (e) => {
    setNewNickname(e.target.value);
    resetValidationState(); // 닉네임 변경 시 검증 상태 초기화
  };

  // 편집 모드 시작
  const startEditing = () => {
    setIsEditing(true);
    setNewNickname(currentNickname);
    resetValidationState();
  };

  // 편집 취소
  const cancelEditing = () => {
    setIsEditing(false);
    setNewNickname(currentNickname);
    resetValidationState();
  };

  return (
    <div className="info-row">
      <span className="info-label">팀 내 닉네임:</span>

      {isEditing ? (
        <form onSubmit={handleUpdateNickname} className="nickname-form">
          <div className="nickname-input-container">
            <input
              type="text"
              value={newNickname}
              onChange={handleNicknameChange}
              className={`nickname-input ${error ? 'error' : ''} ${duplicateChecked && !isDuplicate ? 'success' : ''}`}
              placeholder="새 닉네임 입력"
              maxLength={20}
              disabled={loading}
            />
            <button
              type="button"
              className="check-duplicate-btn"
              onClick={handleCheckDuplicate}
              disabled={
                !newNickname.trim() ||
                isCheckingDuplicate ||
                loading ||
                newNickname.trim() === currentNickname
              }
            >
              {isCheckingDuplicate ? '확인 중...' : '중복 확인'}
            </button>
          </div>

          {/* 상태별 메시지 표시 */}
          {duplicateChecked && !isDuplicate && !error && newNickname.trim() !== currentNickname && (
            <div className="success-message">사용 가능한 닉네임입니다</div>
          )}

          <div className="nickname-btn-group">
            <button
              type="submit"
              className="save-btn"
              disabled={loading || isCheckingDuplicate}
            >
              {loading ? '저장 중...' : '저장'}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={cancelEditing}
              disabled={loading || isCheckingDuplicate}
            >
              취소
            </button>
          </div>
          {error && <div className="error-message">{error}</div>}
          <small className="nickname-hint">
            2-20글자의 중복이 아닌 닉네임만 사용 가능
          </small>
        </form>
      ) : (
        <div className="nickname-display">
          <span className="info-value">{currentNickname}</span>
          <button
            className="edit-nickname-btn"
            onClick={startEditing}
          >
            변경
          </button>
        </div>
      )}
    </div>
  );
};

export default TeamNicknameEditor;
