import {useAudioCore} from '../../context/AudioCoreContext.jsx';
import {useQueue} from '../../context/QueueContext.jsx';
import {usePlayerUI} from '../../context/PlayerUIContext.jsx';
import {useEffect, useState, forwardRef, useRef, useCallback, useMemo} from 'react';
import './BottomPlayer.css';
import { logger } from '../../utils/logger';

import TrackInfo from './TrackInfo';
import PlayerControls from './PlayerControls';
import TimeControls from './TimeControls';
import {useProgressBar} from '../../hooks/useProgressBar';
import VolumeControls from './VolumeControls';
import {MoreHorizontal} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import ContextMenu from '../OptionsMenu/OptionsMenu.jsx';
import {normalizeTrackData, isTrackPlayable} from '../../constants/fallbacks.js';

const BottomPlayer = forwardRef(function BottomPlayer(props, ref) {
    const {
        currentTrack: rawCurrentTrack, isPlaying, pauseTrack, resumeTrack,
        nextTrack, previousTrack, audioRef,
        repeatMode, toggleRepeat,
        isLoading: contextIsLoading, loadError: contextLoadError,
    } = useAudioCore();

    const {isShuffled, toggleShuffle} = useQueue();
    const {isExpanded} = usePlayerUI();
    const {t} = useTranslation();

    const currentTrack = rawCurrentTrack ? normalizeTrackData(rawCurrentTrack) : null;
    const isPlayable = currentTrack ? isTrackPlayable(currentTrack) : false;

    // Use loading state from context, but keep local state for retry logic
    const isLoading = contextIsLoading;
    const loadError = contextLoadError;
    const [retryCount, setRetryCount] = useState(0);
    const MAX_RETRY_ATTEMPTS = 3;

    const [isPlayerMenuOpen, setIsPlayerMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({x: 0, y: 0});
    const optionsMenuBtnRef = useRef(null);

    const {
        currentTime, duration, progressPercent, progressBarRef,
        handleMouseDown, formatTime
    } = useProgressBar(audioRef, isPlaying, resumeTrack, pauseTrack);

    // Reset retry count when track changes or error is cleared
    useEffect(() => {
        if (!loadError) {
            setRetryCount(0);
        }
    }, [loadError, currentTrack?.trackId]);

    // Format error message for display (using translation)
    const getErrorMessage = (error) => {
        if (!error) return null;
        
        if (typeof error === 'string') {
            return error;
        }
        
        if (error.message) {
            return error.message;
        }
        
        // Map error types to translated messages
        const errorMessages = {
            network: t('player_error_network', 'Помилка мережі'),
            decode: t('player_error_decode', 'Помилка декодування'),
            format: t('player_error_format', 'Формат не підтримується'),
            aborted: t('player_error_aborted', 'Завантаження перервано'),
            unknown: t('player_error_unknown', 'Помилка відтворення'),
        };
        
        return errorMessages[error.type] || errorMessages.unknown;
    };

    const handleRetry = useCallback(() => {
        if (!currentTrack || !isPlayable) return;

        setRetryCount(prev => prev + 1);

        const audio = audioRef.current;
        if (audio) {
            // Reload and retry playback
            audio.load();
            audio.play().catch(err => {
                logger.error("Retry play failed:", err);
            });
        }
    }, [currentTrack, isPlayable, audioRef]);

    const handlePlayPause = () => {
        if (loadError) {
            if (retryCount < MAX_RETRY_ATTEMPTS) {
                handleRetry();
            }
            return;
        }

        isPlaying ? pauseTrack() : resumeTrack();
    };

    const handleMenuClose = useCallback(() => setIsPlayerMenuOpen(false), []);

    const handleOptionsMenuClick = useCallback(() => {
        if (optionsMenuBtnRef.current) {
            const rect = optionsMenuBtnRef.current.getBoundingClientRect();
            setMenuPosition({x: rect.left, y: rect.top});
        }
        setIsPlayerMenuOpen(prev => !prev);
    }, []);

    const playerMenuItems = useMemo(() => [
        {
            id: 'player_add_to_queue',
            label: t('player_menu_add_to_queue'),
            action: () => {
                // TODO: Implement add to queue functionality
            },
            disabled: true
        },
        {id: 'player_share', label: t('player_menu_share'), action: () => {
            // TODO: Implement share functionality
        }, disabled: true},
        {
            id: 'player_go_to_artist',
            label: t('player_menu_go_to_artist'),
            action: () => {
                // TODO: Implement go to artist functionality
            },
            disabled: true
        },
    ], [t]);


    if (!currentTrack) return null;

    const isHiddenFor404 = currentTrack.trackId === 'song-404';
    const playerClassName = `bottom-player ${isHiddenFor404 ? 'bottom-player--hidden' : ''}`;

    return (
        <>
            <div className={playerClassName} ref={ref}>
                <div className="top-progress-bar" style={{width: `${progressPercent}%`}}></div>

                <TrackInfo track={currentTrack}/>

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
                    <VolumeControls/>
                    <button
                        ref={optionsMenuBtnRef}
                        className="control-btn"
                        onClick={handleOptionsMenuClick}
                        aria-label={t('player_menu_options_aria')}
                    >
                        <MoreHorizontal size={20}/>
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