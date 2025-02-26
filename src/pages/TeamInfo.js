import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/TeamInfo.css';

const TeamInfo = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [teamData, setTeamData] = useState(null);
  const [showRoles, setShowRoles] = useState(false);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const response = await axios.get(`/team/${teamId}`);
        setTeamData(response.data);
      } catch (error) {
        console.error('팀 정보 조회 실패:', error);
        navigate(-1);
      }
    };
    fetchTeamData();
  }, [teamId]);

  if (!teamData) return <div className="loading">로딩 중...</div>;

  return (
    <div className="team-info-container">
      <div className="team-basic-info">
        <h1>{teamData.name}</h1>
        <p className="team-description">{teamData.description}</p>
        
        <div className="metadata">
          <span>생성일: {new Date(teamData.createdAt).toLocaleDateString()}</span>
          <span>멤버 수: {teamData.memberCount}명</span>
          <span>만든 사람: {teamData.created_by}</span>
        </div>

        <button 
          className="role-toggle-button"
          onClick={() => setShowRoles(!showRoles)}
        >
          {showRoles ? '역할 목록 숨기기' : '역할 목록 보기'}
        </button>
      </div>

      {showRoles && (
        <div className="role-list">
          <h3>역할 목록</h3>
          {teamData.roles.map(role => (
            <div key={role.id} className="role-item">
              <h4>{role.name}</h4>
              <div className="permissions">
                {role.permissions.map((perm, idx) => (
                  <span key={idx} className="permission-tag">{perm}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamInfo;
