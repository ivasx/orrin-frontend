import React, { useEffect, useState, forwardRef, useRef, useCallback, useMemo, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { MoreHorizontal } from 'lucide-react';
import { useAudioCore } from '../../../context/AudioCoreContext.jsx';
import { useQueue } from '../../../context/QueueContext.jsx';
import { logger } from '../../../utils/logger.js';
import { isTrackPlayable } from '../../../constants/fallbacks.js';

import TrackInfo from './components/TrackInfo/TrackInfo.jsx';
import PlayerControls from './components/PlayerControls/PlayerControls.jsx';
import TimeControls from './components/TimeControls/TimeControls.jsx';
import VolumeControls from './components/VolumeControls/VolumeControls.jsx';
import ContextMenu from '../../UI/OptionsMenu/OptionsMenu.jsx';

import styles from './BottomPlayer.module.css';


const TopProgressBar = memo(({ audioRef }) => {
    const barRef = useRef(null);
    const animationRef = useRef(null);

    const syncProgress = useCallback(() => {
        if (audioRef.current && barRef.current) {
            const { currentTime, duration } = audioRef.current;
            if (duration > 0) {
                const percent = (currentTime / duration) * 100;
                barRef.current.style.width = `${percent}%`;
            }
        }
        animationRef.current = requestAnimationFrame(syncProgress);
    }, [audioRef]);

    useEffect(() => {
        animationRef.current = requestAnimationFrame(syncProgress);
        return () => cancelAnimationFrame(animationRef.current);
    }, [syncProgress]);

    return <div className={styles.topProgressBar} ref={barRef} />;
});
TopProgressBar.displayName = 'TopProgressBar';

const BottomPlayer = forwardRef(function BottomPlayer(props, ref) {
    const {
        currentTrack, isPlaying, pauseTrack, resumeTrack,
        nextTrack, previousTrack, audioRef, repeatMode, toggleRepeat,
        isLoading: contextIsLoading, loadError: contextLoadError,
    } = useAudioCore();

    const { isShuffled, toggleShuffle } = useQueue();
    const { t } = useTranslation();

    const isPlayable = currentTrack ? isTrackPlayable(currentTrack) : false;
    const [retryCount, setRetryCount] = useState(0);
    const MAX_RETRY_ATTEMPTS = 3;

    const [isPlayerMenuOpen, setIsPlayerMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const optionsMenuBtnRef = useRef(null);

    useEffect(() => {
        if (!contextLoadError) setRetryCount(0);
    }, [contextLoadError, currentTrack?.trackId]);

    const handleRetry = useCallback(() => {
        if (!currentTrack || !isPlayable) return;
        setRetryCount(prev => prev + 1);
        const audio = audioRef.current;
        if (audio) {
            audio.load();
            audio.play().catch(err => logger.error("[BottomPlayer] Retry play failed:", err));
        }
    }, [currentTrack, isPlayable, audioRef]);

    const handlePlayPause = useCallback(() => {
        if (contextLoadError) {
            if (retryCount < MAX_RETRY_ATTEMPTS) handleRetry();
            return;
        }
        isPlaying ? pauseTrack() : resumeTrack();
    }, [contextLoadError, retryCount, handleRetry, isPlaying, pauseTrack, resumeTrack]);

    const handleMenuClose = useCallback(() => setIsPlayerMenuOpen(false), []);

    const handleOptionsMenuClick = useCallback(() => {
        if (optionsMenuBtnRef.current) {
            const rect = optionsMenuBtnRef.current.getBoundingClientRect();
            setMenuPosition({ x: rect.left, y: rect.top });
        }
        setIsPlayerMenuOpen(prev => !prev);
    }, []);

    const playerMenuItems = useMemo(() => [
        { id: 'add_queue', label: t('player_menu_add_to_queue'), disabled: true },
        { id: 'share', label: t('player_menu_share'), disabled: true },
        { id: 'artist', label: t('player_menu_go_to_artist'), disabled: true },
    ], [t]);

    if (!currentTrack) return null;

    const isHiddenFor404 = currentTrack.trackId === 'song-404';

    return (
        <>
            <div className={`${styles.bottomPlayer} ${isHiddenFor404 ? styles.hidden : ''}`} ref={ref}>
                <TopProgressBar audioRef={audioRef} />

                <TrackInfo track={currentTrack} />

                <div className={styles.playerCenter}>
                    <PlayerControls
                        isPlaying={isPlaying}
                        isLoading={contextIsLoading}
                        isShuffled={isShuffled}
                        repeatMode={repeatMode}
                        onPlayPause={handlePlayPause}
                        onNext={nextTrack}
                        onPrevious={previousTrack}
                        onToggleShuffle={toggleShuffle}
                        onToggleRepeat={toggleRepeat}
                    />
                    <TimeControls />
                </div>

                <div className={styles.playerRight}>
                    <VolumeControls />
                    <button
                        ref={optionsMenuBtnRef}
                        className={styles.optionBtn}
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

export default memo(BottomPlayer);