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
            setDuration(audio.duration);
            setCurrentTime(audio.currentTime);
        };

        const handleDurationChange = () => {
            setDuration(audio.duration);
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('durationchange', handleDurationChange);

        if (audio.duration) {
            setDuration(audio.duration);
            setCurrentTime(audio.currentTime);
        }

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('durationchange', handleDurationChange);
        };
    }, [audioRef, isDragging]);

    const calculateTimeFromPosition = useCallback((clientX) => {
        if (!progressBarRef.current || !duration) return null;

        const rect = progressBarRef.current.getBoundingClientRect();
        const offsetX = clientX - rect.left;
        const width = rect.width;
        const percent = Math.max(0, Math.min(1, offsetX / width));
        return percent * duration;
    }, [duration]);

    const seekToTime = useCallback((time) => {
        const audio = audioRef.current;
        if (!audio || !isFinite(time)) return;

        audio.currentTime = Math.max(0, Math.min(time, duration || audio.duration));
        setCurrentTime(audio.currentTime);
    }, [audioRef, duration]);

    const handleMouseDown = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
        wasPlayingBeforeDrag.current = isPlaying;

        if (isPlaying) {
            pauseTrack();
        }

        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const newTime = calculateTimeFromPosition(clientX);
        if (newTime !== null) {
            seekToTime(newTime);
        }
    }, [isPlaying, pauseTrack, calculateTimeFromPosition, seekToTime]);

    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;
        e.preventDefault();

        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const newTime = calculateTimeFromPosition(clientX);
        if (newTime !== null) {
            setCurrentTime(newTime);
        }
    }, [isDragging, calculateTimeFromPosition]);

    const handleMouseUp = useCallback((e) => {
        if (!isDragging) return;

        const clientX = e.type.includes('touch')
            ? (e.changedTouches?.[0]?.clientX ?? currentTime / duration * progressBarRef.current?.getBoundingClientRect().width)
            : e.clientX;

        const newTime = calculateTimeFromPosition(clientX);
        if (newTime !== null) {
            seekToTime(newTime);
        }

        setIsDragging(false);

        if (wasPlayingBeforeDrag.current) {
            resumeTrack();
        }
        wasPlayingBeforeDrag.current = false;
    }, [isDragging, calculateTimeFromPosition, seekToTime, resumeTrack, currentTime, duration]);

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