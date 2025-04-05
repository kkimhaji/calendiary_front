import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import '../styles/AccountInfoPage.css';

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

  if (!memberInfo) return <div>Loading...</div>;


  return (
    <div className="account-info-container">
      <h2>계정 정보</h2>

      <div className="basic-info">
        <p>이메일: {memberInfo.email}</p>
        <p>기본 닉네임: {memberInfo.nickname}</p>
        <button
          onClick={() => navigate('/change-password')}
          className="password-change-btn"
        >
          비밀번호 변경
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
              <li key={team.teamId} className="team-item">
                <span className="team-name">팀 이름: {team.teamName}</span>
                <span className="team-nickname">팀 닉네임: {team.teamNickname}</span>
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
