import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useAudioCore } from '../../../../../../context/AudioCoreContext';
import styles from './TimeControls.module.css';

const formatTime = (timeInSeconds) => {
    if (!timeInSeconds || isNaN(timeInSeconds) || !isFinite(timeInSeconds)) return '0:00';
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const TimeControls = () => {
    const { audioRef } = useAudioCore();
    const [duration, setDuration] = useState(0);

    const timeTextRef = useRef(null);
    const progressFillRef = useRef(null);
    const progressBarRef = useRef(null);

    const isDraggingRef = useRef(false);
    const animationRef = useRef(null);
    const durationRef = useRef(0);

    const syncProgress = useCallback(() => {
        if (!audioRef.current) return;

        if (!isDraggingRef.current) {
            const currentAudioTime = audioRef.current.currentTime || 0;
            const currentDuration = audioRef.current.duration || 0;

            if (timeTextRef.current) {
                timeTextRef.current.textContent = formatTime(currentAudioTime);
            }

            if (progressFillRef.current && currentDuration > 0) {
                const percent = (currentAudioTime / currentDuration) * 100;
                progressFillRef.current.style.width = `${percent}%`;
            }
        }

        // Always schedule the next frame to keep the animation loop alive
        animationRef.current = requestAnimationFrame(syncProgress);
    }, [audioRef]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handlePlay = () => {
            if (!animationRef.current) {
                animationRef.current = requestAnimationFrame(syncProgress);
            }
        };

        const handlePause = () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
            syncProgress(); // One last sync to ensure precision
        };

        const handleDurationChange = () => {
            const newDuration = audio.duration || 0;
            setDuration(newDuration);
            durationRef.current = newDuration;
        };

        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('durationchange', handleDurationChange);

        handleDurationChange();
        if (!audio.paused) handlePlay();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('durationchange', handleDurationChange);
        };
    }, [audioRef, syncProgress]);

    const calculateTimeFromEvent = useCallback((e) => {
        if (!progressBarRef.current || !durationRef.current) return null;
        const rect = progressBarRef.current.getBoundingClientRect();

        let clientX;
        if (e.type.includes('touch')) {
            const touch = e.touches[0] || e.changedTouches[0];
            clientX = touch?.clientX;
        } else {
            clientX = e.clientX;
        }

        if (clientX === undefined) return null;

        const offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
        return (offsetX / rect.width) * durationRef.current;
    }, []);

    const updateVisuals = useCallback((newTime) => {
        if (timeTextRef.current) {
            timeTextRef.current.textContent = formatTime(newTime);
        }
        if (progressFillRef.current && durationRef.current > 0) {
            progressFillRef.current.style.width = `${(newTime / durationRef.current) * 100}%`;
            progressFillRef.current.style.transition = 'none'; // Disable transition while dragging
        }
    }, []);

    const handleSeekStart = useCallback((e) => {
        isDraggingRef.current = true;
        const newTime = calculateTimeFromEvent(e);
        if (newTime !== null) updateVisuals(newTime);
    }, [calculateTimeFromEvent, updateVisuals]);

    const handleSeekMove = useCallback((e) => {
        if (!isDraggingRef.current) return;
        const newTime = calculateTimeFromEvent(e);
        if (newTime !== null) updateVisuals(newTime);
    }, [calculateTimeFromEvent, updateVisuals]);

    const handleSeekEnd = useCallback((e) => {
        if (!isDraggingRef.current) return;

        const newTime = calculateTimeFromEvent(e);
        if (newTime !== null && audioRef.current && isFinite(newTime)) {
            audioRef.current.currentTime = newTime;
        }

        if (progressFillRef.current) {
            progressFillRef.current.style.transition = 'width 0.1s linear';
        }

        isDraggingRef.current = false;
    }, [calculateTimeFromEvent, audioRef]);

    useEffect(() => {
        const handleMove = (e) => handleSeekMove(e);
        const handleEnd = (e) => handleSeekEnd(e);

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd);
        document.addEventListener('touchmove', handleMove, { passive: false });
        document.addEventListener('touchend', handleEnd);

        return () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleEnd);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('touchend', handleEnd);
        };
    }, [handleSeekMove, handleSeekEnd]);

    return (
        <div className={styles.wrapper}>
            <span className={styles.time} ref={timeTextRef}>0:00</span>
            <div
                className={styles.container}
                onMouseDown={handleSeekStart}
                onTouchStart={handleSeekStart}
                ref={progressBarRef}
            >
                <div className={styles.track}>
                    <div className={styles.bar} ref={progressFillRef} />
                </div>
            </div>
            <span className={styles.time}>{formatTime(duration)}</span>
        </div>
    );
};

export default memo(TimeControls);