import { useState, useEffect, useCallback, useRef } from 'react';

export function useProgressBar(audioRef, isPlaying, resumeTrack, pauseTrack) {
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const progressBarRef = useRef(null);
    const wasPlayingRef = useRef(false);
    const animationFrameRef = useRef(null);
    const lastUpdateTimeRef = useRef(0); // ✅ Для throttling

    // Оновлення часу
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            if (!isDragging) {
                setCurrentTime(audio.currentTime);
            }
        };

        const handleLoadedMetadata = () => {
            if (audio.duration && isFinite(audio.duration)) {
                setDuration(audio.duration);
            }
        };

        const handleDurationChange = () => {
            if (audio.duration && isFinite(audio.duration)) {
                setDuration(audio.duration);
            }
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('durationchange', handleDurationChange);

        if (audio.duration && isFinite(audio.duration)) {
            setDuration(audio.duration);
        }
        setCurrentTime(audio.currentTime);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('durationchange', handleDurationChange);
        };
    }, [audioRef, isDragging]);

    // ✅ ОПТИМІЗАЦІЯ: Мемоізована функція для розрахунку часу
    const getSeekTime = useCallback((event) => {
        if (!progressBarRef.current || !duration || !isFinite(duration)) return 0;

        const rect = progressBarRef.current.getBoundingClientRect();
        const clientX = event.clientX ?? event.touches?.[0]?.clientX;

        if (clientX === undefined) return 0;

        const offsetX = clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, offsetX / rect.width));
        return percentage * duration;
    }, [duration]); // Залежить тільки від duration

    const handleMouseDown = useCallback((e) => {
        e.preventDefault();
        if (!duration || !isFinite(duration)) return;

        wasPlayingRef.current = isPlaying;
        if (isPlaying) {
            pauseTrack();
        }
        setIsDragging(true);
        setCurrentTime(getSeekTime(e.nativeEvent));
    }, [isPlaying, pauseTrack, duration, getSeekTime]);

    const handleMouseUp = useCallback((e) => {
        if (!isDragging) return;
        e.preventDefault();

        const audio = audioRef.current;
        if (!audio) {
            setIsDragging(false);
            return;
        }

        const newTime = getSeekTime(e);

        if (audio.readyState >= 1 && isFinite(newTime)) {
            console.log(`Seeking to: ${newTime.toFixed(2)}`);
            audio.currentTime = newTime;
            setCurrentTime(newTime);
        } else {
            console.warn("Audio not ready for seeking or newTime is invalid.");
        }

        setIsDragging(false);

        if (wasPlayingRef.current) {
            console.log("Resuming track after seek");
            resumeTrack();
        }

    }, [isDragging, resumeTrack, audioRef, getSeekTime]);

    // ✅ ОПТИМІЗАЦІЯ: Throttling для handleMouseMove
    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;
        e.preventDefault();

        const now = performance.now();
        // Throttle до ~60 FPS (16ms між оновленнями)
        if (now - lastUpdateTimeRef.current < 16) return;

        lastUpdateTimeRef.current = now;

        // Скасовуємо попередній запланований кадр
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        animationFrameRef.current = requestAnimationFrame(() => {
            const newTime = getSeekTime(e);
            if (isFinite(newTime)) {
                setCurrentTime(newTime);
            }
        });
    }, [isDragging, getSeekTime]);

    // Глобальні слухачі для перетягування
    useEffect(() => {
        if (!isDragging) return;

        const handleMove = (e) => handleMouseMove(e);
        const handleUp = (e) => handleMouseUp(e);

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleUp);
        document.addEventListener('touchmove', handleMove, { passive: false });
        document.addEventListener('touchend', handleUp);

        return () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleUp);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('touchend', handleUp);

            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const progressPercent = (duration && isFinite(duration) && duration > 0)
        ? (currentTime / duration) * 100
        : 0;

    const formatTime = (seconds) => {
        if (seconds === null || seconds === undefined || isNaN(seconds) || !isFinite(seconds) || seconds < 0) {
            return '0:00';
        }
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return {
        currentTime,
        duration,
        progressPercent,
        progressBarRef,
        handleMouseDown,
        formatTime
    };
}