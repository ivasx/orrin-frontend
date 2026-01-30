import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useQueue } from './QueueContext';
import { useAudioElement } from '../hooks/audio/useAudioElement';
import { useAudioPlayback } from '../hooks/audio/useAudioPlayback';
import { useAudioVolume } from '../hooks/audio/useAudioVolume';
import { useAudioLoading } from '../hooks/audio/useAudioLoading';
import { useRepeatMode } from '../hooks/audio/useRepeatMode';
import { useTrackNavigation } from '../hooks/audio/useTrackNavigation';
import { useTrackEndHandler } from '../hooks/audio/useTrackEndHandler';
import { useMediaSession } from '../hooks/audio/useMediaSession';
import { useMediaSessionPosition } from '../hooks/audio/useMediaSessionPosition';
import { logger } from '../utils/logger';
import { normalizeTrackData } from '../constants/fallbacks';

const AudioCoreContext = createContext();

export const useAudioCore = () => {
    const context = useContext(AudioCoreContext);
    if (!context) {
        throw new Error('useAudioCore must be used within an AudioCoreProvider');
    }
    return context;
};

export const AudioCoreProvider = ({ children }) => {
    const {
        currentTrack: trackFromQueue,
        queue,
        getNextIndex,
        getPreviousIndex,
        setCurrentIndex,
        initializeQueue
    } = useQueue();

    const { repeatMode, hasRepeatedOnce, setHasRepeatedOnce, toggleRepeat } = useRepeatMode();
    const audioRef = useAudioElement(trackFromQueue, repeatMode);

    const {
        isPlaying,
        setIsPlaying,
        pause: pauseTrack,
        resume: resumeTrack,
        stop: stopTrack
    } = useAudioPlayback(audioRef, trackFromQueue);

    const { volume, isMuted, updateVolume, toggleMute } = useAudioVolume(audioRef);
    const { isLoading, loadError } = useAudioLoading(audioRef);

    const { playTrackByIndex, nextTrack, previousTrack } = useTrackNavigation(
        queue,
        getNextIndex,
        getPreviousIndex,
        setCurrentIndex,
        setIsPlaying,
        setHasRepeatedOnce,
        audioRef
    );

    const playTrack = useCallback((rawTrackData, rawTrackList = null) => {
        const cleanTrackData = normalizeTrackData(rawTrackData);

        if (!cleanTrackData) {
            logger.error('[AudioCoreContext] Playback failed: Invalid track data', rawTrackData);
            return;
        }

        if (rawTrackList && Array.isArray(rawTrackList)) {
            const cleanQueueList = rawTrackList
                .map(normalizeTrackData)
                .filter(Boolean);

            initializeQueue(cleanQueueList, cleanTrackData.trackId);
        } else {
            const indexInCurrentQueue = queue.findIndex(t => t.trackId === cleanTrackData.trackId);
            if (indexInCurrentQueue !== -1) {
                playTrackByIndex(indexInCurrentQueue);
            } else {
                const newQueue = [...queue, cleanTrackData];
                initializeQueue(newQueue, cleanTrackData.trackId);
            }
        }

        setIsPlaying(true);
        setHasRepeatedOnce(false);
    }, [initializeQueue, playTrackByIndex, queue, setIsPlaying, setHasRepeatedOnce]);

    const seek = useCallback((time) => {
        const audio = audioRef.current;
        if (audio && isFinite(time)) {
            audio.currentTime = Math.max(0, Math.min(time, audio.duration || 0));
        }
    }, [audioRef]);

    const seekToPercent = useCallback((percent) => {
        const audio = audioRef.current;
        if (audio && audio.duration && isFinite(percent)) {
            const time = (percent / 100) * audio.duration;
            seek(time);
        }
    }, [audioRef, seek]);

    useTrackEndHandler(audioRef, repeatMode, hasRepeatedOnce, setHasRepeatedOnce, nextTrack);
    useMediaSession(trackFromQueue, isPlaying, resumeTrack, pauseTrack, stopTrack, nextTrack, previousTrack);
    useMediaSessionPosition(audioRef, trackFromQueue, isPlaying);

    const value = useMemo(() => ({
        currentTrack: trackFromQueue,
        isPlaying,
        audioRef,
        repeatMode,
        volume,
        isMuted,
        currentTime: audioRef.current?.currentTime || 0,
        duration: audioRef.current?.duration || 0,
        isLoading,
        loadError,
        playTrack,
        pauseTrack,
        resumeTrack,
        stopTrack,
        nextTrack,
        previousTrack,
        toggleRepeat,
        updateVolume,
        toggleMute,
        seek,
        seekToPercent,
        isTrackPlaying: (trackId) => trackFromQueue?.trackId === String(trackId) && isPlaying,
    }), [
        trackFromQueue, isPlaying, repeatMode, volume, isMuted, isLoading, loadError,
        playTrack, pauseTrack, resumeTrack, stopTrack, nextTrack, previousTrack,
        toggleRepeat, updateVolume, toggleMute, seek, seekToPercent, audioRef
    ]);

    return (
        <AudioCoreContext.Provider value={value}>
            {children}
            <audio ref={audioRef} preload="metadata" />
        </AudioCoreContext.Provider>
    );
};