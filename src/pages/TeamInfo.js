import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import axios from '../api/axios';
import '../layout/InfoLayout.css';
import { usePermissions } from '../hooks/usePermissions';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/authSlice';
import InfoLayout from '../layout/InfoLayout';
import TeamLeaveButton from '../components/team/TeamLeaveButton';
import TeamDeleteButton from '../components/team/TeamDeleteButton';
import TeamEditButton from '../components/team/TeamEditButton';
import TeamJoinBanner from '../components/team/TeamJoinBanner';
import TeamInviteSection from '../components/team/TeamInviteSection';
import TeamMemberInfo from '../components/team/TeamMemberInfo';
import TeamRolesSection from '../components/team/TeamRolesSection';
import TeamMembersSection from '../components/team/TeamMembersSection';
import TeamMetadata from '../components/team/TeamMetadata';

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
  const [showJoinBanner, setShowJoinBanner] = useState(false);
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

  // 팀 정보 로드
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        let url = `/team/${teamId}`;
        if (inviteCode) {
          url += `?code=${inviteCode}`;
        }

        const response = await axios.get(url);
        setTeamData(response.data);

        switch (response.data.userStatus) {
          case 'TEAM_MEMBER':
            // 팀 멤버 UI 표시
            break;

          case 'VALID_INVITE':
            // 팀 가입 배너 표시
            setShowJoinBanner(true);
            break;

          case 'NO_ACCESS':
            // 접근 거부 UI 표시
            break;
        }
      } catch (error) {
        console.error('팀 정보 조회 실패:', error);
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchTeamData();
  }, [teamId, inviteCode]);

  // 닉네임 업데이트 핸들러
  const handleNicknameUpdate = (newNickname) => {
    setTeamData({
      ...teamData,
      teamNickname: newNickname
    });
  };

  // 팀 액션 버튼 렌더링
  const renderTeamActions = () => {
    if (readOnly) return null;

    return (
      <div className="team-actions">
        <TeamLeaveButton teamId={teamId} />
        {permissions['MANAGE_TEAM'] && (
          <>
            <TeamEditButton teamId={teamId} />
            <TeamDeleteButton teamId={teamId} teamName={teamData?.name} />
          </>
        )}
      </div>
    );
  };

  if (!readOnly && permissionsLoading) return <div>권한 확인 중...</div>;
  if (loading) return <div className="loading">로딩 중...</div>;
  if (!teamData) return <div className="error-message">팀 정보를 불러올 수 없습니다.</div>;

  return (
    <>
      {/* 팀 가입 배너 */}
      {readOnly && (
        <TeamJoinBanner
          teamId={teamId}
          inviteCode={inviteCode}
          isValidInvite={isValidInvite}
        />
      )}

      <InfoLayout
        title={teamData.name}
        actionButtons={renderTeamActions()}
        description={teamData.description}
        loading={loading}
        error={error}
      >
        {/* 내 팀 정보 섹션 */}
        {!readOnly && (
          <TeamMemberInfo
            teamId={teamId}
            memberData={teamData.teamMemberInfo}
            onNicknameUpdate={handleNicknameUpdate}
          />
        )}

        {/* 초대 링크 섹션 */}
        {!readOnly && permissions['MANAGE_MEMBERS'] && (
          <TeamInviteSection teamId={teamId} />
        )}

        {/* 팀 메타데이터 */}
        <TeamMetadata
          createdAt={teamData.createdAt}
          memberCount={teamData.memberCount}
          createdBy={teamData.created_by}
        />

        {/* 역할 정보 섹션 */}
        <TeamRolesSection
          teamId={teamId}
          hasManagePermission={permissions['MANAGE_ROLES']}
          readOnly={readOnly}
        />

        {/* 멤버 목록 섹션 */}
        <TeamMembersSection
          teamId={teamId}
          memberCount={teamData.memberCount}
        />
      </InfoLayout>
    </>
  );
};

export default TeamInfo;
