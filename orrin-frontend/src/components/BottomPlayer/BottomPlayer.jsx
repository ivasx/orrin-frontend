import { useAudioPlayer } from '../../context/AudioPlayerContext.jsx';
import { useEffect, useRef, useState, forwardRef } from 'react';
import { SkipBack, SkipForward } from 'lucide-react';
import './BottomPlayer.css';

const BottomPlayer = forwardRef(function BottomPlayer(props, ref) {
    const {
        currentTrack,
        isPlaying,
        playTrack,
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
    const titleRef = useRef(null);
    const artistRef = useRef(null);
    const animationFrameRef = useRef(null);


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
            if (currentTrack?.loop) {
                audio.currentTime = 0;
                audio.play();
            } else {
                nextTrack();
            }
        };
        const handleError = () => setIsLoading(false);

        audio.addEventListener('loadeddata', handleLoadedData);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('loadeddata', handleLoadedData);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
        };
    }, [audioRef, currentTrack, nextTrack]);

    useEffect(() => {
        const audio = audioRef.current;

        const animate = () => {
            if (audio && !isDragging) {
                setCurrentTime(audio.currentTime);
            }
            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrameRef.current);
        };
    }, [isDragging, audioRef]);

    useEffect(() => {
    }, [currentTrack]);



    const handlePlayPause = () => {
        if (isPlaying) {
            pauseTrack();
        } else {
            resumeTrack();
        }
    };

    const handleProgressChange = (e) => {
        if (!audioRef.current || !duration) return;
        const newTime = (e.nativeEvent.offsetX / e.currentTarget.offsetWidth) * duration;
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const formatTime = (seconds) => {
        if (isNaN(seconds) || seconds < 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!currentTrack) return null;

    const isHiddenFor404 = currentTrack.trackId === 'song-404';
    const playerClassName = `bottom-player ${isHiddenFor404 ? 'bottom-player--hidden' : ''}`;

    return (
        <div className={playerClassName} ref={ref}>
            <div className="player-left">
                <img src={currentTrack.cover} alt={currentTrack.title} className="player-cover"/>
                <div className="player-info">
                    <div className="player-title" ref={titleRef}>
                        <span>{currentTrack.title}</span>
                    </div>
                    <div className="player-artist" ref={artistRef}>
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
                    <div className="time-display">{formatTime(currentTime)}</div>
                    <div className="progress-container" onClick={handleProgressChange}>
                        <div className="progress-track">
                            <div className="progress-bar" style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}/>
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