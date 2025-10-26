// src/context/AudioCoreContext.jsx
import React, { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useQueue } from './QueueContext';

const AudioCoreContext = createContext();

export const useAudioCore = () => {
    const context = useContext(AudioCoreContext);
    if (!context) {
        throw new Error('useAudioCore must be used within an AudioCoreProvider');
    }
    return context;
};

export const AudioCoreProvider = ({ children }) => {
    const { currentTrack: trackFromQueue, queue, getNextIndex, getPreviousIndex, setCurrentIndex, initializeQueue } = useQueue();

    const [isPlaying, setIsPlaying] = useState(false);
    const [repeatMode, setRepeatMode] = useState('off');
    const audioRef = useRef(null);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [hasRepeatedOnce, setHasRepeatedOnce] = useState(false);

    // Ref для відстеження попереднього треку (щоб уникнути зайвих оновлень src)
    const prevTrackIdRef = useRef(null);

    const playTrackByIndex = useCallback((index) => {
        if (index >= 0 && index < queue.length) {
            setCurrentIndex(index);
            setIsPlaying(true);
            setHasRepeatedOnce(false);
        } else {
            console.warn(`Attempted to play track with invalid index: ${index}`);
            setIsPlaying(false);
            setCurrentIndex(-1);
        }
    }, [queue, setCurrentIndex]);

    const playTrack = useCallback((trackData, trackList = null) => {
        if (trackList && Array.isArray(trackList)) {
            initializeQueue(trackList, trackData.trackId);
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
    }, [initializeQueue, playTrackByIndex, queue]);

    const pauseTrack = useCallback(() => setIsPlaying(false), []);

    const resumeTrack = useCallback(() => {
        if (trackFromQueue) setIsPlaying(true);
    }, [trackFromQueue]);

    const stopTrack = useCallback(() => {
        setIsPlaying(false);
        setCurrentIndex(-1);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.removeAttribute('src');
            audioRef.current.load();
            audioRef.current.currentTime = 0;
        }
    }, [setCurrentIndex]);

    const nextTrack = useCallback(() => {
        const nextIndex = getNextIndex();
        if (nextIndex !== -1) {
            playTrackByIndex(nextIndex);
        } else {
            setIsPlaying(false);
        }
    }, [getNextIndex, playTrackByIndex]);

    const previousTrack = useCallback(() => {
        if (audioRef.current && audioRef.current.currentTime > 3) {
            audioRef.current.currentTime = 0;
            setIsPlaying(true);
            return;
        }
        const prevIndex = getPreviousIndex();
        if (prevIndex !== -1) {
            playTrackByIndex(prevIndex);
        } else if (audioRef.current) {
            audioRef.current.currentTime = 0;
            setIsPlaying(true);
        }
    }, [getPreviousIndex, playTrackByIndex]);

    const toggleRepeat = useCallback(() => {
        setRepeatMode(prev => {
            const nextMode = prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off';
            if (nextMode !== 'one') {
                setHasRepeatedOnce(false);
            }
            console.log(`Toggling repeat mode from ${prev} to ${nextMode}`);
            return nextMode;
        });
    }, []);

    const updateVolume = useCallback((newVolume) => {
        const clampedVolume = Math.max(0, Math.min(1, newVolume));
        setVolume(clampedVolume);
        if (audioRef.current) {
            audioRef.current.volume = clampedVolume;
        }
        if (clampedVolume > 0 && isMuted) {
            setIsMuted(false);
            if (audioRef.current) audioRef.current.muted = false;
        }
    }, [isMuted]);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => {
            const newMuted = !prev;
            if (audioRef.current) {
                audioRef.current.muted = newMuted;
            }
            return newMuted;
        });
    }, []);

    // ✅ ВИПРАВЛЕННЯ 1: Розділення useEffect для src та loop
    // Оновлення src ТІЛЬКИ при зміні треку
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const currentTrackId = trackFromQueue?.trackId;

        // Перевіряємо чи змінився трек
        if (currentTrackId !== prevTrackIdRef.current) {
            prevTrackIdRef.current = currentTrackId;

            if (trackFromQueue && audio.src !== trackFromQueue.audio) {
                console.log("Setting new src:", trackFromQueue.audio);
                audio.src = trackFromQueue.audio;
                audio.currentTime = 0;
            } else if (!trackFromQueue && audio.src) {
                console.log("Clearing src");
                audio.pause();
                audio.removeAttribute('src');
                audio.load();
                audio.currentTime = 0;
            }
        }
    }, [trackFromQueue]); // ❌ НЕ включаємо repeatMode!

    // ✅ ОКРЕМИЙ useEffect для оновлення loop (БЕЗ зміни src або currentTime)
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const shouldLoop = repeatMode === 'all';
        if (audio.loop !== shouldLoop) {
            console.log(`Setting audio loop attribute to: ${shouldLoop}`);
            audio.loop = shouldLoop;
        }
    }, [repeatMode]); // Тільки repeatMode

    // useEffect для керування play/pause (без змін)
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !audio.src) {
            if (isPlaying) setIsPlaying(false);
            return;
        }
        let playPromise = null;
        if (isPlaying) {
            if (audio.paused) {
                console.log("AudioCore: Attempting to play");
                playPromise = audio.play();
            }
        } else {
            if (!audio.paused) {
                console.log("AudioCore: Pausing");
                audio.pause();
            }
        }
        if (playPromise) {
            playPromise.catch(error => {
                console.error("Audio play error:", error);
                setIsPlaying(false);
            });
        }
    }, [isPlaying, trackFromQueue]);

    // Обробка завершення треку
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTrackEnd = () => {
            console.log("Track ended. Repeat mode:", repeatMode, "Has repeated once:", hasRepeatedOnce);

            if (repeatMode === 'one') {
                if (!hasRepeatedOnce) {
                    setHasRepeatedOnce(true);
                    console.log("Repeating once. Restarting playback.");
                    audio.currentTime = 0;
                    // Явно запускаємо відтворення
                    audio.play().catch(e => console.error("Repeat play error:", e));
                } else {
                    console.log("Finished repeating once. Playing next.");
                    setHasRepeatedOnce(false);
                    nextTrack();
                }
            } else if (repeatMode === 'off') {
                console.log("Repeat off. Playing next.");
                nextTrack();
            }
        };

        audio.addEventListener('ended', handleTrackEnd);
        return () => audio.removeEventListener('ended', handleTrackEnd);
    }, [repeatMode, hasRepeatedOnce, nextTrack]);

    // Media Session API Integration
    useEffect(() => {
        if (!('mediaSession' in navigator)) return;

        if (!trackFromQueue) {
            navigator.mediaSession.metadata = null;
            navigator.mediaSession.playbackState = "none";
            try {
                navigator.mediaSession.setActionHandler('play', null);
                navigator.mediaSession.setActionHandler('pause', null);
                navigator.mediaSession.setActionHandler('stop', null);
                navigator.mediaSession.setActionHandler('previoustrack', null);
                navigator.mediaSession.setActionHandler('nexttrack', null);
            } catch (error) {}
            return;
        }

        const { title, artist, cover } = trackFromQueue;
        navigator.mediaSession.metadata = new MediaMetadata({
            title: title || 'Unknown Title',
            artist: artist || 'Unknown Artist',
            album: 'Orrin',
            artwork: [
                { src: cover || '/orrin-logo.svg', sizes: '96x96',   type: 'image/png' },
                { src: cover || '/orrin-logo.svg', sizes: '128x128', type: 'image/png' },
                { src: cover || '/orrin-logo.svg', sizes: '192x192', type: 'image/png' },
                { src: cover || '/orrin-logo.svg', sizes: '256x256', type: 'image/png' },
                { src: cover || '/orrin-logo.svg', sizes: '384x384', type: 'image/png' },
                { src: cover || '/orrin-logo.svg', sizes: '512x512', type: 'image/png' },
            ]
        });

        navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";

        try {
            navigator.mediaSession.setActionHandler('play', () => { console.log("Media Session: Play"); resumeTrack(); });
            navigator.mediaSession.setActionHandler('pause', () => { console.log("Media Session: Pause"); pauseTrack(); });
            navigator.mediaSession.setActionHandler('stop', () => { console.log("Media Session: Stop"); stopTrack(); });
            navigator.mediaSession.setActionHandler('previoustrack', () => { console.log("Media Session: Previous"); previousTrack(); });
            navigator.mediaSession.setActionHandler('nexttrack', () => { console.log("Media Session: Next"); nextTrack(); });
            navigator.mediaSession.setActionHandler('seekbackward', null);
            navigator.mediaSession.setActionHandler('seekforward', null);
            navigator.mediaSession.setActionHandler('seekto', null);
        } catch (error) {
            console.error("Media Session handler error:", error);
        }

    }, [trackFromQueue, isPlaying, resumeTrack, pauseTrack, nextTrack, previousTrack, stopTrack]);

    // Оновлення прогрес-бару в системному віджеті
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !('mediaSession' in navigator) || !('setPositionState' in navigator.mediaSession)) return;

        let intervalId = null;

        const updatePositionState = () => {
            if (isFinite(audio.duration) && audio.duration > 0 && isFinite(audio.currentTime)) {
                try {
                    navigator.mediaSession.setPositionState({
                        duration: audio.duration,
                        position: audio.currentTime,
                        playbackRate: audio.playbackRate,
                    });
                } catch (error) {}
            }
        };

        const startInterval = () => {
            clearInterval(intervalId);
            updatePositionState();
            intervalId = setInterval(updatePositionState, 1000);
        };

        audio.addEventListener('loadedmetadata', startInterval);
        audio.addEventListener('play', startInterval);
        audio.addEventListener('playing', startInterval);
        audio.addEventListener('pause', () => clearInterval(intervalId));
        audio.addEventListener('seeked', updatePositionState);

        if (isPlaying && audio.duration && audio.duration > 0) {
            startInterval();
        }

        return () => {
            clearInterval(intervalId);
            audio.removeEventListener('loadedmetadata', startInterval);
            audio.removeEventListener('play', startInterval);
            audio.removeEventListener('playing', startInterval);
            audio.removeEventListener('pause', () => clearInterval(intervalId));
            audio.removeEventListener('seeked', updatePositionState);
            try {
                if (navigator.mediaSession && navigator.mediaSession.setPositionState) {
                    navigator.mediaSession.setPositionState(null);
                }
            } catch (error) {}
        };
    }, [trackFromQueue, isPlaying]);

    const value = useMemo(() => ({
        currentTrack: trackFromQueue,
        isPlaying,
        audioRef,
        repeatMode,
        volume,
        isMuted,
        playTrack,
        pauseTrack,
        resumeTrack,
        stopTrack,
        nextTrack,
        previousTrack,
        toggleRepeat,
        updateVolume,
        toggleMute,
        isTrackPlaying: (trackId) => trackFromQueue?.trackId === trackId && isPlaying,
    }), [
        trackFromQueue, isPlaying, audioRef, repeatMode, volume, isMuted,
        playTrack, pauseTrack, resumeTrack, stopTrack, nextTrack, previousTrack,
        toggleRepeat, updateVolume, toggleMute
    ]);

    return (
        <AudioCoreContext.Provider value={value}>
            {children}
            <audio ref={audioRef} preload="metadata" />
        </AudioCoreContext.Provider>
    );
};