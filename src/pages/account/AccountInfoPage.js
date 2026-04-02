import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import './AccountInfoPage.css';

const AccountInfoPage = () => {
  const [memberInfo, setMemberInfo] = useState(null);
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [isTeamsExpanded, setIsTeamsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMemberInfo = async () => {
      try {
        const response = await axios.get('/member/account-info');
        setMemberInfo(response.data);
      } catch (error) {
        console.error('정보 불러오기 실패:', error);
      }
    };
    fetchMemberInfo();
  }, []);

  const handleTeamListClick = async () => {
    if (teams.length > 0) {
      setIsTeamsExpanded(!isTeamsExpanded);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('/member/team-list');
      setTeams(response.data);
      setIsTeamsExpanded(true);
    } catch (err) {
      setError('팀 정보를 불러오는데 실패했습니다');
      console.error('팀 정보 요청 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditInfo = () => {
    navigate('/account/verify-password');
  };

  // 팀 클릭 핸들러 추가
  const handleTeamClick = (teamId) => {
    navigate(`/teams/${teamId}/info`);
  };

  if (!memberInfo) return <div className="loading">Loading...</div>;

  return (
    <div className="account-info-container">
      <h2>계정 정보</h2>

      <div className="basic-info">
        <div className="info-row">
          <span className="info-label">이메일:</span>
          <span className="info-value">{memberInfo.email}</span>
        </div>
        <div className="info-row">
          <span className="info-label">기본 닉네임:</span>
          <span className="info-value">{memberInfo.nickname}</span>
        </div>

        <button
          onClick={handleEditInfo}
          className="edit-info-btn"
        >
          정보 수정
        </button>
      </div>

      <div className="team-section">
        <div
          className="team-info-header"
          onClick={handleTeamListClick}
          style={{ cursor: 'pointer' }}
        >
          <h3>
            소속 팀 목록
            <span className="team-list-toggle-icon">
              {isTeamsExpanded ? '▼' : '▶'}
            </span>
          </h3>
        </div>

        {isLoading && <div className="loading">Loading...</div>}
        {error && <div className="error">{error}</div>}

        {isTeamsExpanded && teams.length > 0 && (
          <ul className="team-list">
            {teams.map(team => (
              <li
                key={team.teamId}
                className="team-item"
                onClick={() => handleTeamClick(team.teamId)}
              >
                <div className="team-info-wrapper">
                  <span className="team-name">{team.teamName}</span>
                  <span className="team-nickname">팀 닉네임: {team.teamNickname}</span>
                  {team.roleName && (
                    <span className="team-role">역할: {team.roleName}</span>
                  )}
                </div>
                <span className="go-to-team-icon">→</span>
              </li>
            ))}
          </ul>
        )}

        {isTeamsExpanded && teams.length === 0 && !isLoading && (
          <p className="no-teams">가입한 팀이 없습니다</p>
        )}
      </div>
    </div>
  );
};

export default AccountInfoPage;
