import React, { useState } from 'react';
import axios from '../../api/axios';
import './TeamMembersSection.css';

const TeamMembersSection = ({ teamId, memberCount, hasManagePermission, currentUserId }) => {
  const [showMembers, setShowMembers] = useState(false);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [error, setError] = useState(null);
  const [removingMemberId, setRemovingMemberId] = useState(null);

  const loadMembers = async () => {
    if (loadingMembers || (members.length > 0)) return;

    setLoadingMembers(true);

    try {
      const response = await axios.get(`/team/${teamId}/members`);
      if (Array.isArray(response.data)) {
        setMembers(response.data);
      } else {
        console.error('예상치 못한 응답 형식:', response.data);
        setError('멤버 데이터를 불러오는데 문제가 발생했습니다.');
      }
    } catch (error) {
      console.error('멤버 불러오기 실패:', error);
      setError('멤버 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoadingMembers(false);
    }
  };

  // 멤버 강제 탈퇴 핸들러
  const handleRemoveMember = async (teamMemberId, nickname) => {
    if (!window.confirm(`정말로 '${nickname}' 님을 팀에서 탈퇴시키시겠습니까?`)) {
      return;
    }

    setRemovingMemberId(teamMemberId);

    try {
      await axios.delete(`/team/${teamId}/members/${teamMemberId}`);

      // 성공 시 목록에서 제거
      setMembers(prevMembers =>
        prevMembers.filter(member => member.teamMemberId !== teamMemberId)
      );

      alert('멤버가 성공적으로 탈퇴되었습니다.');
    } catch (error) {
      console.error('멤버 탈퇴 실패:', error);

      // 에러 메시지 처리
      const errorMessage = error.response?.data?.message
        || '멤버 탈퇴에 실패했습니다.';
      alert(errorMessage);
    } finally {
      setRemovingMemberId(null);
    }
  };

  return (
    <div className="members-section">
      <div
        className="toggle-header"
        onClick={() => {
          setShowMembers(!showMembers);
          if (!members.length) loadMembers();
        }}
      >
        <h3>멤버 목록 ({memberCount})</h3>
        <span>{showMembers ? '▲' : '▼'}</span>
      </div>

      {showMembers && (
        <div className="member-list">
          {loadingMembers ? (
            <div className="loading">로딩 중...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            members.map(member => (
              <div key={member.teamMemberId} className="member-item">
                <div className="member-info">
                  <span className="nickname">{member.teamNickname}</span>
                  <span className="email">{member.email}</span>
                </div>
                <div className="member-actions">
                  <span className="role">{member.roleName}</span>
                  {/* 강제 탈퇴 버튼 */}
                  {hasManagePermission && (
                    <button
                      className="remove-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveMember(member.teamMemberId, member.teamNickname);
                      }}
                      disabled={removingMemberId === member.teamMemberId}
                    >
                      {removingMemberId === member.teamMemberId ? '처리 중...' : '탈퇴'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TeamMembersSection;