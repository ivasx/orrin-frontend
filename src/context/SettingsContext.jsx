import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

const THEME_KEY = 'app-theme';
const PLAY_404_KEY = 'playMusicOn404';

const applyTheme = (theme) => {
    const root = document.documentElement;
    if (theme === 'light') {
        root.setAttribute('data-theme', 'light');
    } else {
        root.removeAttribute('data-theme');
    }
};

export const SettingsProvider = ({ children }) => {
    const [playMusicOn404, setPlayMusicOn404] = useState(() => {
        const saved = localStorage.getItem(PLAY_404_KEY);
        return saved ? JSON.parse(saved) : false;
    });

    const [theme, setThemeState] = useState(() => {
        const saved = localStorage.getItem(THEME_KEY);
        return saved === 'light' ? 'light' : 'dark';
    });

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    useEffect(() => {
        applyTheme(theme);
    }, []);

    useEffect(() => {
        localStorage.setItem(PLAY_404_KEY, JSON.stringify(playMusicOn404));
    }, [playMusicOn404]);

    const setTheme = useCallback((newTheme) => {
        localStorage.setItem(THEME_KEY, newTheme);
        setThemeState(newTheme);
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    }, [theme, setTheme]);

    const value = {
        playMusicOn404,
        setPlayMusicOn404,
        theme,
        setTheme,
        toggleTheme,
        isDarkTheme: theme === 'dark',
        isLightTheme: theme === 'light',
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};