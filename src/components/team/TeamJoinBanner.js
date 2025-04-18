import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
// import '../../styles/TeamJoinBanner.css';

const TeamJoinBanner = ({ teamId, inviteCode, isValidInvite }) => {
  const navigate = useNavigate();
  const [joining, setJoining] = useState(false);

  const handleJoinTeam = async () => {
    if (!inviteCode) return;

    try {
      setJoining(true);
      await axios.post(`/team/${teamId}/join`, { code: inviteCode });
      navigate(`/team/${teamId}`);
    } catch (error) {
      console.error('팀 가입 실패:', error);
      alert('팀 가입에 실패했습니다. ' + (error.response?.data?.message || ''));
    } finally {
      setJoining(false);
    }
  };

  if (!isValidInvite) return null;

  return (
    <div className="invite-join-banner">
      <div className="invite-message">
        <h2>팀 초대</h2>
        <p>이 팀에 가입하시겠습니까?</p>
      </div>
      <button
        className="btn-join-team"
        onClick={handleJoinTeam}
        disabled={joining}
      >
        {joining ? '가입 중...' : '팀 가입하기'}
      </button>
    </div>
  );
};

export default TeamJoinBanner;
