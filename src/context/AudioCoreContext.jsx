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
    const {
        currentTrack: trackFromQueue,
        queue,
        getNextIndex,
        getPreviousIndex,
        setCurrentIndex,
        initializeQueue
    } = useQueue();

    const [isPlaying, setIsPlaying] = useState(false);
    const [repeatMode, setRepeatMode] = useState('off');
    const audioRef = useRef(null);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [hasRepeatedOnce, setHasRepeatedOnce] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const prevTrackIdRef = useRef(null);

    // Функція для перемотування
    const seek = useCallback((time) => {
        const audio = audioRef.current;
        if (audio && isFinite(time)) {
            audio.currentTime = Math.max(0, Math.min(time, audio.duration || 0));
            setCurrentTime(audio.currentTime);
        }
    }, []);

    // Функція для перемотування на відсоток
    const seekToPercent = useCallback((percent) => {
        const audio = audioRef.current;
        if (audio && audio.duration && isFinite(percent)) {
            const time = (percent / 100) * audio.duration;
            seek(time);
        }
    }, [seek]);

    const playTrackByIndex = useCallback((index) => {
        if (index >= 0 && index < queue.length) {
            setCurrentIndex(index);
            setIsPlaying(true);
            setHasRepeatedOnce(false);
        } else {
            console.warn(`[AudioCoreContext] Спроба відтворити трек з невалідним індексом: ${index}`);
            setIsPlaying(false);
            setCurrentIndex(-1);
        }
    }, [queue, setCurrentIndex]);

    const playTrack = useCallback((trackData, trackList = null) => {
        console.log("[AudioCoreContext playTrack] Отримано trackData:", trackData);
        console.log("[AudioCoreContext playTrack] trackData.audio (має бути URL):", trackData?.audio);

        if (trackList && Array.isArray(trackList)) {
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
        const audio = audioRef.current;
        if (audio) {
            audio.pause();
            audio.removeAttribute('src');
            audio.load();
            audio.currentTime = 0;
        }
        prevTrackIdRef.current = null;
        setCurrentTime(0);
        setDuration(0);
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
        const audio = audioRef.current;
        if (audio && audio.currentTime > 3) {
            audio.currentTime = 0;
            if (!isPlaying) setIsPlaying(true);
            return;
        }
        const prevIndex = getPreviousIndex();
        if (prevIndex !== -1) {
            playTrackByIndex(prevIndex);
        } else if (audio) {
            audio.currentTime = 0;
            if (!isPlaying) setIsPlaying(true);
        }
    }, [getPreviousIndex, playTrackByIndex, isPlaying]);

    const toggleRepeat = useCallback(() => {
        setRepeatMode(prev => {
            const nextMode = prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off';
            if (nextMode !== 'one') {
                setHasRepeatedOnce(false);
            }
            console.log(`[AudioCoreContext] Перемикання режиму повтору: ${prev} -> ${nextMode}`);
            return nextMode;
        });
    }, []);

    const updateVolume = useCallback((newVolume) => {
        const clampedVolume = Math.max(0, Math.min(1, newVolume));
        setVolume(clampedVolume);
        const audio = audioRef.current;
        if (audio) {
            audio.volume = clampedVolume;
        }
        if (clampedVolume > 0 && isMuted) {
            setIsMuted(false);
            if (audio) audio.muted = false;
        }
    }, [isMuted]);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => {
            const newMuted = !prev;
            const audio = audioRef.current;
            if (audio) {
                audio.muted = newMuted;
            }
            return newMuted;
        });
    }, []);

    // Ефект для встановлення src
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        console.log("[AudioCoreContext useEffect src] trackFromQueue з useQueue():", trackFromQueue);
        const audioSource = trackFromQueue?.audio;
        console.log("[AudioCoreContext useEffect src] Визначено audioSource:", audioSource);

        const currentTrackId = trackFromQueue?.trackId;

        if (currentTrackId !== prevTrackIdRef.current) {
            prevTrackIdRef.current = currentTrackId;

            if (trackFromQueue && audioSource) {
                if (audio.src !== audioSource) {
                    console.log("[AudioCoreContext useEffect] Встановлення нового src:", audioSource);
                    setIsLoading(true);
                    audio.src = audioSource;
                    audio.currentTime = 0;
                    audio.load();
                    setCurrentTime(0);
                } else {
                    console.log("[AudioCoreContext useEffect] src той самий, нічого не робимо:", audioSource);
                }
            } else if (!trackFromQueue && audio.src) {
                console.log("[AudioCoreContext useEffect] Очищення src");
                audio.pause();
                audio.removeAttribute('src');
                audio.load();
                audio.currentTime = 0;
                setCurrentTime(0);
                setDuration(0);
            } else {
                console.log("[AudioCoreContext useEffect] Немає trackFromQueue або audioSource, src не встановлено.");
            }
        } else {
            console.log("[AudioCoreContext useEffect] trackId не змінився, src не чіпаємо.");
        }
    }, [trackFromQueue]);

    // Ефект для loop
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const shouldLoop = repeatMode === 'all';
        if (audio.loop !== shouldLoop) {
            console.log(`[AudioCoreContext] Встановлення audio.loop = ${shouldLoop}`);
            audio.loop = shouldLoop;
        }
    }, [repeatMode]);

    // Ефект для play/pause
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !audio.src) {
            if (isPlaying) setIsPlaying(false);
            return;
        }

        let playPromise = null;

        if (isPlaying) {
            if (audio.paused) {
                console.log("[AudioCoreContext] Спроба відтворити (audio.play)");
                playPromise = audio.play();
            }
        } else {
            if (!audio.paused) {
                console.log("[AudioCoreContext] Пауза (audio.pause)");
                audio.pause();
            }
        }

        if (playPromise) {
            playPromise.catch(error => {
                console.error("[AudioCoreContext] Помилка відтворення audio.play():", error);
                setIsPlaying(false);
            });
        }
    }, [isPlaying, trackFromQueue]);

    // Ефект для обробки ended
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTrackEnd = () => {
            console.log("[AudioCoreContext] Трек завершився. Режим повтору:", repeatMode, "Повторено раз:", hasRepeatedOnce);

            if (repeatMode === 'one') {
                if (!hasRepeatedOnce) {
                    setHasRepeatedOnce(true);
                    console.log("[AudioCoreContext] Повтор 'one': перезапуск треку.");
                    audio.currentTime = 0;
                    audio.play().catch(e => console.error("Помилка при повторі 'one':", e));
                } else {
                    console.log("[AudioCoreContext] Повтор 'one' завершено. Наступний трек.");
                    setHasRepeatedOnce(false);
                    nextTrack();
                }
            } else if (repeatMode === 'off') {
                console.log("[AudioCoreContext] Повтор 'off'. Наступний трек.");
                nextTrack();
            }
        };

        audio.addEventListener('ended', handleTrackEnd);
        return () => audio.removeEventListener('ended', handleTrackEnd);
    }, [repeatMode, hasRepeatedOnce, nextTrack]);

    // Ефект для оновлення currentTime та duration
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
            setIsLoading(false);
        };

        const handleCanPlay = () => {
            setIsLoading(false);
        };

        const handleWaiting = () => {
            setIsLoading(true);
        };

        const handleLoadStart = () => {
            setIsLoading(true);
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('waiting', handleWaiting);
        audio.addEventListener('loadstart', handleLoadStart);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('waiting', handleWaiting);
            audio.removeEventListener('loadstart', handleLoadStart);
        };
    }, []);

    // Media Session API
    useEffect(() => {
        if (!('mediaSession' in navigator)) {
            console.warn("Media Session API не підтримується.");
            return;
        }

        if (!trackFromQueue) {
            navigator.mediaSession.metadata = null;
            navigator.mediaSession.playbackState = "none";
            try {
                navigator.mediaSession.setActionHandler('play', null);
                navigator.mediaSession.setActionHandler('pause', null);
                navigator.mediaSession.setActionHandler('stop', null);
                navigator.mediaSession.setActionHandler('previoustrack', null);
                navigator.mediaSession.setActionHandler('nexttrack', null);
                navigator.mediaSession.setActionHandler('seekbackward', null);
                navigator.mediaSession.setActionHandler('seekforward', null);
                navigator.mediaSession.setActionHandler('seekto', null);
            } catch (error) {
                console.error("[AudioCoreContext] Помилка очищення Media Session:", error);
            }
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

            // Додаємо підтримку seekto
            navigator.mediaSession.setActionHandler('seekto', (details) => {
                if (details.seekTime !== undefined) {
                    seek(details.seekTime);
                }
            });

            // Перемотування назад/вперед на 10 секунд
            navigator.mediaSession.setActionHandler('seekbackward', (details) => {
                const audio = audioRef.current;
                if (audio) {
                    const skipTime = details.seekOffset || 10;
                    seek(Math.max(0, audio.currentTime - skipTime));
                }
            });

            navigator.mediaSession.setActionHandler('seekforward', (details) => {
                const audio = audioRef.current;
                if (audio) {
                    const skipTime = details.seekOffset || 10;
                    seek(Math.min(audio.duration, audio.currentTime + skipTime));
                }
            });
        } catch (error) {
            console.error("[AudioCoreContext] Помилка встановлення обробників Media Session:", error);
        }
    }, [trackFromQueue, isPlaying, resumeTrack, pauseTrack, nextTrack, previousTrack, stopTrack, seek]);

    // Position State
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
                } catch (error) {
                    // Ігноруємо помилки
                }
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
                if (navigator.mediaSession?.setPositionState) {
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
        currentTime,
        duration,
        isLoading,
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
        trackFromQueue, isPlaying, repeatMode, volume, isMuted, currentTime, duration, isLoading,
        playTrack, pauseTrack, resumeTrack, stopTrack, nextTrack, previousTrack,
        toggleRepeat, updateVolume, toggleMute, seek, seekToPercent
    ]);

    return (
        <AudioCoreContext.Provider value={value}>
            {children}
            <audio ref={audioRef} preload="metadata" />
        </AudioCoreContext.Provider>
    );
};