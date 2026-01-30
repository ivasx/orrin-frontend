import styles from './TimeControls.module.css';

export default function TimeControls({
                                         progressBarRef,
                                         progressPercent,
                                         currentTime,
                                         duration,
                                         onMouseDown,
                                         formatTime
                                     }) {
    return (
        <div className={styles.wrapper}>
            <span className={styles.time}>{formatTime(currentTime)}</span>
            <div
                className={styles.container}
                onMouseDown={onMouseDown}
                onTouchStart={onMouseDown}
                ref={progressBarRef}
            >
                <div className={styles.track}>
                    <div className={styles.bar} style={{width: `${progressPercent}%`}}/>
                </div>
            </div>
            <span className={styles.time}>{formatTime(duration)}</span>
        </div>
    );
}