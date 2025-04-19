import React from 'react';
import './Permissions.css';

const CategoryPermissions = ({ rolePermissions }) => {
  if (!rolePermissions || rolePermissions.length === 0) {
    return <div className="no-data">권한 설정 정보가 없습니다.</div>;
  }

  return (
    <div className="permissions-section">
      <h3>역할별 권한</h3>
      <ul className="role-permission-list">
        {rolePermissions.map(permission => (
          <li key={permission.id} className="role-item">
            <div className="role-header">
              <span className="role-name">{permission.roleName}</span>
            </div>
            <div className="permission-tags">
              {Array.from(permission.permissions).map((perm, idx) => (
                <span key={idx} className="permission-tag">
                  {perm}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryPermissions;