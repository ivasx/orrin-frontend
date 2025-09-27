import "./TrackCard.css";
import {useRef, useState, useEffect, useCallback} from "react";
import ContextMenu from "../TrackCardContextMenu/TrackCardContextMenu.jsx";

export default function TrackCard({title, artist, duration, cover, audio}) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const [durationHovered, setDurationHovered] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [rippleStyle, setRippleStyle] = useState({});
    const [showRipple, setShowRipple] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [currentTime, setCurrentTime] = useState(0);
    const [totalDuration, setTotalDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Визначаємо чи це touch пристрій
    useEffect(() => {
        const checkTouchDevice = () => {
            return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        };
        setIsTouchDevice(checkTouchDevice());
    }, []);

    // Audio event handlers
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleLoadStart = () => setIsLoading(true);
        const handleCanPlay = () => setIsLoading(false);
        const handleError = () => {
            setError('Failed to load audio');
            setIsLoading(false);
            setIsPlaying(false);
        };
        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleDurationChange = () => setTotalDuration(audio.duration);
        const handleEnded = () => setIsPlaying(false);
        const handlePause = () => setIsPlaying(false);
        const handlePlay = () => setIsPlaying(true);

        audio.addEventListener('loadstart', handleLoadStart);
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('error', handleError);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('durationchange', handleDurationChange);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('play', handlePlay);

        return () => {
            audio.removeEventListener('loadstart', handleLoadStart);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('durationchange', handleDurationChange);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('play', handlePlay);
        };
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                handlePlayPause();
            }
        };

        if (showControls || isPlaying) {
            window.addEventListener('keydown', handleKeyPress);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [showControls, isPlaying]);

    const handlePlayPause = useCallback(() => {
        if (!audioRef.current || isLoading) return;

        setError(null);

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error('Play failed:', error);
                    setError('Playback failed');
                    setIsPlaying(false);
                });
            }
        }
    }, [isPlaying, isLoading]);

    // Menu items configuration
    const getMenuItems = useCallback(() => [
        {
            id: 'play',
            label: 'Play',
            icon: '▶',
            shortcut: 'Space',
            disabled: isPlaying,
            action: () => !isPlaying && handlePlayPause()
        },
        {
            id: 'pause',
            label: 'Pause',
            icon: '⏸',
            shortcut: 'Space',
            disabled: !isPlaying,
            action: () => isPlaying && handlePlayPause()
        },
        {
            id: 'restart',
            label: 'Restart',
            icon: '⏮',
            action: () => {
                if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    if (!isPlaying) handlePlayPause();
                }
            }
        },
        { type: 'separator' },
        {
            id: 'mute',
            label: isMuted ? 'Unmute' : 'Mute',
            icon: isMuted ? '🔊' : '🔇',
            action: () => {
                if (audioRef.current) {
                    const newMuted = !isMuted;
                    audioRef.current.muted = newMuted;
                    setIsMuted(newMuted);
                }
            }
        },
        {
            id: 'volumeUp',
            label: 'Volume Up',
            icon: '🔊',
            shortcut: '↑',
            action: () => {
                if (audioRef.current) {
                    const newVolume = Math.min(1, volume + 0.1);
                    audioRef.current.volume = newVolume;
                    setVolume(newVolume);
                    if (isMuted) {
                        audioRef.current.muted = false;
                        setIsMuted(false);
                    }
                }
            }
        },
        {
            id: 'volumeDown',
            label: 'Volume Down',
            icon: '🔉',
            shortcut: '↓',
            action: () => {
                if (audioRef.current) {
                    const newVolume = Math.max(0, volume - 0.1);
                    audioRef.current.volume = newVolume;
                    setVolume(newVolume);
                }
            }
        },
        { type: 'separator' },
        {
            id: 'addToPlaylist',
            label: 'Add to Playlist',
            icon: '➕',
            action: () => console.log('Add to playlist:', title)
        },
        {
            id: 'share',
            label: 'Share',
            icon: '📤',
            action: () => {
                if (navigator.share) {
                    navigator.share({
                        title: `${title} by ${artist}`,
                        text: `Listen to ${title} by ${artist}`,
                        url: window.location.href,
                    });
                } else {
                    navigator.clipboard.writeText(`${title} by ${artist} - ${window.location.href}`);
                }
            }
        },
        {
            id: 'download',
            label: 'Download',
            icon: '💾',
            action: () => {
                if (audio) {
                    const link = document.createElement('a');
                    link.href = audio;
                    link.download = `${title} - ${artist}.mp3`;
                    link.click();
                }
            }
        }
    ], [isPlaying, isMuted, volume, title, artist, audio, handlePlayPause]);

    function createRippleEffect(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        setRippleStyle({
            width: size,
            height: size,
            left: x,
            top: y,
        });

        setShowRipple(true);
        setTimeout(() => setShowRipple(false), 600);
    }

    function handleCoverClick(e) {
        if (e.button !== 0) return; // Only left click
        createRippleEffect(e);
        handlePlayPause();
    }

    function handlePlayButtonClick(e) {
        e.stopPropagation();
        createRippleEffect(e);
        handlePlayPause();
    }

    function handleContextMenu(e) {
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        let x = e.clientX;
        let y = e.clientY;

        // Ensure menu doesn't go off screen
        const menuWidth = 200;
        const menuHeight = 300;

        if (x + menuWidth > window.innerWidth) {
            x = window.innerWidth - menuWidth - 10;
        }
        if (y + menuHeight > window.innerHeight) {
            y = window.innerHeight - menuHeight - 10;
        }

        setMenuPosition({ x, y });
        setShowMenu(true);
    }

    function handleDotsClick(e) {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        let x = rect.right;
        let y = rect.top;

        // Ensure menu doesn't go off screen
        const menuWidth = 200;
        const menuHeight = 300;

        if (x + menuWidth > window.innerWidth) {
            x = rect.left - menuWidth;
        }
        if (y + menuHeight > window.innerHeight) {
            y = window.innerHeight - menuHeight - 10;
        }

        setMenuPosition({ x, y });
        setShowMenu(!showMenu);
    }

    const handleMenuClose = () => setShowMenu(false);

    const formatTime = (seconds) => {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // На мобільних показуємо контроли завжди коли трек активний (грає або на паузі)
    const shouldShowControls = isTouchDevice ? (isPlaying || showControls) : showControls;

    return (
        <div
            className="card-track"
            onContextMenu={handleContextMenu}
            role="button"
            tabIndex={0}
            aria-label={`Track: ${title} by ${artist}`}
        >
            <div
                className={`track-cover-wrapper ${isPlaying ? 'playing' : ''} ${isLoading ? 'loading' : ''}`}
                onClick={handleCoverClick}
                onMouseEnter={() => !isTouchDevice && setShowControls(true)}
                onMouseLeave={() => !isTouchDevice && setShowControls(false)}
                onTouchStart={() => isTouchDevice && setShowControls(true)}
            >
                <img src={cover} alt={title} className="track-cover"/>

                {/* Loading indicator */}
                {isLoading && (
                    <div className="loading-indicator">
                        <div className="spinner"></div>
                    </div>
                )}

                {/* Error indicator */}
                {error && (
                    <div className="error-indicator">
                        <div className="error-icon">⚠</div>
                    </div>
                )}

                {/* Ripple effect */}
                {showRipple && (
                    <div
                        className="ripple-effect"
                        style={rippleStyle}
                    />
                )}

                {/* Показуємо контроли */}
                {shouldShowControls && !isLoading && !error && (
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

                {/* Progress indicator */}
                {isPlaying && totalDuration > 0 && (
                    <div className="progress-indicator">
                        <div
                            className="progress-bar"
                            style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                        ></div>
                    </div>
                )}

                {/* На мобільних показуємо барони тільки коли грає і немає контролів поверх */}
                {/* На десктопі показуємо барони коли грає і немає hover */}
                {isPlaying && !shouldShowControls && !isLoading && !error && (
                    <div className="bars">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                )}

                {/* На мобільних показуємо барони завжди коли грає, навіть з контролами */}
                {isTouchDevice && isPlaying && shouldShowControls && !isLoading && !error && (
                    <div className="bars mobile-bars">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                )}
            </div>

            <div className="track-info">
                <div className="track-title" title={title}>{title}</div>
                <div className="track-artist" title={artist}>{artist}</div>
                <div
                    className="track-duration"
                    onMouseEnter={() => !isTouchDevice && setDurationHovered(true)}
                    onMouseLeave={() => !isTouchDevice && setDurationHovered(false)}
                    onClick={handleDotsClick}
                >
                    {!durationHovered ? (
                        <span className="duration-text">
                            {isPlaying && totalDuration ? formatTime(currentTime) : duration}
                        </span>
                    ) : (
                        <span className="duration-dots">...</span>
                    )}
                </div>
            </div>

            {/* Context Menu Component */}
            <ContextMenu
                isVisible={showMenu}
                position={menuPosition}
                onClose={handleMenuClose}
                menuItems={getMenuItems()}
            />

            <audio
                ref={audioRef}
                src={audio}
                preload="metadata"
                volume={volume}
                muted={isMuted}
            ></audio>
        </div>
    );
}