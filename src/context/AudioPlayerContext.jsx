// AudioPlayerContext.jsx

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

const AudioPlayerContext = createContext();

export const useAudioPlayer = () => {
    const context = useContext(AudioPlayerContext);
    if (!context) {
        throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
    }
    return context;
};

export const AudioPlayerProvider = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [queue, setQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [isShuffled, setIsShuffled] = useState(false);
    const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'all', 'one'
    const audioRef = useRef(null);

    // Цей стан потрібен для режиму "Повторити один раз" ('one')
    const [hasRepeatedOnce, setHasRepeatedOnce] = useState(false);

    // Допоміжна функція для зміни треку, яка також скидає лічильник повтору
    const playNewTrack = (track, index) => {
        setCurrentTrack(track);
        setCurrentIndex(index);
        setIsPlaying(true);
        // Скидаємо прапорець для кожного нового треку
        setHasRepeatedOnce(false);
    };

    const playTrack = useCallback((trackData, trackList = null) => {
        let newQueue = queue;
        if (trackList && Array.isArray(trackList)) {
            newQueue = trackList;
            setQueue(trackList);
        }

        let index = newQueue.findIndex(track => track.trackId === trackData.trackId);
        if (index === -1) {
            newQueue = [...newQueue, trackData];
            index = newQueue.length - 1;
            setQueue(newQueue);
        }

        playNewTrack(trackData, index);
    }, [queue]);

    const pauseTrack = useCallback(() => setIsPlaying(false), []);
    const stopTrack = useCallback(() => {
        setCurrentTrack(null);
        setIsPlaying(false);
        setCurrentIndex(-1);
    }, []);
    const resumeTrack = useCallback(() => {
        if (currentTrack) setIsPlaying(true);
    }, [currentTrack]);

    const nextTrack = useCallback(() => {
        if (queue.length === 0) return;

        let nextIndex;
        if (isShuffled) {
            nextIndex = Math.floor(Math.random() * queue.length);
        } else if (currentIndex < queue.length - 1) {
            nextIndex = currentIndex + 1;
        } else {
            // Якщо це кінець плейлиста і повтор вимкнено, зупиняємо
            setIsPlaying(false);
            return;
        }
        playNewTrack(queue[nextIndex], nextIndex);
    }, [queue, currentIndex, isShuffled]);


    // ▼▼▼ ОСНОВНА ОНОВЛЕНА ЛОГІКА ТУТ ▼▼▼
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTrackEnd = () => {
            switch (repeatMode) {
                // РЕЖИМ: Повторювати трек нескінченно
                case 'all':
                    audio.currentTime = 0;
                    audio.play();
                    break;

                // РЕЖИМ: Повторити один раз, потім вимкнути і грати наступний
                case 'one':
                    if (!hasRepeatedOnce) {
                        // Це перше завершення, повторюємо трек і ставимо прапорець
                        setHasRepeatedOnce(true);
                        audio.currentTime = 0;
                        audio.play();
                    } else {
                        // Це друге завершення, вимикаємо режим і граємо наступний трек
                        setRepeatMode('off');
                        nextTrack();
                    }
                    break;

                // РЕЖИМ: Без повтору (грати наступний)
                case 'off':
                default:
                    nextTrack();
                    break;
            }
        };

        audio.addEventListener('ended', handleTrackEnd);
        return () => audio.removeEventListener('ended', handleTrackEnd);
        // `nextTrack` тепер залежить тільки від `currentIndex`, `queue`, `isShuffled`, тому його можна оновити
    }, [repeatMode, hasRepeatedOnce, nextTrack]);


    const previousTrack = useCallback(() => {
        if (queue.length === 0) return;
        if (audioRef.current && audioRef.current.currentTime > 3) {
            audioRef.current.currentTime = 0;
            return;
        }

        let prevIndex;
        if (isShuffled) {
            prevIndex = Math.floor(Math.random() * queue.length);
        } else if (currentIndex > 0) {
            prevIndex = currentIndex - 1;
        } else {
            if(audioRef.current) audioRef.current.currentTime = 0;
            return;
        }

        playNewTrack(queue[prevIndex], prevIndex);
    }, [queue, currentIndex, isShuffled]);

    const playFromQueue = useCallback((index) => {
        if (index >= 0 && index < queue.length) {
            playNewTrack(queue[index], index);
        }
    }, [queue]);

    const toggleRepeat = useCallback(() => {
        setRepeatMode(prev => {
            if (prev === 'off') return 'all';
            if (prev === 'all') return 'one';
            if (prev === 'one') return 'off';
            return 'off';
        });
    }, []);

    // ... (решта коду залишається без змін)

    const removeFromQueue = useCallback((index) => {
        setQueue(prev => {
            const newQueue = prev.filter((_, i) => i !== index);
            if (index < currentIndex) {
                setCurrentIndex(curr => curr - 1);
            } else if (index === currentIndex) {
                if (newQueue.length > 0) {
                    const newIndex = Math.min(currentIndex, newQueue.length - 1);
                    playNewTrack(newQueue[newIndex], newIndex);
                } else {
                    stopTrack();
                }
            }
            return newQueue;
        });
    }, [currentIndex, stopTrack, queue]);

    const clearQueue = useCallback(() => {
        setQueue([]);
        stopTrack();
    }, [stopTrack]);

    const addToQueue = useCallback((track) => {
        setQueue(prev => [...prev, track]);
    }, []);

    const toggleShuffle = useCallback(() => setIsShuffled(prev => !prev), []);

    // Інші функції, що не були показані для стислості...
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showQueue, setShowQueue] = useState(false);
    const [showTrackInfo, setShowTrackInfo] = useState(false);
    const [showVolumeControl, setShowVolumeControl] = useState(false);
    const updateVolume = useCallback((newVolume) => { setVolume(Math.max(0, Math.min(1, newVolume))); if (newVolume > 0 && isMuted) setIsMuted(false); }, [isMuted]);
    const toggleMute = useCallback(() => setIsMuted(prev => !prev), []);
    const isTrackPlaying = useCallback((trackId) => currentTrack?.trackId === trackId && isPlaying, [currentTrack, isPlaying]);
    const expandPlayer = useCallback(() => setIsExpanded(true), []);
    const collapsePlayer = useCallback(() => { setIsExpanded(false); setShowQueue(false); setShowTrackInfo(false); setShowVolumeControl(false); }, []);
    const toggleQueue = useCallback(() => { setShowQueue(prev => !prev); setShowTrackInfo(false); setShowVolumeControl(false); }, []);
    const toggleTrackInfo = useCallback(() => { setShowTrackInfo(prev => !prev); setShowQueue(false); setShowVolumeControl(false); }, []);
    const toggleVolumeControl = useCallback(() => { setShowVolumeControl(prev => !prev); setShowQueue(false); setShowTrackInfo(false); }, []);


    const value = {
        currentTrack, isPlaying, playTrack, pauseTrack, stopTrack, resumeTrack, isTrackPlaying, audioRef,
        nextTrack, previousTrack, queue, currentIndex, playFromQueue, addToQueue, removeFromQueue,
        clearQueue, isShuffled, repeatMode, toggleShuffle, toggleRepeat, volume, isMuted,
        updateVolume, toggleMute, isExpanded, showQueue, showTrackInfo, showVolumeControl,
        expandPlayer, collapsePlayer, toggleQueue, toggleTrackInfo, toggleVolumeControl
    };

    return (
        <AudioPlayerContext.Provider value={value}>
            {children}
            <audio ref={audioRef} preload="metadata"/>
        </AudioPlayerContext.Provider>
    );
};