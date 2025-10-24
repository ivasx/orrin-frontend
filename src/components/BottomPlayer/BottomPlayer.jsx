import { useAudioPlayer } from '../../context/AudioPlayerContext.jsx';
import { useEffect, useState, forwardRef, useRef, useCallback, useMemo } from 'react';
import './BottomPlayer.css';

import TrackInfo from './TrackInfo';
import PlayerControls from './PlayerControls';
import TimeControls from './TimeControls';
import { useProgressBar } from '../../hooks/useProgressBar';
import VolumeControls from './VolumeControls';
import { MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ContextMenu from '../OptionsMenu/OptionsMenu.jsx';

const BottomPlayer = forwardRef(function BottomPlayer(props, ref) {
    const {
        currentTrack, isPlaying, pauseTrack, resumeTrack,
        nextTrack, previousTrack, audioRef,
        repeatMode, toggleRepeat, isShuffled, toggleShuffle
    } = useAudioPlayer();

    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);

    // --- Стан для меню ---
    const [isPlayerMenuOpen, setIsPlayerMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const optionsMenuBtnRef = useRef(null);

    const {
        currentTime, duration, progressPercent, progressBarRef,
        handleMouseDown, formatTime
    } = useProgressBar(audioRef, isPlaying, resumeTrack, pauseTrack);

    // ... (useEffect-и для аудіо залишаються без змін) ...
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

    // --- Логіка меню опцій ---
    const handleMenuClose = useCallback(() => {
        setIsPlayerMenuOpen(false);
    }, []);

    // 👇 ОНОВЛЕНО розрахунок позиції
    const handleOptionsMenuClick = useCallback(() => {
        if (optionsMenuBtnRef.current) {
            const rect = optionsMenuBtnRef.current.getBoundingClientRect();
            // Передаємо лівий верхній кут кнопки.
            // ContextMenu сам зсунеться вгору (завдяки openDirection="up")
            // і вліво (завдяки своїй логіці getAdjustedPosition)
            setMenuPosition({ x: rect.left, y: rect.top });
        }
        setIsPlayerMenuOpen(prev => !prev);
    }, []);

    const playerMenuItems = useMemo(() => [
        { id: 'player_add_to_queue', label: t('player_menu_add_to_queue'), action: () => console.log('TBD: Add to queue'), disabled: true },
        { id: 'player_share', label: t('player_menu_share'), action: () => console.log('TBD: Share'), disabled: true },
        { id: 'player_go_to_artist', label: t('player_menu_go_to_artist'), action: () => console.log('TBD: Go to artist'), disabled: true },
    ], [t]);
    // --- Кінець логіки меню ---

    if (!currentTrack) return null;

    const isHiddenFor404 = currentTrack.trackId === 'song-404';
    const playerClassName = `bottom-player ${isHiddenFor404 ? 'bottom-player--hidden' : ''}`;

    return (
        <>
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
                    <button
                        ref={optionsMenuBtnRef}
                        className="control-btn"
                        onClick={handleOptionsMenuClick}
                        aria-label={t('player_menu_options_aria')}
                    >
                        <MoreHorizontal size={20} />
                    </button>
                </div>
            </div>

            {/* 👇 ДОДАНО openDirection="up" */}
            <ContextMenu
                isVisible={isPlayerMenuOpen}
                position={menuPosition}
                onClose={handleMenuClose}
                menuItems={playerMenuItems}
                openDirection="up"
            />
        </>
    );
});

export default BottomPlayer;