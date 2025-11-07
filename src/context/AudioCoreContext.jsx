import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useQueue } from './QueueContext';

// Імпортуємо всі кастомні хуки
import { useAudioElement } from '../hooks/audio/useAudioElement';
import { useAudioPlayback } from '../hooks/audio/useAudioPlayback';
import { useAudioVolume } from '../hooks/audio/useAudioVolume';
import { useRepeatMode } from '../hooks/audio/useRepeatMode';
import { useTrackNavigation } from '../hooks/audio/useTrackNavigation';
import { useTrackEndHandler } from '../hooks/audio/useTrackEndHandler';
import { useMediaSession } from '../hooks/audio/useMediaSession';
import { useMediaSessionPosition } from '../hooks/audio/useMediaSessionPosition';

const AudioCoreContext = createContext();

export const useAudioCore = () => {
    const context = useContext(AudioCoreContext);
    if (!context) {
        throw new Error('useAudioCore must be used within an AudioCoreProvider');
    }
    return context;
};

export const AudioCoreProvider = ({ children }) => {
    // ========== QUEUE CONTEXT ==========
    const {
        currentTrack: trackFromQueue,
        queue,
        getNextIndex,
        getPreviousIndex,
        setCurrentIndex,
        initializeQueue
    } = useQueue();

    // ========== AUDIO ELEMENT ==========
    // Управління HTML <audio> елементом (src, loop)
    const { repeatMode, hasRepeatedOnce, setHasRepeatedOnce, toggleRepeat, resetRepeatOnce } = useRepeatMode();
    const audioRef = useAudioElement(trackFromQueue, repeatMode);

    // ========== PLAYBACK ==========
    // Управління відтворенням (play/pause/stop)
    const {
        isPlaying,
        setIsPlaying,
        pause: pauseTrack,
        resume: resumeTrack,
        stop: stopTrack
    } = useAudioPlayback(audioRef, trackFromQueue);

    // ========== VOLUME ==========
    // Управління гучністю
    const { volume, isMuted, updateVolume, toggleMute } = useAudioVolume(audioRef);

    // ========== TRACK NAVIGATION ==========
    // Навігація між треками
    const { playTrackByIndex, nextTrack, previousTrack } = useTrackNavigation(
        queue,
        getNextIndex,
        getPreviousIndex,
        setCurrentIndex,
        setIsPlaying,
        setHasRepeatedOnce,
        audioRef
    );

    // ========== PLAY TRACK FUNCTION ==========
    // Основна функція для відтворення треку
    const playTrack = useCallback((trackData, trackList = null) => {
        console.log("[AudioCoreContext playTrack] Отримано trackData:", trackData);
        console.log("[AudioCoreContext playTrack] trackData.audio (має бути URL):", trackData?.audio);

        if (trackList && Array.isArray(trackList)) {
            // Форматуємо список треків для черги
            const formattedTrackList = trackList.map(t => {
                const needsFormatting = t.hasOwnProperty('audio_url') || t.hasOwnProperty('cover_url');
                return needsFormatting ? {
                    ...t,
                    audio: t.audio_url,
                    cover: t.cover_url,
                } : t;
            });
            console.log("[AudioCoreContext playTrack] Форматований trackList для черги:", formattedTrackList);
            initializeQueue(formattedTrackList, trackData.trackId);
        } else {
            // Якщо трек вже в черзі, просто відтворюємо його
            const indexInCurrentQueue = queue.findIndex(t => t.trackId === trackData.trackId);
            if (indexInCurrentQueue !== -1) {
                playTrackByIndex(indexInCurrentQueue);
            } else {
                // Додаємо трек до черги
                const newQueue = [...queue, trackData];
                initializeQueue(newQueue, trackData.trackId);
            }
        }
        setIsPlaying(true);
        setHasRepeatedOnce(false);
    }, [initializeQueue, playTrackByIndex, queue, setIsPlaying, setHasRepeatedOnce]);

    // ========== SEEK FUNCTIONS ==========
    // Функції для перемотування
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

    // ========== TRACK END HANDLER ==========
    // Обробка завершення треку
    useTrackEndHandler(
        audioRef,
        repeatMode,
        hasRepeatedOnce,
        setHasRepeatedOnce,
        nextTrack
    );

    // ========== MEDIA SESSION API ==========
    // Інтеграція з системним медіа-контролером
    useMediaSession(
        trackFromQueue,
        isPlaying,
        resumeTrack,
        pauseTrack,
        stopTrack,
        nextTrack,
        previousTrack
    );

    // Оновлення позиції в Media Session
    useMediaSessionPosition(audioRef, trackFromQueue, isPlaying);

    // ========== CONTEXT VALUE ==========
    const value = useMemo(() => ({
        // Стан
        currentTrack: trackFromQueue,
        isPlaying,
        audioRef,
        repeatMode,
        volume,
        isMuted,
        currentTime: audioRef.current?.currentTime || 0,
        duration: audioRef.current?.duration || 0,
        isLoading: false, // TODO: Додати стан завантаження з окремого хука, якщо потрібно

        // Функції відтворення
        playTrack,
        pauseTrack,
        resumeTrack,
        stopTrack,

        // Навігація
        nextTrack,
        previousTrack,

        // Режими
        toggleRepeat,

        // Гучність
        updateVolume,
        toggleMute,

        // Перемотування
        seek,
        seekToPercent,

        // Допоміжні функції
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