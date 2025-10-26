import './TrackCard.css';
import { useState, useEffect, useCallback } from 'react';
import ContextMenu from '../OptionsMenu/OptionsMenu.jsx';
import { useAudioCore } from '../../context/AudioCoreContext.jsx';
import { useTranslation } from "react-i18next";
import { createTrackMenuItems } from './trackMenuItems.jsx';
import { Link } from 'react-router-dom';

export default function TrackCard({ title, artist, duration, cover, audio, trackId, artistId, tracks }) {
    const { t } = useTranslation();

    const {
        currentTrack, playTrack, pauseTrack, resumeTrack, isTrackPlaying, audioRef,
        isMuted, toggleMute, volume, updateVolume
    } = useAudioCore();

    const [showControls, setShowControls] = useState(false);
    const [durationHovered, setDurationHovered] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [rippleStyle, setRippleStyle] = useState({});
    const [showRipple, setShowRipple] = useState(false);
    const finalTrackId = trackId

    useEffect(() => {
        setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }, []);

    const isPlaying = isTrackPlaying(finalTrackId);
    const isCurrentTrack = currentTrack && currentTrack.trackId === finalTrackId;

    const handlePlayPause = useCallback(() => {
        if (!finalTrackId) {
            console.error("TrackCard: trackId is missing!");
            return;
        }

        if (isCurrentTrack && isPlaying) {
            pauseTrack();
        } else if (isCurrentTrack && !isPlaying) {
            resumeTrack();
        } else {
            playTrack({
                trackId: finalTrackId,
                title,
                artist,
                cover,
                audio,
                duration: parseDuration(duration),
                artistId
            }, tracks);
        }
    }, [isCurrentTrack, isPlaying, playTrack, pauseTrack, resumeTrack, finalTrackId, title, artist, cover, audio, duration, tracks]);

    const parseDuration = (durationStr) => {
        if (typeof durationStr === 'number') return durationStr;
        if (!durationStr || typeof durationStr !== 'string') return 0;

        const parts = durationStr.split(':');
        if (parts.length === 2) {
            const minutes = parseInt(parts[0], 10) || 0;
            const seconds = parseInt(parts[1], 10) || 0;
            return minutes * 60 + seconds;
        }
        return 0;
    };


    const getMenuItems = useCallback(() => createTrackMenuItems({
        t,
        isPlaying,
        isMuted,
        volume,
        handlePlayPause,
        isCurrentTrack,
        audioRef,
        toggleMute,
        updateVolume,
        title,
        artist,
        audio
    }), [
        t, isPlaying, isMuted, volume, handlePlayPause, isCurrentTrack, audioRef,
        toggleMute,
        updateVolume,
        title, artist, audio
    ]);


    function createRippleEffect(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        setRippleStyle({
            width: size,
            height: size,
            left: x,
            top: y
        });

        setShowRipple(true);
        setTimeout(() => setShowRipple(false), 600);
    }

    function handleCoverClick(e) {
        if (e.button !== 0) return;
        createRippleEffect(e);
        handlePlayPause();
    }

    function handlePlayButtonClick(e) {
        e.stopPropagation();
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
        const rect = e.currentTarget.getBoundingClientRect();
        let x = rect.right;
        let y = rect.top;

        const menuWidth = 200;
        const menuHeight = 300;

        if (x + menuWidth > window.innerWidth) {
            x = rect.left - menuWidth;
        }
        if (y + menuHeight > window.innerHeight) {
            y = window.innerHeight - menuHeight - 10;
        }

        setMenuPosition({x, y});
        setShowMenu(!showMenu);
    }

    const handleMenuClose = () => setShowMenu(false);

    const shouldShowControls = isTouchDevice ? true : showControls;


    return (
        <div
            className="card-track"
            onContextMenu={handleContextMenu}
            role="button"
            tabIndex={0}
            aria-label={t('track_card_aria_label', {title, artist})}
        >
            <div
                className={`track-cover-wrapper ${isPlaying ? 'playing' : ''}`}
                onClick={handleCoverClick}
                onMouseEnter={() => !isTouchDevice && setShowControls(true)}
                onMouseLeave={() => !isTouchDevice && setShowControls(false)}
                onTouchStart={() => isTouchDevice && setShowControls(true)}
            >
                <img src={cover} alt={title} className="track-cover"/>


                {showRipple && (
                    <div
                        className="ripple-effect"
                        style={rippleStyle}
                    />
                )}


                {shouldShowControls && (
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

                {isPlaying && !shouldShowControls && (
                    <div className="bars">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                )}

                {isTouchDevice && isPlaying && shouldShowControls && (
                    <div className="bars mobile-bars">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                )}
            </div>

            <div className="track-info">
                <Link to={`/track/${finalTrackId}`} className="track-title" title={title}>
                    {title}
                </Link>
                <div className="track-artist" title={artist}>
                    {artistId ? (
                        <Link to={`/artist/${artistId}`} className="track-artist-link">
                            {artist}
                        </Link>
                    ) : (
                        <span>{artist}</span>
                    )}
                </div>
                <div
                    className="track-duration"
                    onMouseEnter={() => !isTouchDevice && setDurationHovered(true)}
                    onMouseLeave={() => !isTouchDevice && setDurationHovered(false)}
                    onClick={handleDotsClick}
                >
                    {!durationHovered ? (
                        <span className="duration-text">{duration}</span>
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