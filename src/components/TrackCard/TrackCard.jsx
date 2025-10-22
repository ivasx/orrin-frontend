// src/components/TrackCard/TrackCard.jsx
import './TrackCard.css';
import { useState, useEffect, useCallback } from 'react'; // Прибираємо 'useState' для isMuted
import ContextMenu from '../../context/TrackCardContextMenu/TrackCardContextMenu.jsx';
import { useAudioPlayer } from '../../context/AudioPlayerContext.jsx';
import { useTranslation } from "react-i18next";
import { createTrackMenuItems } from './trackMenuItems.jsx';
import { Link } from 'react-router-dom';

export default function TrackCard({ title, artist, duration, cover, audio, trackId, tracks }) {
    const { t } = useTranslation();

    // ▼▼▼ ЗМІНА ТУТ ▼▼▼
    const {
        currentTrack, playTrack, pauseTrack, resumeTrack, isTrackPlaying, audioRef,
        isMuted, // Дістаємо isMuted з контексту
        toggleMute, // Дістаємо toggleMute з контексту
        volume, // Залишаємо volume, якщо він потрібен для меню (наприклад, для disabled стану кнопок гучності)
        updateVolume // Можливо, теж знадобиться для меню Volume Up/Down
    } = useAudioPlayer();

    const [showControls, setShowControls] = useState(false);
    const [durationHovered, setDurationHovered] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [rippleStyle, setRippleStyle] = useState({});
    const [showRipple, setShowRipple] = useState(false);
    // Прибираємо локальний стан isMuted та volume, якщо він керується тільки в меню
    // const [isMuted, setIsMuted] = useState(false); // <--- ВИДАЛИТИ
    // const [volume, setVolume] = useState(1); // <--- Можна видалити, якщо updateVolume теж береться з контексту

    const finalTrackId = trackId || `${title}-${artist}`;

    useEffect(() => {
        setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }, []);

    const isPlaying = isTrackPlaying(finalTrackId);
    const isCurrentTrack = currentTrack && currentTrack.trackId === finalTrackId;

    const handlePlayPause = useCallback(() => {
        // ... (код без змін)
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
                duration: parseDuration(duration)
            }, tracks);
        }
    }, [isCurrentTrack, isPlaying, playTrack, pauseTrack, resumeTrack, finalTrackId, title, artist, cover, audio, duration, tracks]);

    const parseDuration = (durationStr) => {
        // ... (код без змін)
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

    // ▼▼▼ ЗМІНА ТУТ ▼▼▼
    // Тепер передаємо isMuted та toggleMute з контексту
    const getMenuItems = useCallback(() => createTrackMenuItems({
        t,
        isPlaying,
        isMuted, // <-- З контексту
        volume, // <-- З контексту
        handlePlayPause,
        isCurrentTrack,
        audioRef,
        toggleMute, // <-- Передаємо функцію toggleMute з контексту
        // setIsMuted, // <--- ВИДАЛИТИ (більше не потрібен сеттер локального стану)
        updateVolume, // <-- З контексту, для Volume Up/Down
        // setVolume, // <--- ВИДАЛИТИ (якщо використовуємо updateVolume з контексту)
        title,
        artist,
        audio
        // Додаємо volume та updateVolume, якщо вони потрібні для Volume Up/Down
    }), [
        t, isPlaying, isMuted, volume, handlePlayPause, isCurrentTrack, audioRef,
        toggleMute, // Додаємо в залежності
        updateVolume, // Додаємо в залежності
        title, artist, audio
    ]);


    // ... (решта коду handleContextMenu, handleDotsClick і т.д. без змін)
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
        // ... (JSX без змін)
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
                <div className="track-artist" title={artist}>{artist}</div>
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