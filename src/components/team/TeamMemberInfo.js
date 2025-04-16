import React from 'react';
import TeamNicknameEditor from './TeamNicknameEditor';

const TeamMemberInfo = ({ teamId, teamData, onNicknameUpdate }) => {
  if (!teamData.teamNickname || !teamData.roleName) return null;

  return (
    <div className="my-team-info-section">
      <h3>내 팀 정보</h3>
      <div className="info-container">
        <div className="info-row">
          <span className="info-label">역할:</span>
          <span className="info-value role-badge">{teamData.roleName}</span>
        </div>

        <TeamNicknameEditor 
          teamId={teamId} 
          currentNickname={teamData.teamNickname} 
          onNicknameUpdate={onNicknameUpdate} 
        />
      </div>
    </div>
  );
};

export default TeamMemberInfo;
