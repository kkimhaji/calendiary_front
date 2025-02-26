import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/TeamInfo.css';

const TeamInfo = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [teamData, setTeamData] = useState(null);
  const [showRoles, setShowRoles] = useState(false);
  const [roleDetails, setRoleDetails] = useState([]); // 역할 상세 정보 상태
  const [loadingRoles, setLoadingRoles] = useState(false); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태

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

  // 역할 목록 조회 (showRoles가 true일 때만 실행)
  useEffect(() => {
    const fetchRoleDetails = async () => {
        if (!showRoles) return;
        setLoadingRoles(true);
        setError(null);
        try {
            console.log("역할 목록 받아오기 ");

            const response = await axios.get(`/roles/teams/${teamId}/get`,{
                headers:{
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            console.log(response);
            setRoleDetails(response.data);
        } catch (error) {
            setError('역할 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoadingRoles(false);
        }
    };
    fetchRoleDetails();
}, [showRoles, teamId]); // showRoles 변경 시마다 재조회

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
{loadingRoles ? (
                        <div className="loading">역할 목록을 불러오는 중...</div>
                    ) : error ? (
                        <div className="error-message">{error}</div>
                    ) : (
                        roleDetails.map(role => (
                            <div key={role.id} className="role-item">
                                <h4>{role.name}</h4>
                                <div className="permissions">
                                    {role.permissions.map((perm, idx) => (
                                        <span key={idx} className="permission-tag">
                                            {perm}
                                        </span>
                                    ))}
                                </div>
                                <div className="member-count">
                                    멤버 수: {role.memberCount}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
    </div>
  );
};

export default TeamInfo;
