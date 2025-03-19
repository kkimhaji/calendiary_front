import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import TeamInfo from './TeamInfo'; // 기존 TeamInfo 컴포넌트 재사용
import '../styles/TeamJoinPage.css';

const TeamJoinPage = () => {
  const { teamId } = useParams();
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get('code');
  const navigate = useNavigate();
  
  const [isValid, setIsValid] = useState(false);
  const [validationLoading, setValidationLoading] = useState(true);
  const [validationError, setValidationError] = useState(null);
  const [joining, setJoining] = useState(false);

  console.log("join team page");
  // 초대 코드 유효성 검증
  useEffect(() => {
    const validateInvite = async () => {
      try {
        setValidationLoading(true);
        const response = await axios.get('/team/invite/validate', {
            params: { code: inviteCode },
        });
        
        // 다른 팀의 초대 코드인 경우 리다이렉트
        if (response.data.isValid && response.data.teamId !== parseInt(teamId)) {
          navigate(`/teams/${response.data.teamId}/join?code=${inviteCode}`);
          return;
        }
        
        setIsValid(response.data.isValid);
        if (!response.data.isValid) {
          setValidationError(response.data.message);
        }
      } catch (error) {
        setIsValid(false);
        setValidationError('초대 코드 검증 중 오류가 발생했습니다.');
      } finally {
        setValidationLoading(false);
      }
    };

    if (inviteCode) {
      validateInvite();
    } else {
      setIsValid(false);
      setValidationLoading(false);
      setValidationError('초대 코드가 없습니다.');
    }
  }, [inviteCode, teamId]);

  // 팀 가입 요청 처리
  const handleJoinTeam = async () => {
    try {
      setJoining(true);
      await axios.post(`/team/${teamId}/join`, 
        { code: inviteCode },
      );
      
      // 가입 성공 시 일반 팀 페이지로 리다이렉트
      navigate(`/teams/${teamId}`);
    } catch (error) {
      console.error('팀 가입 실패:', error);
      alert('팀 가입에 실패했습니다. ' + (error.response?.data?.message || ''));
    } finally {
      setJoining(false);
    }
  };

  // 로딩 중이거나 검증 실패 시 처리
  if (validationLoading) {
    return <div className="loading">초대 코드 검증 중...</div>;
  }
  
  if (!isValid) {
    return (
      <div className="invite-error">
        <h2>유효하지 않은 초대 코드</h2>
        <p>{validationError}</p>
        <button onClick={() => navigate('/')}>홈으로</button>
      </div>
    );
  }

  // 유효한 초대 코드일 경우 TeamInfo 렌더링
  return (
    <div className="team-join-page">
      {/* 상단에 초대 배너 표시 */}
      <div className="invite-banner">
        <div className="invite-message">
          <h2>팀 초대</h2>
          <p>이 팀에 가입하시겠습니까?</p>
        </div>
        <button 
          className="join-button"
          onClick={handleJoinTeam}
          disabled={joining}
        >
          {joining ? '가입 중...' : '팀 가입하기'}
        </button>
      </div>

      {/* 기존 TeamInfo 컴포넌트 사용 (읽기 전용 모드) */}
      <TeamInfo readOnly={true} />
    </div>
  );
};

export default TeamJoinPage;
