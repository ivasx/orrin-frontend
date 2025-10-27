import './TrackCard.css';
import { useState, useEffect, useCallback, useRef } from 'react'; // Додаємо useRef
import ContextMenu from '../OptionsMenu/OptionsMenu.jsx';
import { useAudioCore } from '../../context/AudioCoreContext.jsx';
import { useTranslation } from "react-i18next";
import { createTrackMenuItems } from './trackMenuItems.jsx';
import { Link } from 'react-router-dom';

// --- ЗМІНА 1: Оновлюємо імена пропсів ---
export default function TrackCard(props) {
    const {
        title,
        artist,
        duration_formatted, // Використовуємо форматовану тривалість з API
        cover_url,          // Використовуємо URL обкладинки з API
        audio_url,          // Використовуємо URL аудіо з API
        trackId,
        artistId,
        tracks              // Список всіх треків секції
    } = props; // Отримуємо всі пропси

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
    const finalTrackId = trackId;

    // --- Додаємо Ref для кнопки "крапок" ---
    const dotsButtonRef = useRef(null);

    useEffect(() => {
        setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }, []);

    const isPlaying = isTrackPlaying(finalTrackId);
    const isCurrentTrack = currentTrack && currentTrack.trackId === finalTrackId;

    // --- ЗМІНА 2: Оновлюємо parseDuration, щоб працював з "M:SS" ---
    const parseDuration = (durationStr) => {
        // Якщо вже число (секунди), повертаємо його
        if (typeof durationStr === 'number') return durationStr;
        // Якщо прийшов рядок "M:SS"
        if (typeof durationStr === 'string' && durationStr.includes(':')) {
            const parts = durationStr.split(':');
            if (parts.length === 2) {
                const minutes = parseInt(parts[0], 10) || 0;
                const seconds = parseInt(parts[1], 10) || 0;
                return minutes * 60 + seconds;
            }
        }
        // Якщо прийшло число у вигляді рядка (напр., з API як "439")
        if (typeof durationStr === 'string') {
            const parsedInt = parseInt(durationStr, 10);
            if (!isNaN(parsedInt)) return parsedInt;
        }
        return 0; // Fallback
    };

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
            // --- ЗМІНА 3: Передаємо правильні поля в playTrack ---
            playTrack({
                trackId: finalTrackId,
                title,
                artist,
                cover: cover_url, // Передаємо cover_url
                audio: audio_url, // Передаємо audio_url
                // Передаємо оригінальну тривалість з API, якщо вона є, АБО розраховану
                duration: props.duration || parseDuration(duration_formatted),
                artistId
            }, tracks);
        }
        // --- Оновлюємо залежності ---
    }, [isCurrentTrack, isPlaying, playTrack, pauseTrack, resumeTrack, finalTrackId, title, artist, cover_url, audio_url, props.duration, duration_formatted, artistId, tracks]);


    const getMenuItems = useCallback(() => createTrackMenuItems({
        t,
        isPlaying,
        isMuted,
        volume,
        handlePlayPause,
        isCurrentTrack,
        // audioRef більше не потрібен тут, прибираємо його
        toggleMute,
        updateVolume,
        title,
        artist,
        audio: audio_url // --- ЗМІНА 4: Передаємо audio_url сюди ---
    }), [
        t, isPlaying, isMuted, volume, handlePlayPause, isCurrentTrack,
        toggleMute, updateVolume, title, artist, audio_url // Оновлено залежність
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
        // Використовуємо Ref для отримання координат кнопки
        if (dotsButtonRef.current) {
            const rect = dotsButtonRef.current.getBoundingClientRect();
            let x = rect.right; // Починаємо праворуч від кнопки
            let y = rect.top; // Починаємо зверху кнопки

            const menuWidth = 200; // Орієнтовна ширина меню
            const menuHeight = 300; // Орієнтовна висота меню

            // Коригуємо позицію, щоб меню не виходило за межі екрану
            if (x + menuWidth > window.innerWidth - 10) { // 10px відступ
                x = rect.left - menuWidth; // Переміщаємо вліво від кнопки
            }
            if (y + menuHeight > window.innerHeight - 10) {
                y = window.innerHeight - menuHeight - 10; // Зсуваємо вгору
            }
            if (y < 10) { // Перевірка зверху
                y = 10;
            }
            if (x < 10) { // Перевірка зліва
                x = 10;
            }

            setMenuPosition({ x, y });
            setShowMenu(prev => !prev); // Перемикаємо видимість
        }
    }


    const handleMenuClose = () => setShowMenu(false);

    const shouldShowControls = isTouchDevice ? true : showControls;


    return (
        <div
            className="card-track"
            onContextMenu={handleContextMenu}
            role="button"
            tabIndex={0}
            aria-label={t('track_card_aria_label', { title, artist })}
        >
            <div
                className={`track-cover-wrapper ${isPlaying ? 'playing' : ''}`}
                onClick={handleCoverClick}
                onMouseEnter={() => !isTouchDevice && setShowControls(true)}
                onMouseLeave={() => !isTouchDevice && setShowControls(false)}
                onTouchStart={() => isTouchDevice && setShowControls(true)}
            >
                {/* --- ЗМІНА 5: Використовуємо cover_url --- */}
                <img src={cover_url} alt={title} className="track-cover"/>

                {showRipple && <div className="ripple-effect" style={rippleStyle} />}

                {shouldShowControls && (
                    <div className="play-icon" onClick={handlePlayButtonClick}>
                        {!isPlaying ? <div className="triangle"></div> : <div className="pause"><span></span><span></span></div>}
                    </div>
                )}
                {isPlaying && !shouldShowControls && ( <div className="bars"><span></span><span></span><span></span></div> )}
                {isTouchDevice && isPlaying && shouldShowControls && ( <div className="bars mobile-bars"><span></span><span></span><span></span></div> )}
            </div>

            <div className="track-info">
                <Link to={`/track/${finalTrackId}`} className="track-title" title={title}>
                    {title}
                </Link>
                <div className="track-artist" title={artist}>
                    {artistId ? ( <Link to={`/artist/${artistId}`} className="track-artist-link">{artist}</Link> ) : ( <span>{artist}</span> )}
                </div>
                {/* --- ЗМІНА 6: Додаємо Ref до кнопки-контейнера --- */}
                <div
                    ref={dotsButtonRef} // <--- Додано Ref
                    className="track-duration"
                    onMouseEnter={() => !isTouchDevice && setDurationHovered(true)}
                    onMouseLeave={() => !isTouchDevice && setDurationHovered(false)}
                    onClick={handleDotsClick}
                >
                    {/* --- ЗМІНА 7: Використовуємо duration_formatted --- */}
                    {!durationHovered ? (
                        <span className="duration-text">{duration_formatted}</span>
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