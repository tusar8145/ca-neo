// ThemeContext.js
import { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('...');
  const [hospital, setHospital] = useState(null);
  const [refreshHospital, setRefreshHospital] = useState(false);

  const toggleTheme = (data) => {
    setTheme(data);
  };

  const toggleHospital = (data) => {
    setHospital(data);
  };

  const toggleRefreshHospital = (data) => {
    setRefreshHospital(data);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, hospital,  toggleHospital, refreshHospital,toggleRefreshHospital  }}>
      {children} 
    </ThemeContext.Provider>
  );
};
