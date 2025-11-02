// src/components/TrackCard/TrackCard.jsx
import './TrackCard.css';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import ContextMenu from '../OptionsMenu/OptionsMenu.jsx';
import { useAudioCore } from '../../context/AudioCoreContext.jsx';
import { useTranslation } from "react-i18next";
import { createTrackMenuItems } from './trackMenuItems.jsx';
import { Link } from 'react-router-dom';
import { AlertCircle, Music } from 'lucide-react';

// Константи для fallback-значень
const FALLBACK_COVER = '/orrin-logo.svg';
const FALLBACK_TITLE = 'Unknown Track';
const FALLBACK_ARTIST = 'Unknown Artist';
const FALLBACK_DURATION = '0:00';

export default function TrackCard(props) {
    const {
        title,
        artist,
        duration_formatted,
        cover_url,
        audio_url,
        trackId,
        artistId,
        tracks
    } = props;

    const { t } = useTranslation();
    const {
        currentTrack, playTrack, pauseTrack, resumeTrack, isTrackPlaying, audioRef,
        isMuted, toggleMute, volume, updateVolume
    } = useAudioCore();

    // Стани для обробки помилок
    const [coverError, setCoverError] = useState(false);
    const [audioError, setAudioError] = useState(false);
    const [isAudioLoading, setIsAudioLoading] = useState(false);

    // Стани для UI
    const [showControls, setShowControls] = useState(false);
    const [durationHovered, setDurationHovered] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [rippleStyle, setRippleStyle] = useState({});
    const [showRipple, setShowRipple] = useState(false);

    const dotsButtonRef = useRef(null);
    const finalTrackId = trackId;

    // Обробка artist - може бути рядком або об'єктом
    const getArtistName = (artistData) => {
        if (!artistData) return FALLBACK_ARTIST;

        // Якщо це рядок
        if (typeof artistData === 'string') {
            return artistData.trim() || FALLBACK_ARTIST;
        }

        // Якщо це об'єкт з полем name
        if (typeof artistData === 'object' && artistData.name) {
            return artistData.name.trim() || FALLBACK_ARTIST;
        }

        // Якщо це масив артистів (на випадок множинних артистів)
        if (Array.isArray(artistData) && artistData.length > 0) {
            const names = artistData.map(a =>
                typeof a === 'string' ? a : (a.name || '')
            ).filter(n => n);
            return names.join(', ') || FALLBACK_ARTIST;
        }

        return FALLBACK_ARTIST;
    };

    // Обробка artistId
    const getArtistId = (artistData, providedArtistId) => {
        // Якщо є окремий artistId пропс, використовуємо його
        if (providedArtistId) return providedArtistId;

        // Якщо artist - об'єкт з id
        if (typeof artistData === 'object' && artistData?.id) {
            return artistData.id;
        }

        // Якщо artist - об'єкт з slug
        if (typeof artistData === 'object' && artistData?.slug) {
            return artistData.slug;
        }

        return null;
    };

    // Безпечні значення з fallback
    const safeTitle = title?.trim() || t('unknown_track', FALLBACK_TITLE);
    const safeArtist = getArtistName(artist);
    const safeArtistId = getArtistId(artist, artistId);
    const safeCover = !coverError && cover_url ? cover_url : FALLBACK_COVER;
    const safeDuration = duration_formatted || FALLBACK_DURATION;
    const hasValidAudio = audio_url && !audioError;

    useEffect(() => {
        setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }, []);

    // Скидання помилок при зміні треку
    useEffect(() => {
        setCoverError(false);
        setAudioError(false);
    }, [trackId]);

    // Перевірка помилок аудіо для поточного треку
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || currentTrack?.trackId !== finalTrackId) return;

        const handleAudioError = (e) => {
            console.error('Audio error for track:', finalTrackId, e);
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
    }, [audioRef, currentTrack, finalTrackId]);

    const isPlaying = isTrackPlaying(finalTrackId);
    const isCurrentTrack = currentTrack && currentTrack.trackId === finalTrackId;
    const showLoadingIndicator = isCurrentTrack && isAudioLoading;
    const showErrorIndicator = isCurrentTrack && audioError;

    const parseDuration = (durationStr) => {
        if (typeof durationStr === 'number') return durationStr;
        if (typeof durationStr === 'string' && durationStr.includes(':')) {
            const parts = durationStr.split(':');
            if (parts.length === 2) {
                const minutes = parseInt(parts[0], 10) || 0;
                const seconds = parseInt(parts[1], 10) || 0;
                return minutes * 60 + seconds;
            }
        }
        if (typeof durationStr === 'string') {
            const parsedInt = parseInt(durationStr, 10);
            if (!isNaN(parsedInt)) return parsedInt;
        }
        return 0;
    };

    const handlePlayPause = useCallback(() => {
        if (!finalTrackId) {
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
            playTrack({
                trackId: finalTrackId,
                title: safeTitle,
                artist: safeArtist,
                cover: safeCover,
                audio: audio_url,
                duration: props.duration || parseDuration(duration_formatted),
                artistId: safeArtistId
            }, tracks);
        }
    }, [isCurrentTrack, isPlaying, playTrack, pauseTrack, resumeTrack, finalTrackId,
        safeTitle, safeArtist, safeCover, audio_url, props.duration, duration_formatted,
        safeArtistId, tracks, hasValidAudio]);

    const getMenuItems = useCallback(() => createTrackMenuItems({
        t,
        isPlaying,
        isMuted,
        volume,
        handlePlayPause,
        isCurrentTrack,
        toggleMute,
        updateVolume,
        title: safeTitle,
        artist: safeArtist,
        audio: audio_url,
        hasValidAudio
    }), [
        t, isPlaying, isMuted, volume, handlePlayPause, isCurrentTrack,
        toggleMute, updateVolume, safeTitle, safeArtist, audio_url, hasValidAudio
    ]);

    function createRippleEffect(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        setRippleStyle({ width: size, height: size, left: x, top: y });
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

            setMenuPosition({ x, y });
            setShowMenu(prev => !prev);
        }
    }

    const handleMenuClose = () => setShowMenu(false);
    const shouldShowControls = isTouchDevice ? true : showControls;

    const handleCoverError = () => {
        console.warn('Cover image failed to load for track:', finalTrackId);
        setCoverError(true);
    };

    return (
        <div
            className="card-track"
            onContextMenu={handleContextMenu}
            role="button"
            tabIndex={0}
            aria-label={t('track_card_aria_label', { title: safeTitle, artist: safeArtist })}
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
                        <Music size={32} />
                    </div>
                ) : (
                    <img
                        src={safeCover}
                        alt={safeTitle}
                        className="track-cover"
                        onError={handleCoverError}
                        loading="lazy"
                    />
                )}

                {showRipple && <div className="ripple-effect" style={rippleStyle} />}

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
                            <AlertCircle size={20} />
                        </div>
                    </div>
                )}

                {!hasValidAudio && !showErrorIndicator && (
                    <div className="no-audio-indicator">
                        <AlertCircle size={20} className="no-audio-icon" />
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
                    to={`/track/${finalTrackId}`}
                    className="track-title"
                    title={safeTitle}
                >
                    {safeTitle}
                </Link>
                <div className="track-artist" title={safeArtist}>
                    {safeArtistId ? (
                        <Link to={`/artist/${safeArtistId}`} className="track-artist-link">
                            {safeArtist}
                        </Link>
                    ) : (
                        <span>{safeArtist}</span>
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
                        <span className="duration-text">{safeDuration}</span>
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