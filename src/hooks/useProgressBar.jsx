import { useState, useEffect, useCallback, useRef } from 'react';

export function useProgressBar(audioRef, isPlaying, resumeTrack, pauseTrack) {
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const progressBarRef = useRef(null);
    const wasPlayingRef = useRef(false);
    const animationFrameRef = useRef(null);

    // Оновлення часу
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            if (!isDragging) {
                setCurrentTime(audio.currentTime);
            }
        };
        const handleLoadedData = () => setDuration(audio.duration);

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadeddata', handleLoadedData);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadeddata', handleLoadedData);
        };
    }, [audioRef, isDragging]);

    const getSeekTime = (event) => {
        if (!progressBarRef.current || !duration) return 0;
        const rect = progressBarRef.current.getBoundingClientRect();
        const offsetX = (event.clientX || event.touches[0].clientX) - rect.left;
        const percentage = Math.max(0, Math.min(1, offsetX / rect.width));
        return percentage * duration;
    };

    const handleMouseDown = useCallback((e) => {
        wasPlayingRef.current = isPlaying;
        if (isPlaying) pauseTrack();
        setIsDragging(true);
        setCurrentTime(getSeekTime(e.nativeEvent));
    }, [isPlaying, pauseTrack, duration]);

    const handleMouseUp = useCallback((e) => {
        if (!isDragging) return;

        const newTime = getSeekTime(e);
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
        }
        setCurrentTime(newTime);
        setIsDragging(false);
        if (wasPlayingRef.current) resumeTrack();
    }, [isDragging, resumeTrack, audioRef, duration]);

    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;

        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = requestAnimationFrame(() => {
            setCurrentTime(getSeekTime(e));
        });
    }, [isDragging, duration]);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchmove', handleMouseMove);
        window.addEventListener('touchend', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleMouseMove);
            window.removeEventListener('touchend', handleMouseUp);
            cancelAnimationFrame(animationFrameRef.current);
        };
    }, [handleMouseMove, handleMouseUp]);

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    const formatTime = (seconds) => {
        if (isNaN(seconds) || seconds < 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return {
        currentTime, duration, progressPercent, progressBarRef,
        handleMouseDown, formatTime
    };
}