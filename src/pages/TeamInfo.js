import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import axios from '../api/axios';
import '../styles/TeamInfo.css';
import { usePermissions } from '../hooks/usePermissions';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/authSlice';
import TeamLeaveButton from '../components/TeamLeaveButton';
import TeamDeleteButton from '../components/TeamDeleteButton';
import TeamEditButton from '../components/TeamEditButton';
import TeamJoinBanner from '../components/TeamJoinBanner';
import TeamInviteSection from '../components/TeamInviteSection';
import TeamMemberInfo from '../components/TeamMemberInfo';
import TeamRolesSection from '../components/TeamRolesSection';
import TeamMembersSection from '../components/TeamMembersSection';

const TeamInfo = ({ readOnly = false }) => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isValidInvite, setIsValidInvite] = useState(false);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const inviteCode = searchParams.get('code');
  const [permissions, permissionsLoading] = usePermissions(
    readOnly ? [] : ['MANAGE_TEAM', 'MANAGE_ROLES', 'MANAGE_MEMBERS'],
    teamId
  );

  // 인증 확인 및 리다이렉트
  useEffect(() => {
    if (!isAuthenticated) {
      const currentPath = `${location.pathname}${location.search}`;
      navigate(`/login?redirectUrl=${encodeURIComponent(currentPath)}`);
    }
  }, [isAuthenticated, location, navigate]);

  // 초대 코드 검증
  useEffect(() => {
    const validateInvite = async () => {
      if (!readOnly || !inviteCode) return;

      try {
        const response = await axios.get('/invite/validate', {
          params: { code: inviteCode }
        });

        if (response.data.isValid && response.data.teamId.toString() === teamId) {
          setIsValidInvite(true);
        } else {
          setError(response.data.message || '유효하지 않은 초대 코드입니다.');
        }
      } catch (err) {
        setError('초대 코드 검증 중 오류가 발생했습니다.');
        console.error('초대 코드 검증 실패:', err);
      }
    };

    validateInvite();
  }, [readOnly, inviteCode, teamId]);

  // 팀 정보 로드
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const response = await axios.get(`/team/${teamId}`);
        setTeamData(response.data);
      } catch (error) {
        console.error('팀 정보 조회 실패:', error);
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchTeamData();
  }, [teamId, navigate]);

  // 닉네임 업데이트 핸들러
  const handleNicknameUpdate = (newNickname) => {
    setTeamData({
      ...teamData,
      teamNickname: newNickname
    });
  };

  if (!readOnly && permissionsLoading) return <div>권한 확인 중...</div>;
  if (loading) return <div className="loading">로딩 중...</div>;
  if (!teamData) return <div className="error-message">팀 정보를 불러올 수 없습니다.</div>;

  return (
    <div className="team-info-container">
      {/* 팀 가입 배너 */}
      {readOnly && (
        <TeamJoinBanner 
          teamId={teamId} 
          inviteCode={inviteCode} 
          isValidInvite={isValidInvite} 
        />
      )}

      <div className="team-basic-info">
        <div className='team-header'>
          <h1>{teamData.name}</h1>
          {!readOnly && (
            <div className="team-buttons">
            <TeamLeaveButton teamId={teamId} />
            
            {!readOnly && permissions['MANAGE_TEAM'] && (
              <>
                <TeamEditButton teamId={teamId} />
                <TeamDeleteButton teamId={teamId} teamName={teamData.name} />
              </>
            )}
          </div>
          )}
          
        </div>
        
        {/* 내 팀 정보 섹션 */}
        {!readOnly && (
          <TeamMemberInfo 
            teamId={teamId} 
            teamData={teamData} 
            onNicknameUpdate={handleNicknameUpdate}
          />
        )}
        
        {/* 초대 링크 섹션 */}
        {!readOnly && permissions['MANAGE_MEMBERS'] && (
          <TeamInviteSection teamId={teamId} />
        )}

        {/* 팀 기본 정보 */}
        <p className="team-description">{teamData.description}</p>

        <div className="metadata">
          <span>생성일: {new Date(teamData.createdAt).toLocaleDateString()}</span>
          <span>멤버 수: {teamData.memberCount}명</span>
          <span>만든 사람: {teamData.created_by}</span>
        </div>

        {/* 역할 정보 섹션 */}
        <TeamRolesSection 
          teamId={teamId} 
          hasManagePermission={permissions['MANAGE_ROLES']} 
          readOnly={readOnly} 
        />
      </div>
      
      {/* 멤버 목록 섹션 */}
      <TeamMembersSection 
        teamId={teamId} 
        memberCount={teamData.memberCount} 
      />
    </div>
  );
};

export default TeamInfo;