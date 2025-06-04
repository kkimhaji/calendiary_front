import React, { useState } from 'react';
import TeamNicknameEditor from './TeamNicknameEditor';
import './TeamMemberInfo.css';

const TeamMemberInfo = ({ teamId, memberData, onNicknameUpdate }) => {
  const [currentTeamNickname, setCurrentTeamNickname] = useState(memberData.teamNickname);

  if (!memberData.teamNickname || !memberData.roleName) return null;

  const formattedJoinDate = memberData.joinedAt
    ? new Date(memberData.joinedAt).toLocaleDateString()
    : '정보 없음';
  // 닉네임 업데이트 핸들러
  const handleNicknameUpdate = (newNickname) => {
    setCurrentTeamNickname(newNickname); // 로컬 상태 업데이트
    if (onNicknameUpdate) {
      onNicknameUpdate(newNickname); // 상위 컴포넌트에도 전달
    }
  };

  return (
    <div className="my-team-info-section">
      <h3>내 팀 정보</h3>
      <div className="info-container">
        <div className="info-row">
          <span className="info-label">역할:</span>
          <span className="info-value role-badge">{memberData.roleName}</span>
        </div>

        <div className="info-row">
          <span className="info-label">가입일:</span>
          <span className="info-value">{formattedJoinDate}</span>
        </div>

        <TeamNicknameEditor
          teamId={teamId}
          currentNickname={currentTeamNickname}
          onNicknameUpdate={handleNicknameUpdate}
        />
      </div>
    </div>
  );
};

export default TeamMemberInfo;
