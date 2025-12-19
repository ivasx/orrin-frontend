import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useQueue } from './QueueContext';

import { useAudioElement } from '../hooks/audio/useAudioElement';
import { useAudioPlayback } from '../hooks/audio/useAudioPlayback';
import { useAudioVolume } from '../hooks/audio/useAudioVolume';
import { useRepeatMode } from '../hooks/audio/useRepeatMode';
import { useTrackNavigation } from '../hooks/audio/useTrackNavigation';
import { useTrackEndHandler } from '../hooks/audio/useTrackEndHandler';
import { useMediaSession } from '../hooks/audio/useMediaSession';
import { useMediaSessionPosition } from '../hooks/audio/useMediaSessionPosition';
import { logger } from '../utils/logger';

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

    const { repeatMode, hasRepeatedOnce, setHasRepeatedOnce, toggleRepeat, resetRepeatOnce } = useRepeatMode();
    const audioRef = useAudioElement(trackFromQueue, repeatMode);

    const {
        isPlaying,
        setIsPlaying,
        pause: pauseTrack,
        resume: resumeTrack,
        stop: stopTrack
    } = useAudioPlayback(audioRef, trackFromQueue);

    const { volume, isMuted, updateVolume, toggleMute } = useAudioVolume(audioRef);

    const { playTrackByIndex, nextTrack, previousTrack } = useTrackNavigation(
        queue,
        getNextIndex,
        getPreviousIndex,
        setCurrentIndex,
        setIsPlaying,
        setHasRepeatedOnce,
        audioRef
    );

    const playTrack = useCallback((trackData, trackList = null) => {
        logger.log("[AudioCoreContext playTrack] Отримано trackData:", trackData);
        logger.log("[AudioCoreContext playTrack] trackData.audio (має бути URL):", trackData?.audio);

        if (trackList && Array.isArray(trackList)) {
            const formattedTrackList = trackList.map(t => {
                const needsFormatting = t.hasOwnProperty('audio_url') || t.hasOwnProperty('cover_url');
                return needsFormatting ? {
                    ...t,
                    audio: t.audio_url,
                    cover: t.cover_url,
                } : t;
            });
            logger.log("[AudioCoreContext playTrack] Форматований trackList для черги:", formattedTrackList);
            initializeQueue(formattedTrackList, trackData.trackId);
        } else {
            const indexInCurrentQueue = queue.findIndex(t => t.trackId === trackData.trackId);
            if (indexInCurrentQueue !== -1) {
                playTrackByIndex(indexInCurrentQueue);
            } else {
                const newQueue = [...queue, trackData];
                initializeQueue(newQueue, trackData.trackId);
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


    useTrackEndHandler(
        audioRef,
        repeatMode,
        hasRepeatedOnce,
        setHasRepeatedOnce,
        nextTrack
    );

    useMediaSession(
        trackFromQueue,
        isPlaying,
        resumeTrack,
        pauseTrack,
        stopTrack,
        nextTrack,
        previousTrack
    );

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
        isLoading: false, // TODO: Додати стан завантаження з окремого хука, якщо потрібно
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

        isTrackPlaying: (trackId) => trackFromQueue?.trackId === trackId && isPlaying,
    }), [
        trackFromQueue, isPlaying, repeatMode, volume, isMuted,
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