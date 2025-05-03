import React from 'react';
import TeamNicknameEditor from './TeamNicknameEditor';
import './TeamMemberInfo.css';

const TeamMemberInfo = ({ teamId, memberData, onNicknameUpdate }) => {
  if (!memberData.teamNickname || !memberData.roleName) return null;

  const formattedJoinDate = memberData.joinedAt 
  ? new Date(memberData.joinedAt).toLocaleDateString() 
  : '정보 없음';

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
          currentNickname={memberData.teamNickname} 
          onNicknameUpdate={onNicknameUpdate} 
        />
      </div>
    </div>
  );
};

export default TeamMemberInfo;
