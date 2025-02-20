import React, { createContext, useState, useContext } from 'react';

const TeamContext = createContext();

export function TeamProvider({ children }) {
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [shouldRefreshTeams, setShouldRefreshTeams] = useState(false);
  const [shouldRefreshCategories, setShouldRefreshCategories] = useState(false);

  // ✅ 팀 목록 갱신 함수
  const refreshTeams = useCallback(() => {
      setShouldRefreshTeams(prev => !prev);
  }, []);

  // ✅ 카테고리 목록 갱신 함수
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
