import { useAudioCore } from '../../context/AudioCoreContext.jsx';
import { useQueue } from '../../context/QueueContext.jsx'; // <-- Додано
import { usePlayerUI } from '../../context/PlayerUIContext.jsx'; // <-- Додано
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
    // Отримуємо дані з усіх трьох контекстів
    const {
        currentTrack, isPlaying, pauseTrack, resumeTrack,
        nextTrack, previousTrack, audioRef,
        repeatMode, toggleRepeat,
        // isShuffled та toggleShuffle тепер беруться з useQueue
    } = useAudioCore();

    const { isShuffled, toggleShuffle } = useQueue(); // <-- Отримуємо стан та функцію shuffle
    const { isExpanded } = usePlayerUI(); // <-- Отримуємо стан UI (приклад)

    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false); // Залишаємо локальний стан завантаження

    // --- Стан для меню (без змін) ---
    const [isPlayerMenuOpen, setIsPlayerMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const optionsMenuBtnRef = useRef(null);

    // --- Хук прогрес-бару (без змін) ---
    const {
        currentTime, duration, progressPercent, progressBarRef,
        handleMouseDown, formatTime
    } = useProgressBar(audioRef, isPlaying, resumeTrack, pauseTrack);

    // --- Ефекти для аудіо (майже без змін, але можемо прибрати дублювання isLoading) ---
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleLoadStart = () => setIsLoading(true);
        const handleCanPlay = () => setIsLoading(false);
        const handleError = (e) => {
            console.error("Audio Error:", e);
            setIsLoading(false);
        };
        const handleStalled = () => setIsLoading(true); // Показуємо завантаження при буферизації

        audio.addEventListener('loadstart', handleLoadStart);
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('canplaythrough', handleCanPlay); // Додатково
        audio.addEventListener('error', handleError);
        audio.addEventListener('stalled', handleStalled);
        audio.addEventListener('waiting', handleLoadStart); // Показуємо завантаження при очікуванні даних

        // Прибираємо слухачі при розмонтуванні
        return () => {
            audio.removeEventListener('loadstart', handleLoadStart);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('canplaythrough', handleCanPlay);
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('stalled', handleStalled);
            audio.removeEventListener('waiting', handleLoadStart);
        };
    }, [audioRef]); // Залежність тільки від audioRef


    const handlePlayPause = () => isPlaying ? pauseTrack() : resumeTrack();

    // --- Логіка меню опцій (без змін) ---
    const handleMenuClose = useCallback(() => setIsPlayerMenuOpen(false), []);
    const handleOptionsMenuClick = useCallback(() => {
        if (optionsMenuBtnRef.current) {
            const rect = optionsMenuBtnRef.current.getBoundingClientRect();
            setMenuPosition({ x: rect.left, y: rect.top });
        }
        setIsPlayerMenuOpen(prev => !prev);
    }, []);

    const playerMenuItems = useMemo(() => [
        { id: 'player_add_to_queue', label: t('player_menu_add_to_queue'), action: () => console.log('TBD: Add to queue'), disabled: true },
        { id: 'player_share', label: t('player_menu_share'), action: () => console.log('TBD: Share'), disabled: true },
        { id: 'player_go_to_artist', label: t('player_menu_go_to_artist'), action: () => console.log('TBD: Go to artist'), disabled: true },
    ], [t]);


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
                        isLoading={isLoading} // Використовуємо локальний isLoading
                        isShuffled={isShuffled} // З QueueContext
                        repeatMode={repeatMode} // З AudioCoreContext
                        onPlayPause={handlePlayPause}
                        onNext={nextTrack} // З AudioCoreContext
                        onPrevious={previousTrack} // З AudioCoreContext
                        onToggleShuffle={toggleShuffle} // З QueueContext
                        onToggleRepeat={toggleRepeat} // З AudioCoreContext
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
                    <VolumeControls /> {/* VolumeControls використовує useAudioCore всередині себе */}
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