import './TrackCard.css';
import {useState, useEffect, useCallback, useRef, useMemo, memo} from 'react';
import ContextMenu from '../../UI/OptionsMenu/OptionsMenu.jsx';
import {useAudioCore} from '../../../context/AudioCoreContext.jsx';
import {useTranslation} from "react-i18next";
import {createTrackMenuItems} from './trackMenuItems.jsx';
import {Link} from 'react-router-dom';
import { MoreHorizontal, AlertCircle, Music } from 'lucide-react';
import {isTrackPlayable} from '../../../constants/fallbacks.js';
import {logger} from '../../../utils/logger.js';
import AuthPromptModal from '../AuthPromptModal/AuthPromptModal.jsx';

function TrackCard(props) {
    const {t} = useTranslation();
    const {
        currentTrack, playTrack, pauseTrack, resumeTrack, isTrackPlaying, audioRef,
        isMuted, toggleMute, volume, updateVolume
    } = useAudioCore();

    const track = useMemo(() => {
        if (!props.trackId) {
            logger.error('TrackCard: Received props without trackId', props);
            return null;
        }
        return props;
    }, [props]);

    if (!track) return null;

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
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const dotsButtonRef = useRef(null);
    const displayCover = coverError ? '/orrin-logo.svg' : track.cover;

    useEffect(() => {
        const mediaQuery = window.matchMedia('(pointer: coarse)');
        const handleDeviceChange = (e) => setIsTouchDevice(e.matches);
        setIsTouchDevice(mediaQuery.matches);
        mediaQuery.addEventListener('change', handleDeviceChange);
        return () => mediaQuery.removeEventListener('change', handleDeviceChange);
    }, []);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || currentTrack?.trackId !== track.trackId) return;

        const handleAudioError = () => {
            setAudioError(true);
            setIsAudioLoading(false);
        };
        const handleLoadStart = () => setIsAudioLoading(true);
        const handleCanPlay = () => setIsAudioLoading(false);

        audio.addEventListener('error', handleAudioError);
        audio.addEventListener('loadstart', handleLoadStart);
        audio.addEventListener('canplay', handleCanPlay);

        return () => {
            audio.removeEventListener('error', handleAudioError);
            audio.removeEventListener('loadstart', handleLoadStart);
            audio.removeEventListener('canplay', handleCanPlay);
        };
    }, [audioRef, currentTrack, track.trackId]);

    const isPlaying = isTrackPlaying(track.trackId);
    const isCurrentTrack = currentTrack && currentTrack.trackId === track.trackId;
    const showLoadingIndicator = isCurrentTrack && isAudioLoading;
    const showErrorIndicator = isCurrentTrack && audioError;

    // Плеєр тепер повністю відкритий для всіх
    const handlePlayPause = useCallback(() => {
        if (!track.trackId || !hasValidAudio) return;

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
    }), [t, isPlaying, isMuted, volume, handlePlayPause, isCurrentTrack, toggleMute, updateVolume, track.title, track.artist, track.audio, hasValidAudio]);

    function createRippleEffect(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        setRippleStyle({
            width: size,
            height: size,
            left: e.clientX - rect.left - size / 2,
            top: e.clientY - rect.top - size / 2
        });
        setShowRipple(true);
        setTimeout(() => setShowRipple(false), 600);
    }

    function handleCoverClick(e) {
        if (e.button !== 0 || !hasValidAudio) return;
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
        setMenuPosition({x: e.clientX, y: e.clientY});
        setShowMenu(true);
    };

    function handleDotsClick(e) {
        e.stopPropagation();
        if (dotsButtonRef.current) {
            const rect = dotsButtonRef.current.getBoundingClientRect();
            setMenuPosition({x: rect.right, y: rect.top});
            setShowMenu(prev => !prev);
        }
    }

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
                    <div className="track-cover-fallback"><Music size={32}/></div>
                ) : (
                    <img src={displayCover} alt={track.title} className="track-cover" loading="lazy"/>
                )}

                {showRipple && <div className="ripple-effect" style={rippleStyle}/>}

                {showLoadingIndicator && <div className="loading-indicator">
                    <div className="spinner-small"></div>
                </div>}

                {showControls && hasValidAudio && !showLoadingIndicator && !showErrorIndicator && (
                    <div className="play-icon" onClick={handlePlayButtonClick}>
                        {!isPlaying ? <div className="triangle"></div> :
                            <div className="pause"><span></span><span></span></div>}
                    </div>
                )}

                {isPlaying && !showControls && hasValidAudio &&
                    <div className="bars"><span></span><span></span><span></span></div>}
            </div>

            <div className="track-info">
                <Link to={`/track/${track.trackId}`} className="track-title">{track.title}</Link>
                <div className="track-artist">
                    {track.artistId ?
                        <Link to={`/artist/${track.artistId}`} className="track-artist-link">{track.artist}</Link> :
                        <span>{track.artist}</span>}
                </div>
                <div
                    ref={dotsButtonRef}
                    className="track-duration"
                    onClick={handleDotsClick}
                    onMouseEnter={() => setDurationHovered(true)}
                    onMouseLeave={() => setDurationHovered(false)}
                >
                    {!durationHovered ?
                        <span className="duration-text">{track.duration_formatted}</span> :
                        <MoreHorizontal size={20} className="duration-icon" />
                    }
                </div>
            </div>

            <ContextMenu isVisible={showMenu} position={menuPosition} onClose={() => setShowMenu(false)}
                         menuItems={getMenuItems()}/>

            <AuthPromptModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)}/>
        </div>
    );
}

export default memo(TrackCard);