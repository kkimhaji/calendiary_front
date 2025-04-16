import React, { useState } from 'react';
import axios from '../../api/axios';

const TeamMembersSection = ({ teamId, memberCount }) => {
  const [showMembers, setShowMembers] = useState(false);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [error, setError] = useState(null);

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
              <div key={member.email} className="member-item">
                <div className="member-info">
                  <span className="nickname">{member.teamNickname}</span>
                  <span className="email">{member.email}</span>
                </div>
                <span className="role">{member.roleName}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TeamMembersSection;
