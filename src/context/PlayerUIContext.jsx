// src/context/PlayerUIContext.jsx
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const PlayerUIContext = createContext();

export const usePlayerUI = () => {
    const context = useContext(PlayerUIContext);
    if (!context) {
        throw new Error('usePlayerUI must be used within a PlayerUIProvider');
    }
    return context;
};

export const PlayerUIProvider = ({ children }) => {
    const [isExpanded, setIsExpanded] = useState(false); // Плеєр розгорнутий? (для моб. версії)
    const [showQueue, setShowQueue] = useState(false); // Показати панель черги?
    const [showTrackInfo, setShowTrackInfo] = useState(false); // Показати панель інфо про трек?
    const [showVolumeControl, setShowVolumeControl] = useState(false); // Показати панель гучності?

    // Розгорнути плеєр (наприклад, на мобільних пристроях)
    const expandPlayer = useCallback(() => setIsExpanded(true), []);

    // Згорнути плеєр і приховати всі додаткові панелі
    const collapsePlayer = useCallback(() => {
        setIsExpanded(false);
        setShowQueue(false);
        setShowTrackInfo(false);
        setShowVolumeControl(false);
    }, []);

    // Перемкнути видимість панелі черги, ховаючи інші панелі
    const toggleQueue = useCallback(() => {
        setShowQueue(prev => !prev);
        setShowTrackInfo(false);
        setShowVolumeControl(false);
    }, []);

    // Перемкнути видимість панелі інформації про трек, ховаючи інші панелі
    const toggleTrackInfo = useCallback(() => {
        setShowTrackInfo(prev => !prev);
        setShowQueue(false);
        setShowVolumeControl(false);
    }, []);

    // Перемкнути видимість панелі гучності, ховаючи інші панелі
    const toggleVolumeControl = useCallback(() => {
        setShowVolumeControl(prev => !prev);
        setShowQueue(false);
        setShowTrackInfo(false);
    }, []);

    // Збираємо значення для контексту
    const value = useMemo(() => ({
        isExpanded,
        showQueue,
        showTrackInfo,
        showVolumeControl,
        expandPlayer,
        collapsePlayer,
        toggleQueue,
        toggleTrackInfo,
        toggleVolumeControl,
    }), [
        isExpanded, showQueue, showTrackInfo, showVolumeControl,
        expandPlayer, collapsePlayer, toggleQueue, toggleTrackInfo, toggleVolumeControl
    ]);

    return (
        <PlayerUIContext.Provider value={value}>
            {children}
        </PlayerUIContext.Provider>
    );
};