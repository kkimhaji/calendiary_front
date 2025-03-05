import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/TeamInfo.css';
import { Link } from 'react-router-dom';

const TeamInfo = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [teamData, setTeamData] = useState(null);
  const [showRoles, setShowRoles] = useState(false);
  const [roleDetails, setRoleDetails] = useState([]); // 역할 상세 정보 상태
  const [loadingRoles, setLoadingRoles] = useState(false); // 로딩 상태
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // 에러 상태
  const [showMembers, setShowMembers] = useState(false);
  const [members, setMembers] = useState([]);
  const [hasManageTeamPermission, setHasManageTeamPermission] = useState(false);

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

        const response = await axios.get(`/teams/${teamId}/roles/get`, {
          headers: {
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

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const response = await axios.get('/permission-check', {
          params: {
            permission: 'MANAGE_TEAM',
            targetId: teamId
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        setHasManageTeamPermission(response.data);
      } catch (err) {
        setError('권한 확인에 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    checkPermission();
  }, [teamId]);

  const loadMembers = async () => {
    if (!members.length && !loading) {
      setLoading(true);
      try {
        const response = await axios.get(`/team/${teamId}/members`);
        setMembers(response.data);
      } catch (error) {
        console.error('멤버 불러오기 실패:', error);
      }
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/teams/${teamId}/edit`);
  }

  if (loading) return <div>권한 확인 중...</div>;

  if (!teamData) return <div className="loading">로딩 중...</div>;

  return (
    <div className="team-info-container">
      <div className="team-basic-info">
        <div className='team-header'>
          <h1>{teamData.name}</h1>
          {hasManageTeamPermission && (
            <button
              className="btn-edit-team"
              onClick={handleEdit}
            >
              팀 정보 수정
            </button>
          )}
          {/* <button
            className="btn-back"
            onClick={() => navigate(-1)}
          >
            글 목록
          </button> */}
        </div>

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
        <Link
          key={role.id}
          to={`/teams/${teamId}/roles/${role.id}/edit`}
          className="role-item"
        >
          <div className="role-content">
            <h4>{role.name}</h4>
            <div className="permissions">
              {role.permissions.map((perm, idx) => (
                <span key={idx} className="permission-tag">
                  {perm} {/* ✅ 문자열 배열 가정 (DTO 확인 필수) */}
                </span>
              ))}
            </div>
            <hr />
            <div className="member-count">
              멤버 수: {role.memberCount}
            </div>
          </div>
        </Link>
      ))
    )}
  </div>
)}
      <div className="members-section">
        <div
          className="toggle-header"
          onClick={() => {
            setShowMembers(!showMembers);
            if (!members.length) loadMembers();
          }}
        >
          <h3>멤버 목록 ({members.length})</h3>
          <span>{showMembers ? '▲' : '▼'}</span>
        </div>

        {showMembers && (
          <div className="member-list">
            {loading ? (
              <div className="loading">로딩 중...</div>
            ) : (
              members.map(member => (
                <div key={member.email} className="member-item">
                  <div className="member-info">
                    <span className="nickname">{member.teamNickname}</span>
                    <span className="email">{member.email}</span>
                  </div>
                  <span className="role">{member.roleName}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamInfo;
