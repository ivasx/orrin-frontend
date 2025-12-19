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
    } = useAudioCore();

    const {isShuffled, toggleShuffle} = useQueue();
    const {isExpanded} = usePlayerUI();
    const {t} = useTranslation();

    const currentTrack = rawCurrentTrack ? normalizeTrackData(rawCurrentTrack) : null;
    const isPlayable = currentTrack ? isTrackPlayable(currentTrack) : false;

    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const MAX_RETRY_ATTEMPTS = 3;

    const [isPlayerMenuOpen, setIsPlayerMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({x: 0, y: 0});
    const optionsMenuBtnRef = useRef(null);

    const {
        currentTime, duration, progressPercent, progressBarRef,
        handleMouseDown, formatTime
    } = useProgressBar(audioRef, isPlaying, resumeTrack, pauseTrack);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleLoadStart = () => {
            setIsLoading(true);
            setLoadError(null);
        };

        const handleCanPlay = () => {
            setIsLoading(false);
            setLoadError(null);
            setRetryCount(0);
        };

        const handleError = (e) => {
            logger.error("Audio Error:", e, audio.error);
            setIsLoading(false);

            let errorMessage = t('player_error_unknown', 'Помилка відтворення');
            let errorType = 'unknown';

            if (audio.error) {
                switch (audio.error.code) {
                    case MediaError.MEDIA_ERR_NETWORK:
                        errorMessage = t('player_error_network', 'Помилка мережі');
                        errorType = 'network';
                        break;
                    case MediaError.MEDIA_ERR_DECODE:
                        errorMessage = t('player_error_decode', 'Помилка декодування');
                        errorType = 'decode';
                        break;
                    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                        errorMessage = t('player_error_format', 'Формат не підтримується');
                        errorType = 'format';
                        break;
                    case MediaError.MEDIA_ERR_ABORTED:
                        errorMessage = t('player_error_aborted', 'Завантаження перервано');
                        errorType = 'aborted';
                        break;
                }
            }

            setLoadError({message: errorMessage, type: errorType});
        };

        const handleStalled = () => setIsLoading(true);
        const handleWaiting = () => setIsLoading(true);

        audio.addEventListener('loadstart', handleLoadStart);
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('canplaythrough', handleCanPlay);
        audio.addEventListener('error', handleError);
        audio.addEventListener('stalled', handleStalled);
        audio.addEventListener('waiting', handleWaiting);

        return () => {
            audio.removeEventListener('loadstart', handleLoadStart);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('canplaythrough', handleCanPlay);
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('stalled', handleStalled);
            audio.removeEventListener('waiting', handleWaiting);
        };
    }, [audioRef, t]);

    const handleRetry = useCallback(() => {
        if (!currentTrack || !isPlayable) return;

        setLoadError(null);
        setIsLoading(true);
        setRetryCount(prev => prev + 1);

        const audio = audioRef.current;
        if (audio) {
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