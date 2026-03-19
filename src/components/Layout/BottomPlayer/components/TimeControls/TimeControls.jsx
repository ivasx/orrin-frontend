import React, { memo } from 'react';
import { useAudioCore } from '../../../../../context/AudioCoreContext';
import { useProgressBar } from '../../../../../hooks/useProgressBar';
import styles from './TimeControls.module.css';

const TimeControls = () => {
    const {
        audioRef,
        isPlaying,
        pauseTrack,
        resumeTrack,
    } = useAudioCore();

    const {
        currentTime,
        duration,
        progressPercent,
        progressBarRef,
        handleMouseDown,
        formatTime,
    } = useProgressBar(audioRef, isPlaying, resumeTrack, pauseTrack);

    return (
        <div className={styles.wrapper}>
            <span className={styles.time}>{formatTime(currentTime)}</span>
            <div
                className={styles.container}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
                ref={progressBarRef}
            >
                <div className={styles.track}>
                    <div
                        className={styles.bar}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>
            <span className={styles.time}>{formatTime(duration)}</span>
        </div>
    );
};

export default memo(TimeControls);