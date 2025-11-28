import './TrackCard.css';
import {useState, useEffect, useCallback, useRef, useMemo} from 'react';
import ContextMenu from '../OptionsMenu/OptionsMenu.jsx';
import {useAudioCore} from '../../context/AudioCoreContext.jsx';
import {useTranslation} from "react-i18next";
import {createTrackMenuItems} from './trackMenuItems.jsx';
import {Link} from 'react-router-dom';
import {AlertCircle, Music} from 'lucide-react';
import {isTrackPlayable} from '../../constants/fallbacks.js';

export default function TrackCard(props) {
    const {t} = useTranslation();
    const {
        currentTrack, playTrack, pauseTrack, resumeTrack, isTrackPlaying, audioRef,
        isMuted, toggleMute, volume, updateVolume
    } = useAudioCore();

    const track = useMemo(() => {
        if (!props.trackId) {
            console.error('TrackCard: Received props without trackId', props);
            return null;
        }
        return props;
    }, [props]);

    if (!track) {
        return null;
    }

    const hasValidAudio = isTrackPlayable(track);

    const [coverError, setCoverError] = useState(false);
    const [audioError, setAudioError] = useState(false);
    const [isAudioLoading, setIsAudioLoading] = useState(false);

    const [showControls, setShowControls] = useState(false);
    const [durationHovered, setDurationHovered] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({x: 0, y: 0});
    const [rippleStyle, setRippleStyle] = useState({});
    const [showRipple, setShowRipple] = useState(false);

    const dotsButtonRef = useRef(null);

    const displayCover = coverError ? '/orrin-logo.svg' : track.cover;

    useEffect(() => {
        setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }, []);

    useEffect(() => {
        setCoverError(false);
        setAudioError(false);
    }, [track.trackId]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || currentTrack?.trackId !== track.trackId) return;

        const handleAudioError = (e) => {
            console.error('Audio error for track:', track.trackId, e);
            setAudioError(true);
            setIsAudioLoading(false);
        };

        const handleLoadStart = () => setIsAudioLoading(true);
        const handleCanPlay = () => setIsAudioLoading(false);
        const handleLoadedData = () => setIsAudioLoading(false);

        audio.addEventListener('error', handleAudioError);
        audio.addEventListener('loadstart', handleLoadStart);
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('loadeddata', handleLoadedData);

        return () => {
            audio.removeEventListener('error', handleAudioError);
            audio.removeEventListener('loadstart', handleLoadStart);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('loadeddata', handleLoadedData);
        };
    }, [audioRef, currentTrack, track.trackId]);

    const isPlaying = isTrackPlaying(track.trackId);
    const isCurrentTrack = currentTrack && currentTrack.trackId === track.trackId;
    const showLoadingIndicator = isCurrentTrack && isAudioLoading;
    const showErrorIndicator = isCurrentTrack && audioError;

    const handlePlayPause = useCallback(() => {
        if (!track.trackId) {
            console.error("TrackCard: trackId is missing!");
            return;
        }

        if (!hasValidAudio) {
            console.warn("TrackCard: Cannot play - no valid audio URL");
            return;
        }

        if (isCurrentTrack && isPlaying) {
            pauseTrack();
        } else if (isCurrentTrack && !isPlaying) {
            resumeTrack();
        } else {
            playTrack(track, props.tracks);
        }
    }, [isCurrentTrack, isPlaying, playTrack, pauseTrack, resumeTrack, track, props.tracks, hasValidAudio]);

    const getMenuItems = useCallback(() => createTrackMenuItems({
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
        hasValidAudio
    }), [
        t, isPlaying, isMuted, volume, handlePlayPause, isCurrentTrack,
        toggleMute, updateVolume, track.title, track.artist, track.audio, hasValidAudio
    ]);

    function createRippleEffect(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        setRippleStyle({width: size, height: size, left: x, top: y});
        setShowRipple(true);
        setTimeout(() => setShowRipple(false), 600);
    }

    function handleCoverClick(e) {
        if (e.button !== 0) return;
        if (!hasValidAudio) return;
        createRippleEffect(e);
        handlePlayPause();
    }

    function handlePlayButtonClick(e) {
        e.stopPropagation();
        if (!hasValidAudio) return;
        createRippleEffect(e);
        handlePlayPause();
    }

    const handleContextMenu = (e) => {
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        let x = e.clientX;
        let y = e.clientY;

        const menuWidth = 200;
        const menuHeight = 300;
        if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 10;
        if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - 10;

        setMenuPosition({x, y});
        setShowMenu(true);
    };

    function handleDotsClick(e) {
        e.stopPropagation();
        if (dotsButtonRef.current) {
            const rect = dotsButtonRef.current.getBoundingClientRect();
            let x = rect.right;
            let y = rect.top;

            const menuWidth = 200;
            const menuHeight = 300;

            if (x + menuWidth > window.innerWidth - 10) {
                x = rect.left - menuWidth;
            }
            if (y + menuHeight > window.innerHeight - 10) {
                y = window.innerHeight - menuHeight - 10;
            }
            if (y < 10) y = 10;
            if (x < 10) x = 10;

            setMenuPosition({x, y});
            setShowMenu(prev => !prev);
        }
    }

    const handleMenuClose = () => setShowMenu(false);
    const shouldShowControls = isTouchDevice ? true : showControls;

    const handleCoverError = () => {
        console.warn('Cover image failed to load for track:', track.trackId);
        setCoverError(true);
    };

    return (
        <div
            className="card-track"
            onContextMenu={handleContextMenu}
            role="button"
            tabIndex={0}
            aria-label={t('track_card_aria_label', {title: track.title, artist: track.artist})}
        >
            <div
                className={`track-cover-wrapper ${isPlaying ? 'playing' : ''} ${!hasValidAudio ? 'disabled' : ''}`}
                onClick={handleCoverClick}
                onMouseEnter={() => !isTouchDevice && hasValidAudio && setShowControls(true)}
                onMouseLeave={() => !isTouchDevice && setShowControls(false)}
                onTouchStart={() => isTouchDevice && hasValidAudio && setShowControls(true)}
            >
                {coverError ? (
                    <div className="track-cover-fallback">
                        <Music size={32}/>
                    </div>
                ) : (
                    <img
                        src={displayCover}
                        alt={track.title}
                        className="track-cover"
                        onError={handleCoverError}
                        loading="lazy"
                    />
                )}

                {showRipple && <div className="ripple-effect" style={rippleStyle}/>}

                {showLoadingIndicator && (
                    <div className="loading-indicator">
                        <div className="spinner-overlay">
                            <div className="spinner-small"></div>
                        </div>
                    </div>
                )}

                {showErrorIndicator && (
                    <div className="error-indicator">
                        <div className="error-icon">
                            <AlertCircle size={20}/>
                        </div>
                    </div>
                )}

                {!hasValidAudio && !showErrorIndicator && (
                    <div className="no-audio-indicator">
                        <AlertCircle size={20} className="no-audio-icon"/>
                    </div>
                )}

                {shouldShowControls && hasValidAudio && !showLoadingIndicator && !showErrorIndicator && (
                    <div className="play-icon" onClick={handlePlayButtonClick}>
                        {!isPlaying ? (
                            <div className="triangle"></div>
                        ) : (
                            <div className="pause">
                                <span></span>
                                <span></span>
                            </div>
                        )}
                    </div>
                )}

                {isPlaying && !shouldShowControls && hasValidAudio && !showLoadingIndicator && (
                    <div className="bars">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                )}

                {isTouchDevice && isPlaying && shouldShowControls && hasValidAudio && (
                    <div className="bars mobile-bars">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                )}
            </div>

            <div className="track-info">
                <Link
                    to={`/track/${track.trackId}`}
                    className="track-title"
                    title={track.title}
                >
                    {track.title}
                </Link>
                <div className="track-artist" title={track.artist}>
                    {track.artistId ? (
                        <Link to={`/artist/${track.artistId}`} className="track-artist-link">
                            {track.artist}
                        </Link>
                    ) : (
                        <span>{track.artist}</span>
                    )}
                </div>
                <div
                    ref={dotsButtonRef}
                    className="track-duration"
                    onMouseEnter={() => !isTouchDevice && setDurationHovered(true)}
                    onMouseLeave={() => !isTouchDevice && setDurationHovered(false)}
                    onClick={handleDotsClick}
                >
                    {!durationHovered ? (
                        <span className="duration-text">{track.duration_formatted}</span>
                    ) : (
                        <span className="duration-dots">...</span>
                    )}
                </div>
            </div>

            <ContextMenu
                isVisible={showMenu}
                position={menuPosition}
                onClose={handleMenuClose}
                menuItems={getMenuItems()}
            />
        </div>
    );
}