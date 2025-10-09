import React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [playMusicOn404, setPlayMusicOn404] = useState(() => {
    const saved = localStorage.getItem('playMusicOn404');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('playMusicOn404', JSON.stringify(playMusicOn404));
  }, [playMusicOn404]);

  const value = {
    playMusicOn404,
    setPlayMusicOn404,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};