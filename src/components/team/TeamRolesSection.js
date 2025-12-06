import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import './TeamRoleSection.css';

const TeamRolesSection = ({ teamId, hasManagePermission, readOnly }) => {
  const navigate = useNavigate();
  const [showRoles, setShowRoles] = useState(false);
  const [roleDetails, setRoleDetails] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [error, setError] = useState(null);

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
  }, [showRoles, teamId]);

  const handleAddRole = () => {
    navigate(`/teams/${teamId}/create-role`);
  };

  return (
    <>
      <button
        className="role-toggle-button"
        onClick={() => setShowRoles(!showRoles)}
      >
        {showRoles ? '역할 목록 숨기기' : '역할 목록 보기'}
      </button>

      {showRoles && (
        <div className="role-list">
          <div className='role-list-header'>
            <h3>역할 목록</h3>
            {!readOnly && hasManagePermission && (
              <button
                className="add-role-button"
                onClick={handleAddRole}
              >
                + 역할 추가
              </button>
            )}
          </div>

          {loadingRoles ? (
            <div className="loading">역할 목록을 불러오는 중...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            roleDetails.map(role => (
              <div
                key={role.id}
                className={`role-item ${!readOnly && hasManagePermission ? 'clickable' : 'disabled'}`}
                onClick={() => {
                  if (!readOnly && hasManagePermission) {
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
    </>
  );
};

export default TeamRolesSection;
