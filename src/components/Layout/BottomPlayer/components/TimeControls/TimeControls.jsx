import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAudioCore } from '../../../../../../context/AudioCoreContext';
import styles from './TimeControls.module.css';

const formatTime = (timeInSeconds) => {
    if (!timeInSeconds || isNaN(timeInSeconds)) return '0:00';
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function TimeControls() {
    const { audioRef } = useAudioCore();

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const progressBarRef = useRef(null);
    const animationRef = useRef(null);

    const syncProgress = useCallback(() => {
        if (!audioRef.current || isDragging) return;
        setCurrentTime(audioRef.current.currentTime || 0);
        setDuration(audioRef.current.duration || 0);
        animationRef.current = requestAnimationFrame(syncProgress);
    }, [audioRef, isDragging]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handlePlay = () => {
            animationRef.current = requestAnimationFrame(syncProgress);
        };

        const handlePause = () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (!isDragging) {
                setCurrentTime(audio.currentTime || 0);
            }
        };

        const handleDurationChange = () => setDuration(audio.duration || 0);

        const handleTimeUpdate = () => {
            if (!isDragging && audio.paused) {
                setCurrentTime(audio.currentTime || 0);
            }
        };

        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('durationchange', handleDurationChange);
        audio.addEventListener('timeupdate', handleTimeUpdate);

        setCurrentTime(audio.currentTime || 0);
        setDuration(audio.duration || 0);

        if (!audio.paused) {
            handlePlay();
        }

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('durationchange', handleDurationChange);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, [audioRef, syncProgress, isDragging]);

    const calculateTimeFromEvent = useCallback((e) => {
        if (!progressBarRef.current || !audioRef.current || !duration) return null;
        const rect = progressBarRef.current.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
        return (offsetX / rect.width) * duration;
    }, [audioRef, duration]);

    const handleSeekStart = useCallback((e) => {
        setIsDragging(true);
        const newTime = calculateTimeFromEvent(e);
        if (newTime !== null) setCurrentTime(newTime);
    }, [calculateTimeFromEvent]);

    const handleSeekMove = useCallback((e) => {
        if (!isDragging) return;
        const newTime = calculateTimeFromEvent(e);
        if (newTime !== null) setCurrentTime(newTime);
    }, [isDragging, calculateTimeFromEvent]);

    const handleSeekEnd = useCallback(() => {
        if (isDragging && audioRef.current && isFinite(currentTime)) {
            audioRef.current.currentTime = currentTime;
        }
        setIsDragging(false);
    }, [isDragging, audioRef, currentTime]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleSeekMove);
            window.addEventListener('mouseup', handleSeekEnd);
            window.addEventListener('touchmove', handleSeekMove, { passive: false });
            window.addEventListener('touchend', handleSeekEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleSeekMove);
            window.removeEventListener('mouseup', handleSeekEnd);
            window.removeEventListener('touchmove', handleSeekMove);
            window.removeEventListener('touchend', handleSeekEnd);
        };
    }, [isDragging, handleSeekMove, handleSeekEnd]);

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className={styles.wrapper}>
            <span className={styles.time}>{formatTime(currentTime)}</span>
            <div
                className={styles.container}
                onMouseDown={handleSeekStart}
                onTouchStart={handleSeekStart}
                ref={progressBarRef}
            >
                <div className={styles.track}>
                    <div
                        className={styles.bar}
                        style={{
                            width: `${progressPercent}%`,
                            transition: isDragging ? 'none' : 'width 0.1s linear'
                        }}
                    />
                </div>
            </div>
            <span className={styles.time}>{formatTime(duration)}</span>
        </div>
    );
}