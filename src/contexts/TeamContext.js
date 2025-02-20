import React, { createContext, useState, useContext } from 'react';
import { useCallback } from 'react';

const TeamContext = createContext();

export function TeamProvider({ children }) {
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [shouldRefreshTeams, setShouldRefreshTeams] = useState(false);
  const [shouldRefreshCategories, setShouldRefreshCategories] = useState(false);

  const refreshTeams = useCallback(() => {
      setShouldRefreshTeams(prev => !prev);
  }, []);

  const refreshCategories = useCallback(() => {
      setShouldRefreshCategories(prev => !prev);
  }, []);

  return (
    <TeamContext.Provider value={{ 
      selectedTeamId,
      setSelectedTeamId,
      selectedCategoryId,
      setSelectedCategoryId,
      refreshTeams,
      refreshCategories,
      shouldRefreshTeams,
      shouldRefreshCategories
    }}>
      {children}
    </TeamContext.Provider>
  );
}

export const useTeam = () => useContext(TeamContext);
