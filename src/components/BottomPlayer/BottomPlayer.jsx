// BottomPlayer.jsx

import { useAudioPlayer } from '../../context/AudioPlayerContext.jsx';
import { useEffect, useState, forwardRef } from 'react';
import './BottomPlayer.css';

import TrackInfo from './TrackInfo';
import PlayerControls from './PlayerControls';
import TimeControls from './TimeControls';
import { useProgressBar } from '../../hooks/useProgressBar';

const BottomPlayer = forwardRef(function BottomPlayer(props, ref) {
    const {
        currentTrack, isPlaying, pauseTrack, resumeTrack,
        nextTrack, previousTrack, audioRef,
        repeatMode, toggleRepeat, isShuffled, toggleShuffle
    } = useAudioPlayer();

    // Стан завантаження залишається, він корисний для UI
    const [isLoading, setIsLoading] = useState(false);

    const {
        currentTime, duration, progressPercent, progressBarRef,
        handleMouseDown, formatTime
    } = useProgressBar(audioRef, isPlaying, resumeTrack, pauseTrack);

    // ▼▼▼ ОСНОВНІ ЗМІНИ ТУТ ▼▼▼
    // Об'єднуємо всю логіку, пов'язану з аудіо-елементом, в один useEffect

    // 1. Керування джерелом аудіо (src)
    useEffect(() => {
        const audio = audioRef.current;
        if (audio && currentTrack) {
            // Якщо джерело не збігається, оновлюємо його
            if (audio.src !== currentTrack.audio) {
                setIsLoading(true);
                audio.src = currentTrack.audio;
                audio.load(); // Рекомендується для кращої сумісності
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
                    // Якщо автоплей не спрацював, ставимо на паузу в UI
                    pauseTrack();
                }).then(() => {
                    setIsLoading(false); // Вимикаємо завантаження після успішного старту
                });
            }
        };

        // Коли аудіо готове до відтворення
        const handleCanPlay = () => {
            setIsLoading(false);
            if (isPlaying) {
                playPromise();
            }
        };

        // Якщо виникла помилка
        const handleError = () => {
            console.error("Помилка завантаження аудіо.");
            setIsLoading(false);
        };

        // Починаємо слухати події
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('error', handleError);
        audio.addEventListener('stalled', handleError); // Обробка "зависання" завантаження

        // Керуємо відтворенням/паузою на основі стану isPlaying
        if (isPlaying) {
            // Якщо трек вже завантажений, просто граємо.
            // readyState > 2 означає, що є достатньо даних для відтворення.
            if (audio.readyState > 2) {
                playPromise();
            } else {
                // Якщо ще не завантажено, показуємо спіннер.
                // handleCanPlay подбає про відтворення, коли буде готове.
                setIsLoading(true);
            }
        } else {
            audio.pause();
        }

        // Очищення слухачів
        return () => {
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('stalled', handleError);
        };
    }, [isPlaying, currentTrack, audioRef, pauseTrack]); // Додаємо pauseTrack в залежності

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
            <div className="player-right"></div>
        </div>
    );
});

export default BottomPlayer;