import {useAudioPlayer} from '../../context/AudioPlayerContext.jsx';
import {useEffect, useRef, useState, forwardRef, useCallback} from 'react';
import {SkipBack, SkipForward} from 'lucide-react';
import './BottomPlayer.css';

const BottomPlayer = forwardRef(function BottomPlayer(props, ref) {
    const {
        currentTrack,
        isPlaying,
        pauseTrack,
        resumeTrack,
        nextTrack,
        previousTrack,
        audioRef,
    } = useAudioPlayer();

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isDragging, setIsDragging] = useState(false);

    const progressBarRef = useRef(null);
    const progressBarFillRef = useRef(null);
    const currentTimeRef = useRef(null);
    const wasPlayingRef = useRef(false);
    const dragAnimationRef = useRef(null);


    useEffect(() => {
        const audio = audioRef.current;
        if (audio && currentTrack) {
            setIsLoading(true);
            audio.src = currentTrack.audio;
            audio.load();
        }
    }, [currentTrack, audioRef]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || isLoading) return;

        if (isPlaying) {
            audio.play().catch(e => console.error("Playback error:", e));
        } else {
            audio.pause();
        }
    }, [isPlaying, isLoading, audioRef]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleLoadedData = () => {
            setDuration(audio.duration);
            setIsLoading(false);
        };

        const handleEnded = () => {
            if (isDragging) return;
            if (currentTrack?.loop) {
                audio.currentTime = 0;
                audio.play();
            } else {
                nextTrack();
            }
        };

        const handleError = () => setIsLoading(false);

        const handleTimeUpdate = () => {
            if (!isDragging) {
                setCurrentTime(audio.currentTime);
            }
        };

        audio.addEventListener('loadeddata', handleLoadedData);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);
        audio.addEventListener('timeupdate', handleTimeUpdate);

        return () => {
            audio.removeEventListener('loadeddata', handleLoadedData);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, [audioRef, currentTrack, nextTrack, isDragging]);

    const handlePlayPause = () => {
        if (isPlaying) {
            pauseTrack();
        } else {
            resumeTrack();
        }
    };

    const formatTime = (seconds) => {
        if (isNaN(seconds) || seconds < 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };


    const updateVisualSeek = (newTime) => {
        if (progressBarFillRef.current) {
            progressBarFillRef.current.style.width = `${(newTime / duration) * 100}%`;
        }
        if (currentTimeRef.current) {
            currentTimeRef.current.textContent = formatTime(newTime);
        }
    };

    const getSeekTime = (e) => {
        if (!progressBarRef.current || !duration) return 0;
        const progressBar = progressBarRef.current;
        const rect = progressBar.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, offsetX / rect.width));
        return percentage * duration;
    };

    const handleMouseDown = (e) => {
        wasPlayingRef.current = isPlaying;
        if (isPlaying) pauseTrack();
        setIsDragging(true);
        updateVisualSeek(getSeekTime(e.nativeEvent));
    };

    const handleMouseMove = useCallback((e) => {
        if (isDragging) {
            e.preventDefault();
            if (dragAnimationRef.current) cancelAnimationFrame(dragAnimationRef.current);
            dragAnimationRef.current = requestAnimationFrame(() => {
                updateVisualSeek(getSeekTime(e));
            });
        }
    }, [isDragging, duration]);

    const handleMouseUp = useCallback((e) => {
        if (isDragging) {
            if (dragAnimationRef.current) cancelAnimationFrame(dragAnimationRef.current);
            const newTime = getSeekTime(e);
            if (audioRef.current) {
                audioRef.current.currentTime = newTime;
            }
            setCurrentTime(newTime);
            setIsDragging(false);

            if (wasPlayingRef.current) {
                resumeTrack();
            }
        }
    }, [isDragging, duration, resumeTrack, audioRef]);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);


    if (!currentTrack) return null;

    const isHiddenFor404 = currentTrack.trackId === 'song-404';
    const playerClassName = `bottom-player ${isHiddenFor404 ? 'bottom-player--hidden' : ''}`;

    return (
        <div className={playerClassName} ref={ref}>
            <div className="player-left">
                <img src={currentTrack.cover} alt={currentTrack.title} className="player-cover"/>
                <div className="player-info">
                    <div className="player-title">
                        <span>{currentTrack.title}</span>
                    </div>
                    <div className="player-artist">
                        <span>{currentTrack.artist}</span>
                    </div>
                </div>
            </div>

            <div className="player-center">
                <div className="player-controls">
                    <button className="control-btn" onClick={() => previousTrack()}>
                        <SkipBack size={20}/>
                    </button>
                    <button className="play-pause-btn" onClick={handlePlayPause} disabled={isLoading}>
                        {isLoading ? (
                            <div className="loading-spinner"></div>
                        ) : isPlaying ? (
                            <div className="pause-icon"><span></span><span></span></div>
                        ) : (
                            <div className="play-triangle"></div>
                        )}
                    </button>
                    <button className="control-btn" onClick={() => nextTrack()}>
                        <SkipForward size={20}/>
                    </button>
                </div>
                <div className="progress-wrapper">
                    <div className="time-display" ref={currentTimeRef}>{formatTime(currentTime)}</div>
                    <div
                        className="progress-container"
                        onMouseDown={handleMouseDown}
                        ref={progressBarRef}
                    >
                        <div className="progress-track">
                            <div
                                className="progress-bar"
                                ref={progressBarFillRef}
                                style={{width: !isDragging && duration ? `${(currentTime / duration) * 100}%` : undefined}}
                            />
                        </div>
                    </div>
                    <div className="time-display">{formatTime(duration)}</div>
                </div>
            </div>

            <div className="player-right">
                {/* Тут можуть бути іконки гучності, черги і т.д. */}
            </div>
        </div>
    );
});

export default BottomPlayer;