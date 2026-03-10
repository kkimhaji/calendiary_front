import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import TeamInfo from './TeamInfo';
import './TeamJoinPage.css';
import { useTeam } from '../contexts/TeamContext';

const TeamJoinPage = () => {
  const { teamId } = useParams();
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get('code');
  const navigate = useNavigate();
  const [isValid, setIsValid] = useState(false);
  const [validationLoading, setValidationLoading] = useState(true);
  const [validationError, setValidationError] = useState(null);
  const [joining, setJoining] = useState(false);
  const [teamNickname, setTeamNickname] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [duplicateChecked, setDuplicateChecked] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const { refreshTeams } = useTeam();

  // 초대 코드 유효성 검증
  useEffect(() => {
    const validateInvite = async () => {
      try {
        setValidationLoading(true);

        const response = await axios.get(`/teams/${teamId}/invite/validate`, {
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
        console.error('초대 코드 검증 실패:', error);
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
  }, [inviteCode, teamId, navigate]);
  // 팀 닉네임 유효성 검증
  const validateTeamNickname = (nickname) => {
    if (!nickname.trim()) {
      setNicknameError('팀 닉네임을 입력해주세요.');
      return false;
    }
    if (nickname.length < 2) {
      setNicknameError('팀 닉네임은 2글자 이상이어야 합니다.');
      return false;
    }
    if (nickname.length > 20) {
      setNicknameError('팀 닉네임은 20글자 이하여야 합니다.');
      return false;
    }
    setNicknameError('');
    return true;
  };

  const handleCheckDuplicate = async () => {
    if (!teamNickname.trim() || nicknameError) {
      setNicknameError('올바른 팀 닉네임을 입력해주세요.');
      return;
    }

    setIsCheckingDuplicate(true);
    try {
      const response = await axios.get(`/team/${teamId}/nickname/check`, {
        params: { teamNickname: teamNickname.trim() }
      });

      setIsDuplicate(response.data.isDuplicate);
      setDuplicateChecked(true);

      if (response.data.isDuplicate) {
        setNicknameError('이미 사용 중인 팀 닉네임입니다.');
      } else {
        setNicknameError('');
      }
    } catch (error) {
      console.error('닉네임 중복 확인 실패:', error);
      setNicknameError('중복 확인 중 오류가 발생했습니다.');
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  // 팀 닉네임 입력 처리
  const handleNicknameChange = (e) => {
    const value = e.target.value;
    setTeamNickname(value);
    setDuplicateChecked(false); // 닉네임 변경 시 중복 확인 초기화
    setNicknameError('');
    setIsDuplicate(false);

    // 실시간 유효성 검증
    if (value.trim()) {
      validateTeamNickname(value);
    } else {
      setNicknameError('');
    }
  };

  // 팀 가입 요청 처리 
  const handleJoinTeam = async () => {
    if (!duplicateChecked || isDuplicate) {
      setNicknameError('닉네임 중복 확인을 먼저 해주세요.');
      return;
    }
    // 팀 닉네임 유효성 검증
    if (!validateTeamNickname(teamNickname)) {
      return;
    }

    try {
      setJoining(true);
      await axios.post(`/teams/${teamId}/join`, {
        code: inviteCode,
        teamNickname: teamNickname.trim(),
      });

      refreshTeams();
      navigate(`/teams/${teamId}/info`);
    } catch (error) {
      console.error('팀 가입 실패:', error);

      // 서버에서 온 에러 메시지 처리
      const errorMessage = error.response?.data?.message || '팀 가입에 실패했습니다.';

      // 닉네임 중복 에러 처리
      if (error.response?.status === 409) {
        setNicknameError('이미 사용 중인 팀 닉네임입니다.');
      } else {
        alert('팀 가입에 실패했습니다. ' + errorMessage);
      }
    } finally {
      setJoining(false);
    }
  };

  // 엔터 키 처리
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !joining && teamNickname.trim()) {
      handleJoinTeam();
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
        <div className="nickname-input-section">
          <label htmlFor="teamNickname" className="nickname-label">
            팀에서 사용할 닉네임
          </label>
          <div className="nickname-input-container">
            <input
              id="teamNickname"
              type="text"
              className={`nickname-input ${nicknameError ? 'error' : ''} ${duplicateChecked && !isDuplicate ? 'success' : ''}`}
              placeholder="팀에서 사용할 닉네임을 입력하세요"
              value={teamNickname}
              onChange={handleNicknameChange}
              disabled={joining}
              maxLength={20}
            />
            <button
              type="button"
              className="duplicate-check-btn"
              onClick={handleCheckDuplicate}
              disabled={!teamNickname.trim() || nicknameError || isCheckingDuplicate || joining}
            >
              {isCheckingDuplicate ? '확인 중...' : '중복 확인'}
            </button>
          </div>
          {nicknameError && (
            <span className="nickname-error">{nicknameError}</span>
          )}{duplicateChecked && !isDuplicate && !nicknameError && (
            <span className="nickname-success">사용 가능한 닉네임입니다.</span>
          )}

          <small className="nickname-hint">
            2-20글자, 한글/영문/숫자만 사용 가능
          </small>
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