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
    const [isExpanded, setIsExpanded] = useState(false);
    const [showQueue, setShowQueue] = useState(false);
    const [showTrackInfo, setShowTrackInfo] = useState(false);
    const [showVolumeControl, setShowVolumeControl] = useState(false);
    const [isPlayerCollapsed, setIsPlayerCollapsed] = useState(false);

    const expandPlayer = useCallback(() => setIsExpanded(true), []);

    const collapsePlayer = useCallback(() => {
        setIsExpanded(false);
        setShowQueue(false);
        setShowTrackInfo(false);
        setShowVolumeControl(false);
    }, []);

    const toggleQueue = useCallback(() => {
        setShowQueue(prev => !prev);
        setShowTrackInfo(false);
        setShowVolumeControl(false);
    }, []);

    const toggleTrackInfo = useCallback(() => {
        setShowTrackInfo(prev => !prev);
        setShowQueue(false);
        setShowVolumeControl(false);
    }, []);

    const toggleVolumeControl = useCallback(() => {
        setShowVolumeControl(prev => !prev);
        setShowQueue(false);
        setShowTrackInfo(false);
    }, []);

    /**
     * Collapses the player bar out of view, leaving only the floating handle
     * visible. Other layout consumers (e.g. page wrappers that add bottom
     * padding) can read `isPlayerCollapsed` to adjust their own spacing.
     */
    const togglePlayerCollapsed = useCallback(
        () => setIsPlayerCollapsed(prev => !prev),
        [],
    );

    const value = useMemo(() => ({
        isExpanded,
        showQueue,
        showTrackInfo,
        showVolumeControl,
        isPlayerCollapsed,
        expandPlayer,
        collapsePlayer,
        toggleQueue,
        toggleTrackInfo,
        toggleVolumeControl,
        togglePlayerCollapsed,
    }), [
        isExpanded,
        showQueue,
        showTrackInfo,
        showVolumeControl,
        isPlayerCollapsed,
        expandPlayer,
        collapsePlayer,
        toggleQueue,
        toggleTrackInfo,
        toggleVolumeControl,
        togglePlayerCollapsed,
    ]);

    return (
        <PlayerUIContext.Provider value={value}>
            {children}
        </PlayerUIContext.Provider>
    );
};