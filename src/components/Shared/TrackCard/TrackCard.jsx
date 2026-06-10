import {useState, useEffect, useCallback, useRef, useMemo, memo} from 'react';
import {Link} from 'react-router-dom';
import {MoreHorizontal, Music} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {useAudioCore} from '../../../context/AudioCoreContext.jsx';
import {useQueue} from '../../../context/QueueContext.jsx';
import {isTrackPlayable} from '../../../constants/fallbacks.js';
import {logger} from '../../../utils/logger.js';
import {createTrackMenuItems} from './trackMenuItems.jsx';
import ContextMenu from '../../UI/OptionsMenu/OptionsMenu.jsx';
import AuthPromptModal from '../AuthPromptModal/AuthPromptModal.jsx';
import ShareToChatModal from '../ShareToChatModal/ShareToChatModal.jsx';
import styles from './TrackCard.module.css';

function TrackCard(props) {
    const {t} = useTranslation();
    const {
        currentTrack,
        playTrack,
        pauseTrack,
        resumeTrack,
        isTrackPlaying,
        audioRef,
        isMuted,
        toggleMute,
        volume,
        updateVolume,
    } = useAudioCore();

    const {insertNext, removeFromQueue} = useQueue();

    const track = useMemo(() => {
        if (!props.trackId) {
            logger.error('TrackCard: received props without trackId', props);
            return null;
        }
        return props;
    }, [props]);

    const [coverError, setCoverError] = useState(false);
    const [audioError, setAudioError] = useState(false);
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({x: 0, y: 0});
    const [rippleStyle, setRippleStyle] = useState({});
    const [showRipple, setShowRipple] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const dotsButtonRef = useRef(null);

    if (!track) return null;

    const hasValidAudio = isTrackPlayable(track);
    const displayCover = coverError ? '/orrin-logo.svg' : track.cover;

    useEffect(() => {
        const mq = window.matchMedia('(pointer: coarse)');
        const onChange = (e) => setIsTouchDevice(e.matches);
        setIsTouchDevice(mq.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || currentTrack?.trackId !== track.trackId) return;

        const onError = () => {
            setAudioError(true);
            setIsAudioLoading(false);
        };
        const onLoadStart = () => setIsAudioLoading(true);
        const onCanPlay = () => setIsAudioLoading(false);

        audio.addEventListener('error', onError);
        audio.addEventListener('loadstart', onLoadStart);
        audio.addEventListener('canplay', onCanPlay);

        return () => {
            audio.removeEventListener('error', onError);
            audio.removeEventListener('loadstart', onLoadStart);
            audio.removeEventListener('canplay', onCanPlay);
        };
    }, [audioRef, currentTrack, track.trackId]);

    const isPlaying = isTrackPlaying(track.trackId);
    const isCurrentTrack = currentTrack?.trackId === track.trackId;
    const showLoadingIndicator = isCurrentTrack && isAudioLoading;
    const showErrorIndicator = isCurrentTrack && audioError;

    const handlePlayPause = useCallback(() => {
        if (!track.trackId || !hasValidAudio) return;
        if (isCurrentTrack && isPlaying) return pauseTrack();
        if (isCurrentTrack && !isPlaying) return resumeTrack();
        playTrack(track, props.tracks);
    }, [isCurrentTrack, isPlaying, playTrack, pauseTrack, resumeTrack, track, props.tracks, hasValidAudio]);

    const handleInsertNext = useCallback(() => {
        insertNext(track);
        setShowMenu(false);
    }, [insertNext, track]);

    const handleRemoveFromQueue = useCallback(() => {
        if (props.isQueueContext && props.indexInQueue != null) {
            removeFromQueue(track.trackId, props.indexInQueue);
        }
        setShowMenu(false);
    }, [removeFromQueue, track.trackId, props.isQueueContext, props.indexInQueue]);

    const handleRemoveFromHistory = useCallback(() => {
        props.onRemoveFromHistory?.();
        setShowMenu(false);
    }, [props.onRemoveFromHistory]);

    const handleShareToChat = useCallback(() => {
        setIsShareModalOpen(true);
        setShowMenu(false);
    }, []);

    const getMenuItems = useCallback(
        () =>
            createTrackMenuItems({
                t,
                isPlaying,
                isMuted,
                volume,
                handlePlayPause,
                isCurrentTrack,
                toggleMute,
                updateVolume,
                title: track.title,
                artist: track.artist,
                audio: track.audio,
                hasValidAudio,
                isQueueContext: props.isQueueContext ?? false,
                indexInQueue: props.indexInQueue,
                trackId: track.trackId,
                onInsertNext: handleInsertNext,
                onRemoveFromQueue: handleRemoveFromQueue,
                onRemoveFromHistory: props.onRemoveFromHistory ? handleRemoveFromHistory : undefined,
                onShareToChat: handleShareToChat,
            }),
        [
            t, isPlaying, isMuted, volume, handlePlayPause, isCurrentTrack,
            toggleMute, updateVolume, track.title, track.artist, track.audio,
            hasValidAudio, props.isQueueContext, props.indexInQueue, track.trackId,
            handleInsertNext, handleRemoveFromQueue, handleRemoveFromHistory,
            props.onRemoveFromHistory, handleShareToChat,
        ],
    );

    const createRippleEffect = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        setRippleStyle({
            width: size,
            height: size,
            left: e.clientX - rect.left - size / 2,
            top: e.clientY - rect.top - size / 2,
        });
        setShowRipple(true);
        setTimeout(() => setShowRipple(false), 600);
    };

    const handleCoverClick = (e) => {
        if (e.button !== 0 || !hasValidAudio) return;
        createRippleEffect(e);
        handlePlayPause();
    };

    const handlePlayButtonClick = (e) => {
        e.stopPropagation();
        if (!hasValidAudio) return;
        createRippleEffect(e);
        handlePlayPause();
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        setMenuPosition({x: e.clientX, y: e.clientY});
        setShowMenu(true);
    };

    const handleDotsClick = (e) => {
        e.stopPropagation();
        if (dotsButtonRef.current) {
            const rect = dotsButtonRef.current.getBoundingClientRect();
            setMenuPosition({x: rect.right, y: rect.top});
            setShowMenu((prev) => !prev);
        }
    };

    const coverWrapperClass = [
        styles.coverWrapper,
        isPlaying ? styles.playing : '',
        !hasValidAudio ? styles.notPlayable : '',
        isAudioLoading ? styles.loading : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div
            className={styles.card}
            onContextMenu={handleContextMenu}
            role="button"
            tabIndex={0}
            aria-label={t('track_card_aria_label', {title: track.title, artist: track.artist})}
        >
            <div
                className={coverWrapperClass}
                onClick={handleCoverClick}
                onMouseEnter={() => !isTouchDevice && hasValidAudio && setShowControls(true)}
                onMouseLeave={() => !isTouchDevice && setShowControls(false)}
                onTouchStart={() => isTouchDevice && hasValidAudio && setShowControls(true)}
            >
                {coverError ? (
                    <div className={styles.coverFallback}>
                        <Music size={32}/>
                    </div>
                ) : (
                    <img
                        src={displayCover}
                        alt={track.title}
                        className={styles.cover}
                        loading="lazy"
                        onError={() => setCoverError(true)}
                    />
                )}

                {showRipple && <div className={styles.rippleEffect} style={rippleStyle}/>}

                {showLoadingIndicator && (
                    <div className={styles.loadingIndicator}>
                        <div className={styles.spinnerSmall}/>
                    </div>
                )}

                {showControls && hasValidAudio && !showLoadingIndicator && !showErrorIndicator && (
                    <div className={styles.playIcon} onClick={handlePlayButtonClick}>
                        {!isPlaying
                            ? <div className={styles.triangle}/>
                            : <div className={styles.pause}><span/><span/></div>
                        }
                    </div>
                )}

                {isPlaying && !showControls && hasValidAudio && (
                    <div className={styles.bars}>
                        <span/><span/><span/>
                    </div>
                )}
            </div>

            <div className={styles.trackInfo}>
                <Link to={`/track/${track.trackId}`} className={styles.trackTitle}>
                    {track.title}
                </Link>
                <div className={styles.trackArtist}>
                    {track.artistSlug ? (
                        <Link to={`/artist/${track.artistSlug}`} className={styles.trackArtistLink}>
                            {track.artist}
                        </Link>
                    ) : (
                        <span>{track.artist}</span>
                    )}
                </div>
            </div>

            <div
                className={styles.optionsWrapper}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    ref={dotsButtonRef}
                    className={`${styles.optionsBtn} ${showMenu ? styles.optionsBtnOpen : ''}`}
                    onClick={handleDotsClick}
                    aria-label={t('post_more_options')}
                    aria-expanded={showMenu}
                    aria-haspopup="menu"
                >
                    <MoreHorizontal size={18}/>
                </button>

                <ContextMenu
                    isVisible={showMenu}
                    position={menuPosition}
                    onClose={() => setShowMenu(false)}
                    menuItems={getMenuItems()}
                />
            </div>

            <AuthPromptModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />

            <ShareToChatModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                trackId={track.trackId}
            />
        </div>
    );
}

export default memo(TrackCard);