import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import axios from '../api/axios';
import '../styles/TeamInfo.css';
import { usePermissions } from '../hooks/usePermissions';
import { useSelector } from 'react-redux';
import { isAuthenticated, selectIsAuthenticated } from '../store/authSlice';

const TeamInfo = ({readOnly = false}) => {
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
  const [loadingMembers, setLoadingMembers] = useState(false); 
  const [inviteLink, setInviteLink] = useState(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteSettings, setInviteSettings] = useState({
    expiresIn: 7, // 기본 7일
    maxUses: 1    // 기본 1회
  });
  const [permissions, permissionsLoading, permissionsError] = usePermissions(
    readOnly ? [] : ['MANAGE_TEAM', 'MANAGE_ROLES', 'MANAGE_MEMBERS'],
    teamId
  );
  const [isValidInvite, setIsValidInvite] = useState(false);
  const [joining, setJoining] = useState(false);
  const [searchParams] = useSearchParams();
  const location = useLocation(); // useLocation 훅 사용
  const isAuthenticated = useSelector(selectIsAuthenticated); // Redux 선택자 사용
  const inviteCode = searchParams.get('code');
  
    // 닉네임 변경 관련 상태
    const [isEditingNickname, setIsEditingNickname] = useState(false);
    const [newNickname, setNewNickname] = useState('');
    const [nicknameError, setNicknameError] = useState('');
    const [nicknameLoading, setNicknameLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      // 현재 URL을 저장하고 로그인 페이지로 리다이렉트
      const currentPath = `${location.pathname}${location.search}`;
      navigate(`/login?redirectUrl=${encodeURIComponent(currentPath)}`);
    }
  }, [isAuthenticated, location, navigate]);
  
  //초대 코드 검증
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

     // 팀 가입 핸들러
     const handleJoinTeam = async () => {
      if (!inviteCode) return;
      
      try {
        setJoining(true);
        await axios.post(`/team/${teamId}/join`, 
          { code: inviteCode }        );

              // 가입 성공 시 일반 팀 페이지로 리다이렉트
      navigate(`/team/${teamId}`);
    } catch (error) {
      console.error('팀 가입 실패:', error);
      alert('팀 가입에 실패했습니다. ' + (error.response?.data?.message || ''));
    } finally {
      setJoining(false);
    }
  };

   // 닉네임 변경 처리 함수
  const handleUpdateNickname = async (e) => {
    e.preventDefault();
    
    if (!newNickname.trim()) {
      setNicknameError('닉네임을 입력해주세요');
      return;
    }
    
    setNicknameLoading(true);
    setNicknameError('');
    
    try {
      await axios.put(`/api/teams/${teamId}/nickname`, {
        teamNickname: newNickname
      });
      
      // 성공 시 팀 데이터 업데이트
      setTeamData({
        ...teamData,
        teamNickname: newNickname
      });
      
      setIsEditingNickname(false);
    } catch (error) {
      console.error('닉네임 변경 실패:', error);
      setNicknameError('닉네임 변경에 실패했습니다');
    } finally {
      setNicknameLoading(false);
    }
  };

  const handleAddRole = () => {
    navigate(`/teams/${teamId}/create-role`);
  };

  const handleCreateInvite = async () => {
    try {
      setInviteLoading(true);
      setInviteError(null);
       // 만료 날짜 계산
       const expiresAt = inviteSettings.expiresIn > 0 
       ? new Date(Date.now() + inviteSettings.expiresIn * 24 * 60 * 60 * 1000).toISOString()
       : null;
     
     const response = await axios.post(
       `/team/invite`, 
       {
         teamId: parseInt(teamId),
         expiresAt: expiresAt,
         maxUses: inviteSettings.maxUses
       }
     );
     
     setInviteLink(response.data.inviteLink);
     setShowInviteForm(false); // 폼 숨기기
   } catch (error) {
     console.error('초대 링크 생성 실패:', error);
     setInviteError('초대 링크 생성 실패: ' + (error.response?.data?.message || error.message));
   } finally {
     setInviteLoading(false);
   }
 };

 // 초대 설정 변경 핸들러
 const handleInviteSettingsChange = (e) => {
   const { name, value } = e.target;
   setInviteSettings({
     ...inviteSettings,
     [name]: parseInt(value)
   });
 };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink)
      .then(() => alert('링크가 복사되었습니다!'))
      .catch(() => alert('복사에 실패했습니다.'));
  };

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const response = await axios.get(`/team/${teamId}`);
        setTeamData(response.data);
      } catch (error) {
        console.error('팀 정보 조회 실패:', error);
        navigate(-1);
      }finally{
        setLoading(false)
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
        const response = await axios.get(`/teams/${teamId}/roles/get`);
        setRoleDetails(response.data);
      } catch (error) {
        setError('역할 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoadingRoles(false);
      }
    };
    fetchRoleDetails();
  }, [showRoles, teamId]); // showRoles 변경 시마다 재조회

  const loadMembers = async () => {
    if (loadingMembers || (members.length > 0)) return;
    
    setLoadingMembers(true);
    
    try {
      const response = await axios.get(`/team/${teamId}/members`);
      
      // 응답 데이터 검증
      if (Array.isArray(response.data)) {
        setMembers(response.data);
      } else {
        console.error('예상치 못한 응답 형식:', response.data);
        setError('멤버 데이터를 불러오는데 문제가 발생했습니다.');
      }
    } catch (error) {
      console.error('멤버 불러오기 실패:', error);
      setError('멤버 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoadingMembers(false); // 항상 로딩 상태 해제
    }
  };

  const handleEdit = () => {
    navigate(`/teams/${teamId}/edit`);
  }

  if (!readOnly && permissionsLoading) return <div>권한 확인 중...</div>;
  if (!teamData) return <div className="loading">로딩 중...</div>;

  return (
    <div className="team-info-container">
      {readOnly && isValidInvite && (
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
      )}
      
      <div className="team-basic-info">
        <div className='team-header'>
          <h1>{teamData.name}</h1>
          {!readOnly && permissions['MANAGE_TEAM'] && (
            <button
              className="btn-edit-team"
              onClick={handleEdit}
            >
              팀 정보 수정
            </button>
          )}
        </div>
        {!readOnly && teamData.teamNickname && teamData.roleName && (
          <div className="my-team-info-section">
            <h3>내 팀 정보</h3>
            <div className="info-container">
              <div className="info-row">
                <span className="info-label">역할:</span>
                <span className="info-value role-badge">{teamData.roleName}</span>
              </div>
              
              <div className="info-row">
                <span className="info-label">팀 내 닉네임:</span>
                
                {isEditingNickname ? (
                  <form onSubmit={handleUpdateNickname} className="nickname-form">
                    <input
                      type="text"
                      value={newNickname}
                      onChange={(e) => setNewNickname(e.target.value)}
                      className="nickname-input"
                      placeholder="새 닉네임 입력"
                      maxLength={20}
                    />
                    <div className="nickname-btn-group">
                      <button 
                        type="submit" 
                        className="save-btn"
                        disabled={nicknameLoading}
                      >
                        {nicknameLoading ? '저장 중...' : '저장'}
                      </button>
                      <button 
                        type="button" 
                        className="cancel-btn"
                        onClick={() => {
                          setIsEditingNickname(false);
                          setNewNickname(teamData.teamNickname);
                          setNicknameError('');
                        }}
                      >
                        취소
                      </button>
                    </div>
                    {nicknameError && <div className="error-message">{nicknameError}</div>}
                  </form>
                ) : (
                  <div className="nickname-display">
                    <span className="info-value">{teamData.teamNickname}</span>
                    <button 
                      className="edit-nickname-btn"
                      onClick={() => setIsEditingNickname(true)}
                    >
                      변경
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {!readOnly && permissions['MANAGE_MEMBERS'] && (
        <div className="invite-section">
          {!showInviteForm && !inviteLink && (
            <button 
              className="btn-show-invite-form"
              onClick={() => setShowInviteForm(true)}
            >
              멤버 초대 링크 생성
            </button>
          )}
          
          {showInviteForm && (
            <div className="invite-form">
              <h3>초대 링크 설정</h3>
              
              <div className="form-group">
                <label>만료 기간</label>
                <select 
                  name="expiresIn" 
                  value={inviteSettings.expiresIn}
                  onChange={handleInviteSettingsChange}
                >
                  <option value="1">1일</option>
                  <option value="7">7일</option>
                  <option value="30">30일</option>
                  <option value="0">무기한</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>최대 사용 횟수</label>
                <select 
                  name="maxUses" 
                  value={inviteSettings.maxUses}
                  onChange={handleInviteSettingsChange}
                >
                  <option value="1">1회</option>
                  <option value="5">5회</option>
                  <option value="10">10회</option>
                  <option value="50">50회</option>
                </select>
              </div>
              
              <div className="invite-form-buttons">
                <button 
                  className="btn-cancel-invite" 
                  onClick={() => setShowInviteForm(false)}
                >
                  취소
                </button>
                <button 
                  className="btn-generate-invite"
                  onClick={handleCreateInvite}
                  disabled={inviteLoading}
                >
                  {inviteLoading ? '생성 중...' : '링크 생성'}
                </button>
              </div>
            </div>
          )}
          
          {inviteError && <div className="error-message">{inviteError}</div>}
          
          {inviteLink && (
            <div className="invite-link-container">
              <h3>초대 링크가 생성되었습니다</h3>
              <div className="invite-link-box">
                <input 
                  type="text" 
                  value={inviteLink} 
                  readOnly 
                  className="invite-link-input"
                />
                <button 
                  className="btn-copy-link"
                  onClick={copyToClipboard}
                >
                  복사
                </button>
              </div>
              <p className="invite-info">
                {inviteSettings.expiresIn > 0 
                  ? `${inviteSettings.expiresIn}일 후 만료` 
                  : '무기한 유효'}
                {' · '}
                {`최대 ${inviteSettings.maxUses}회 사용 가능`}
              </p>
              <button 
                className="btn-new-invite"
                onClick={() => {
                  setInviteLink(null);
                  setShowInviteForm(true);
                }}
              >
                새 링크 생성
              </button>
            </div>
          )}
        </div>
      )}

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
          <button 
            className="add-role-button"
            onClick={handleAddRole}
          >
            + 역할 추가
          </button>
          {loadingRoles ? (
            <div className="loading">역할 목록을 불러오는 중...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            roleDetails.map(role => (
              <div
                key={role.id}
                className={`role-item ${!readOnly && permissions['MANAGE_ROLES'] ? 'clickable' : 'disabled'}`}
                onClick={() => {
                  if (!readOnly &&permissions['MANAGE_ROLES']) {
                    navigate(`/teams/${teamId}/roles/${role.id}/edit`);
                  }
                }}
              >
                <div className="role-content">
                  <h4>{role.name}</h4>
                  <div className="permissions">
                    {role.permissions.map((perm, idx) => (
                      <span key={idx} className="permission-tag">
                        {perm}
                      </span>
                    ))}
                  </div>
                  <hr />
                  <div className="member-count">
                    멤버 수: {role.memberCount}
                  </div>
                </div>
              </div>
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
          <h3>멤버 목록 ({teamData.memberCount})</h3>
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
