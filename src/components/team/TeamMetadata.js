import React from 'react';

const TeamMetadata = ({ createdAt, memberCount, createdBy }) => {
  return (
    <div className="metadata-section">
      <h3>팀 정보</h3>
      <div className="metadata">
        <div className="metadata-item">
          <span className="metadata-label">생성일:</span>
          <span className="metadata-value">{new Date(createdAt).toLocaleDateString()}</span>
        </div>
        <div className="metadata-item">
          <span className="metadata-label">멤버 수:</span>
          <span className="metadata-value">{memberCount}명</span>
        </div>
        <div className="metadata-item">
          <span className="metadata-label">만든 사람:</span>
          <span className="metadata-value">{createdBy}</span>
        </div>
      </div>
    </div>
  );
};

export default TeamMetadata;
