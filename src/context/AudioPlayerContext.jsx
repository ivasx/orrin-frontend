import React, {createContext, useContext, useState, useCallback, useRef} from 'react'; // Додай useRef

const AudioPlayerContext = createContext();

export const useAudioPlayer = () => {
    const context = useContext(AudioPlayerContext);
    if (!context) {
        throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
    }
    return context;
};

export const AudioPlayerProvider = ({children}) => {
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [queue, setQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [isShuffled, setIsShuffled] = useState(false);
    const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'one', 'all'
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showQueue, setShowQueue] = useState(false);
    const [showTrackInfo, setShowTrackInfo] = useState(false);
    const [showVolumeControl, setShowVolumeControl] = useState(false);
    const audioRef = useRef(null);

    const playTrack = useCallback((trackData, trackList = null) => {
        if (typeof trackData === 'string') {
            console.error('playTrack requires full track object, not just ID');
            return;
        }

        // Якщо передано список треків, встановлюємо чергу
        if (trackList && Array.isArray(trackList)) {
            setQueue(trackList);
            const index = trackList.findIndex(track => track.trackId === trackData.trackId);
            setCurrentIndex(index !== -1 ? index : 0);
        } else if (queue.length === 0) {
            // Якщо черги немає, додаємо поточний трек
            setQueue([trackData]);
            setCurrentIndex(0);
        } else {
            // Оновлюємо індекс в існуючій черзі
            const index = queue.findIndex(track => track.trackId === trackData.trackId);
            if (index !== -1) {
                setCurrentIndex(index);
            } else {
                // Додаємо новий трек до черги
                setQueue(prev => [...prev, trackData]);
                setCurrentIndex(queue.length);
            }
        }

        setCurrentTrack(trackData);
        setIsPlaying(true);
    }, [queue]);

    const pauseTrack = useCallback(() => {
        setIsPlaying(false);
    }, []);

    const stopTrack = useCallback(() => {
        setCurrentTrack(null);
        setIsPlaying(false);
        setCurrentIndex(-1);
    }, []);

    const resumeTrack = useCallback(() => {
        if (currentTrack) {
            setIsPlaying(true);
        }
    }, [currentTrack]);

    const nextTrack = useCallback(() => {
        if (queue.length === 0) return;

        let nextIndex;
        if (isShuffled) {
            // Випадковий наступний трек
            nextIndex = Math.floor(Math.random() * queue.length);
        } else if (currentIndex < queue.length - 1) {
            nextIndex = currentIndex + 1;
        } else if (repeatMode === 'all') {
            nextIndex = 0;
        } else {
            return; // Кінець черги
        }

        const nextTrackData = queue[nextIndex];
        if (nextTrackData) {
            setCurrentIndex(nextIndex);
            setCurrentTrack(nextTrackData);
            setIsPlaying(true);
        }
    }, [queue, currentIndex, isShuffled, repeatMode]);

    const previousTrack = useCallback((forceRestart = false) => {
        if (queue.length === 0) return;

        // Якщо трек грає більше 3 секунд або forceRestart, перезапускаємо поточний
        if (forceRestart) {
            return 'restart';
        }

        let prevIndex;
        if (isShuffled) {
            // Випадковий попередній трек
            prevIndex = Math.floor(Math.random() * queue.length);
        } else if (currentIndex > 0) {
            prevIndex = currentIndex - 1;
        } else if (repeatMode === 'all') {
            prevIndex = queue.length - 1;
        } else {
            return 'restart'; // Перший трек - перезапускаємо
        }

        const prevTrackData = queue[prevIndex];
        if (prevTrackData) {
            setCurrentIndex(prevIndex);
            setCurrentTrack(prevTrackData);
            setIsPlaying(true);
        }
    }, [queue, currentIndex, isShuffled, repeatMode]);

    const playFromQueue = useCallback((index) => {
        if (index >= 0 && index < queue.length) {
            const track = queue[index];
            setCurrentIndex(index);
            setCurrentTrack(track);
            setIsPlaying(true);
        }
    }, [queue]);

    const removeFromQueue = useCallback((index) => {
        setQueue(prev => {
            const newQueue = prev.filter((_, i) => i !== index);
            // Оновлюємо currentIndex якщо потрібно
            if (index < currentIndex) {
                setCurrentIndex(curr => curr - 1);
            } else if (index === currentIndex) {
                // Видаляємо поточний трек
                if (newQueue.length > 0) {
                    const newIndex = Math.min(currentIndex, newQueue.length - 1);
                    setCurrentIndex(newIndex);
                    setCurrentTrack(newQueue[newIndex]);
                } else {
                    stopTrack();
                }
            }
            return newQueue;
        });
    }, [currentIndex, stopTrack]);

    const clearQueue = useCallback(() => {
        setQueue([]);
        setCurrentIndex(-1);
        stopTrack();
    }, [stopTrack]);

    const addToQueue = useCallback((track) => {
        setQueue(prev => [...prev, track]);
    }, []);

    const toggleShuffle = useCallback(() => {
        setIsShuffled(prev => !prev);
    }, []);

    const toggleRepeat = useCallback(() => {
        setRepeatMode(prev => {
            switch (prev) {
                case 'off':
                    return 'all';
                case 'all':
                    return 'one';
                case 'one':
                    return 'off';
                default:
                    return 'off';
            }
        });
    }, []);

    const updateVolume = useCallback((newVolume) => {
        setVolume(Math.max(0, Math.min(1, newVolume)));
        if (newVolume > 0 && isMuted) {
            setIsMuted(false);
        }
    }, [isMuted]);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => !prev);
    }, []);

    const isTrackPlaying = useCallback((trackId) => {
        return currentTrack?.trackId === trackId && isPlaying;
    }, [currentTrack, isPlaying]);

    const expandPlayer = useCallback(() => {
        setIsExpanded(true);
    }, []);

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

    const value = {
        // Basic playback
        currentTrack,
        isPlaying,
        playTrack,
        pauseTrack,
        stopTrack,
        resumeTrack,
        isTrackPlaying,
        audioRef,

        // Navigation
        nextTrack,
        previousTrack,

        // Queue management
        queue,
        currentIndex,
        playFromQueue,
        addToQueue,
        removeFromQueue,
        clearQueue,

        // Playback modes
        isShuffled,
        repeatMode,
        toggleShuffle,
        toggleRepeat,

        // Audio controls
        volume,
        isMuted,
        updateVolume,
        toggleMute,

        // UI states
        isExpanded,
        showQueue,
        showTrackInfo,
        showVolumeControl,
        expandPlayer,
        collapsePlayer,
        toggleQueue,
        toggleTrackInfo,
        toggleVolumeControl
    };

    return (
        <AudioPlayerContext.Provider value={value}>
            {children}
            <audio ref={audioRef} preload="metadata"/>
        </AudioPlayerContext.Provider>
    );
};