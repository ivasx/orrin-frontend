import { useAudioPlayer } from "./AudioPlayerContext.jsx";
import { useEffect, useRef, useState } from "react";
import './BottomPlayer.css';

export default function BottomPlayer() {
    const { currentTrack, isTrackPlaying, pauseTrack, resumeTrack } = useAudioPlayer();
    const audioRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [lastTrackId, setLastTrackId] = useState(null); // Додаємо відстеження останнього треку

    const trackIsPlaying = currentTrack ? isTrackPlaying(currentTrack.trackId) : false;

    useEffect(() => {
        if (!audioRef.current || !currentTrack) return;

        const audio = audioRef.current;
        const isNewTrack = currentTrack.trackId !== lastTrackId;

        // Якщо це новий трек, завантажуємо його і скидаємо час
        if (isNewTrack && audio.src !== currentTrack.audio) {
            setIsLoading(true);
            audio.src = currentTrack.audio;
            setCurrentTime(0); // Скидаємо час тільки для нового треку
            setLastTrackId(currentTrack.trackId); // Оновлюємо останній трек
        }

        const handleLoadedData = () => {
            setDuration(audio.duration);
            setIsLoading(false);
        };

        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);

        const handleEnded = () => {
            pauseTrack();
            // НЕ скидаємо currentTime тут, щоб користувач міг бачити, що трек закінчився
        };

        const handleError = () => {
            console.error('Audio playback failed');
            setIsLoading(false);
            pauseTrack();
        };

        audio.addEventListener("loadeddata", handleLoadedData);
        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("ended", handleEnded);
        audio.addEventListener("error", handleError);

        // Запуск або зупинка відтворення
        if (trackIsPlaying && !isLoading) {
            audio.play().catch(handleError);
        } else {
            audio.pause();
        }

        return () => {
            audio.removeEventListener("loadeddata", handleLoadedData);
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("ended", handleEnded);
            audio.removeEventListener("error", handleError);
        };
    }, [currentTrack, trackIsPlaying, pauseTrack, lastTrackId, isLoading]);

    if (!currentTrack) return null;

    const formatTime = (seconds) => {
        if (isNaN(seconds) || seconds === 0) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handlePlayPause = () => {
        if (trackIsPlaying) {
            pauseTrack();
        } else {
            resumeTrack();
        }
    };

    const handleProgressClick = (e) => {
        if (!audioRef.current || !duration) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const newTime = (clickX / width) * duration;

        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    return (
        <div className="bottom-player">
            <div className="player-left">
                <img src={currentTrack.cover} alt={currentTrack.title} className="player-cover" />
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

                <div className="progress-container" onClick={handleProgressClick}>
                    <div className="progress-track">
                        <div
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

            <audio ref={audioRef} preload="metadata" />
        </div>
    );
}