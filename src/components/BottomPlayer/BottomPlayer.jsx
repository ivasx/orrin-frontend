import { useAudioPlayer } from '../../context/AudioPlayerContext.jsx';
import { useEffect, useState, forwardRef } from 'react';
import './BottomPlayer.css';

import TrackInfo from './TrackInfo';
import PlayerControls from './PlayerControls';
import TimeControls from './TimeControls';
import { useProgressBar } from '../../hooks/useProgressBar';
import VolumeControls from './VolumeControls'; // <-- Імпорт є

const BottomPlayer = forwardRef(function BottomPlayer(props, ref) {
    const {
        currentTrack, isPlaying, pauseTrack, resumeTrack,
        nextTrack, previousTrack, audioRef,
        repeatMode, toggleRepeat, isShuffled, toggleShuffle
    } = useAudioPlayer();

    const [isLoading, setIsLoading] = useState(false);

    const {
        currentTime, duration, progressPercent, progressBarRef,
        handleMouseDown, formatTime
    } = useProgressBar(audioRef, isPlaying, resumeTrack, pauseTrack);

    // 1. Керування джерелом аудіо (src)
    useEffect(() => {
        const audio = audioRef.current;
        if (audio && currentTrack) {
            if (audio.src !== currentTrack.audio) {
                setIsLoading(true);
                audio.src = currentTrack.audio;
                audio.load();
            }
        }
    }, [currentTrack, audioRef]);

    // 2. Керування відтворенням (play/pause) та подіями завантаження
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const playPromise = () => {
            const promise = audio.play();
            if (promise !== undefined) {
                promise.catch(error => {
                    console.error("Помилка відтворення:", error);
                    pauseTrack();
                }).then(() => {
                    setIsLoading(false);
                });
            }
        };

        const handleCanPlay = () => {
            setIsLoading(false);
            if (isPlaying) {
                playPromise();
            }
        };

        const handleError = () => {
            console.error("Помилка завантаження аудіо.");
            setIsLoading(false);
        };

        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('error', handleError);
        audio.addEventListener('stalled', handleError);

        if (isPlaying) {
            if (audio.readyState > 2) {
                playPromise();
            } else {
                setIsLoading(true);
            }
        } else {
            audio.pause();
        }

        return () => {
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('stalled', handleError);
        };
    }, [isPlaying, currentTrack, audioRef, pauseTrack]);

    const handlePlayPause = () => isPlaying ? pauseTrack() : resumeTrack();

    if (!currentTrack) return null;

    const isHiddenFor404 = currentTrack.trackId === 'song-404';
    const playerClassName = `bottom-player ${isHiddenFor404 ? 'bottom-player--hidden' : ''}`;

    return (
        <div className={playerClassName} ref={ref}>
            <div className="top-progress-bar" style={{ width: `${progressPercent}%` }}></div>
            <TrackInfo track={currentTrack} />
            <div className="player-center">
                <PlayerControls
                    isPlaying={isPlaying}
                    isLoading={isLoading}
                    isShuffled={isShuffled}
                    repeatMode={repeatMode}
                    onPlayPause={handlePlayPause}
                    onNext={nextTrack}
                    onPrevious={previousTrack}
                    onToggleShuffle={toggleShuffle}
                    onToggleRepeat={toggleRepeat}
                />
                <TimeControls
                    progressBarRef={progressBarRef}
                    progressPercent={progressPercent}
                    currentTime={currentTime}
                    duration={duration}
                    onMouseDown={handleMouseDown}
                    formatTime={formatTime}
                />
            </div>
            <div className="player-right">
                <VolumeControls />
            </div>
        </div>
    );
});

export default BottomPlayer;