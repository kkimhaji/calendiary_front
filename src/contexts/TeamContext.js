import { createContext, useState, useContext } from 'react';

const TeamContext = createContext();

export function TeamProvider({ children }) {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [categories, setCategories] = useState(null);

  return (
    <TeamContext.Provider value={{ 
      selectedTeam,
      setSelectedTeam,
      categories,
      setCategories 
    }}>
      {children}
    </TeamContext.Provider>
  );
}

export const useTeam = () => useContext(TeamContext);
