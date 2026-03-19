import { useState, useRef, useCallback, useEffect } from 'react';

export const useProgressBar = (audioRef, isPlaying, resumeTrack, pauseTrack) => {
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const progressBarRef = useRef(null);
    const wasPlayingBeforeDrag = useRef(false);

    const formatTime = useCallback((seconds) => {
        if (!isFinite(seconds) || seconds < 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }, []);

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            if (!isDragging) {
                setCurrentTime(audio.currentTime);
            }
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration || 0);
            setCurrentTime(audio.currentTime || 0);
        };

        const handleDurationChange = () => {
            setDuration(audio.duration || 0);
        };

        const handleEmptied = () => {
            setCurrentTime(0);
            setDuration(0);
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('durationchange', handleDurationChange);
        audio.addEventListener('emptied', handleEmptied);

        if (audio.duration) {
            setDuration(audio.duration);
            setCurrentTime(audio.currentTime);
        }

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('durationchange', handleDurationChange);
            audio.removeEventListener('emptied', handleEmptied);
        };
    }, [audioRef, isDragging]);

    const calculateTimeFromPosition = useCallback((clientX) => {
        if (!progressBarRef.current || !duration) return null;

        const rect = progressBarRef.current.getBoundingClientRect();
        const offsetX = clientX - rect.left;
        const percent = Math.max(0, Math.min(1, offsetX / rect.width));
        return percent * duration;
    }, [duration]);

    const seekToTime = useCallback((time) => {
        const audio = audioRef.current;
        if (!audio || !isFinite(time)) return;
        audio.currentTime = Math.max(0, Math.min(time, duration || audio.duration || 0));
        setCurrentTime(audio.currentTime);
    }, [audioRef, duration]);

    const getClientX = (e) => {
        if (e.type && e.type.includes('touch')) {
            return (e.touches?.[0] || e.changedTouches?.[0])?.clientX;
        }
        return e.clientX;
    };

    const handleMouseDown = useCallback((e) => {
        e.preventDefault();

        wasPlayingBeforeDrag.current = isPlaying;

        setIsDragging(true);

        if (isPlaying) {
            pauseTrack();
        }

        const clientX = getClientX(e.nativeEvent || e);
        if (clientX === undefined) return;

        const newTime = calculateTimeFromPosition(clientX);
        if (newTime !== null) {
            seekToTime(newTime);
        }
    }, [isPlaying, pauseTrack, calculateTimeFromPosition, seekToTime]);

    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;
        e.preventDefault();

        const clientX = getClientX(e);
        if (clientX === undefined) return;

        const newTime = calculateTimeFromPosition(clientX);
        if (newTime !== null) {
            setCurrentTime(newTime);
        }
    }, [isDragging, calculateTimeFromPosition]);

    const handleMouseUp = useCallback((e) => {
        if (!isDragging) return;

        const clientX = getClientX(e);
        if (clientX !== undefined) {
            const newTime = calculateTimeFromPosition(clientX);
            if (newTime !== null) {
                seekToTime(newTime);
            }
        }

        setIsDragging(false);

        if (wasPlayingBeforeDrag.current) {
            setTimeout(() => {
                resumeTrack();
            }, 0);
        }
        wasPlayingBeforeDrag.current = false;
    }, [isDragging, calculateTimeFromPosition, seekToTime, resumeTrack]);

    useEffect(() => {
        if (!isDragging) return;

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchmove', handleMouseMove, { passive: false });
        document.addEventListener('touchend', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleMouseMove);
            document.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return {
        currentTime,
        duration,
        progressPercent,
        progressBarRef,
        handleMouseDown,
        formatTime,
        isDragging,
        seekToTime,
    };
};