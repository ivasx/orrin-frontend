export default function TimeControls({
                                         progressBarRef,
                                         progressPercent,
                                         currentTime,
                                         duration,
                                         onMouseDown,
                                         formatTime
                                     }) {
    return (
        <div className="progress-wrapper">
            <div className="time-display">{formatTime(currentTime)}</div>
            <div
                className="progress-container"
                onMouseDown={onMouseDown}
                onTouchStart={onMouseDown} // для мобільних
                ref={progressBarRef}
            >
                <div className="progress-track">
                    <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
                </div>
            </div>
            <div className="time-display">{formatTime(duration)}</div>
        </div>
    );
}