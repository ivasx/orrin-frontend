import {useAudioPlayer} from '../../context/AudioPlayerContext.jsx';
import {useEffect, useRef, useState, useCallback, forwardRef} from 'react';
import './BottomPlayer.css';

const BottomPlayer = forwardRef(function BottomPlayer(props, ref) {
    const {currentTrack, isTrackPlaying, pauseTrack, resumeTrack, audioRef} = useAudioPlayer();
    const progressContainerRef = useRef(null);
    const progressBarRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [lastTrackId, setLastTrackId] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const animationFrameRef = useRef(null);
    const trackIsPlaying = currentTrack ? isTrackPlaying(currentTrack.trackId) : false;

    // Оновлення прогрес бару без ре-рендеру
    const updateProgressBar = useCallback((time) => {
        if (progressBarRef.current && duration) {
            const percentage = (time / duration) * 100;
            progressBarRef.current.style.width = `${percentage}%`;
        }
    }, [duration]);

    // Обробники перетягування
    const handleProgressMouseMove = useCallback((e) => {
        if (!isDragging || !duration || !progressContainerRef.current) return;

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        animationFrameRef.current = requestAnimationFrame(() => {
            const rect = progressContainerRef.current.getBoundingClientRect();
            const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
            const width = rect.width;
            const newTime = (clickX / width) * duration;

            updateProgressBar(newTime);
            setCurrentTime(newTime);
        });
    }, [isDragging, duration, updateProgressBar]);

    const handleProgressMouseUp = useCallback(() => {
        if (!isDragging || !audioRef.current) return;

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        audioRef.current.currentTime = currentTime;
        setIsDragging(false);
    }, [isDragging, currentTime]);

    // Глобальні слухачі для перетягування
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleProgressMouseMove);
            document.addEventListener('mouseup', handleProgressMouseUp);

            return () => {
                document.removeEventListener('mousemove', handleProgressMouseMove);
                document.removeEventListener('mouseup', handleProgressMouseUp);
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
            };
        }
    }, [isDragging, handleProgressMouseMove, handleProgressMouseUp]);

    // Основна логіка аудіо
    useEffect(() => {
        if (!audioRef.current || !currentTrack) return;

        const audio = audioRef.current;
        const isNewTrack = currentTrack.trackId !== lastTrackId;

        if (isNewTrack) {
            setIsLoading(true);
            audio.src = currentTrack.audio;
            setCurrentTime(0);
            setLastTrackId(currentTrack.trackId);
            audio.load();
        }

        const handleLoadedData = () => {
            setDuration(audio.duration);
            setIsLoading(false);
            if (trackIsPlaying) {
                audio.play().catch(err => {
                    console.error('Audio playback failed:', err);
                    pauseTrack();
                });
            }
        };

        const handleTimeUpdate = () => {
            if (!isDragging) {
                const time = audio.currentTime;
                setCurrentTime(time);
                updateProgressBar(time);
            }
        };

        const handleEnded = () => {
            pauseTrack();
        };

        const handleError = (e) => {
            console.error('Audio playback failed:', e);
            setIsLoading(false);
            pauseTrack();
        };

        audio.addEventListener('loadeddata', handleLoadedData);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);

        if (!isNewTrack && !isLoading) {
            if (trackIsPlaying) {
                audio.play().catch(handleError);
            } else {
                audio.pause();
            }
        }

        return () => {
            audio.removeEventListener('loadeddata', handleLoadedData);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
        };
    }, [currentTrack, trackIsPlaying, pauseTrack, lastTrackId, isLoading, isDragging, updateProgressBar]);

    if (!currentTrack) return null;

    const formatTime = (seconds) => {
        if (isNaN(seconds) || seconds === 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handlePlayPause = () => {
        if (trackIsPlaying) {
            pauseTrack();
        } else {
            resumeTrack();
        }
    };

    const handleProgressClick = (e) => {
        if (isDragging || !audioRef.current || !duration) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const newTime = (clickX / width) * duration;

        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
        updateProgressBar(newTime);
    };

    const handleProgressMouseDown = (e) => {
        if (!duration) return;
        e.preventDefault();

        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const width = rect.width;
        const newTime = (clickX / width) * duration;

        setCurrentTime(newTime);
        updateProgressBar(newTime);
        setIsDragging(true);
    };

    return (
        <div className="bottom-player" ref={ref}>
            <div className="player-left">
                <img src={currentTrack.cover} alt={currentTrack.title} className="player-cover"/>
                <div className="player-info">
                    <div className="player-title">{currentTrack.title}</div>
                    <div className="player-artist">{currentTrack.artist}</div>
                </div>
            </div>

            <div className="player-center">
                <div className="player-controls">
                    <button
                        className="play-pause-btn"
                        onClick={handlePlayPause}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="loading-spinner"></div>
                        ) : trackIsPlaying ? (
                            <div className="pause-icon">
                                <span></span>
                                <span></span>
                            </div>
                        ) : (
                            <div className="play-triangle"></div>
                        )}
                    </button>
                </div>

                <div
                    ref={progressContainerRef}
                    className="progress-container"
                    onClick={handleProgressClick}
                    onMouseDown={handleProgressMouseDown}
                >
                    <div className="progress-track">
                        <div
                            ref={progressBarRef}
                            className="progress-bar"
                            style={{
                                width: duration ? `${(currentTime / duration) * 100}%` : '0%'
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="player-right">
                <div className="time-display">
                    {formatTime(currentTime)} / {formatTime(duration)}
                </div>
            </div>
        </div>
    );
});
export default BottomPlayer;