import { createContext, useState, useContext } from 'react';

const TeamContext = createContext();

export function TeamProvider({ children }) {
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  return (
    <TeamContext.Provider value={{ 
      selectedTeamId, 
      setSelectedTeamId,
      selectedCategoryId, 
      setSelectedCategoryId 
    }}>
      {children}
    </TeamContext.Provider>
  );
}

export const useTeam = () => useContext(TeamContext);
