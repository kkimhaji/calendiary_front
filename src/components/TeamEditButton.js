import React from 'react';
import { useNavigate } from 'react-router-dom';

const TeamEditButton = ({ teamId }) => {
  const navigate = useNavigate();
  
  const handleEdit = () => {
    navigate(`/teams/${teamId}/edit`);
  };

  return (
    <button
      className="btn-edit-team"
      onClick={handleEdit}
    >
      팀 정보 수정
    </button>
  );
};

export default TeamEditButton;
