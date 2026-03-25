import { memo, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Pause, ChevronUp } from 'lucide-react';
import { useDraggableSnap } from './useDraggableSnap.js';
import styles from './FloatingMiniPlayer.module.css';

/**
 * FloatingMiniPlayer
 *
 * A draggable pill that floats over the page content when the main player bar
 * is collapsed. Snaps to bottom-left / bottom-center / bottom-right and
 * persists the chosen position in localStorage.
 *
 * Props
 * ─────
 * isCollapsed     boolean   — whether the main bar is collapsed (controls visibility)
 * currentTrack    object    — { title, artist, cover }
 * isPlaying       boolean
 * onToggleExpand  () => void — called on a clean tap to restore the player bar
 * onPlayPause     () => void — called on a clean tap of the play/pause button
 */
const FloatingMiniPlayer = memo(({
                                     isCollapsed,
                                     currentTrack,
                                     isPlaying,
                                     onToggleExpand,
                                     onPlayPause,
                                 }) => {
    const { t } = useTranslation();
    const { pillRef, style, isDragging, pointerHandlers } = useDraggableSnap({
        bottomOffset: 16,
    });


    // We suppress the click handler if a drag just finished.
    const handleExpandClick = useCallback((e) => {
        if (isDragging) { e.preventDefault(); return; }
        onToggleExpand();
    }, [isDragging, onToggleExpand]);

    const handlePlayPauseClick = useCallback((e) => {
        e.stopPropagation(); // don't bubble to the expand handler
        if (isDragging) return;
        onPlayPause();
    }, [isDragging, onPlayPause]);

    // Keyboard support
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleExpand();
        }
    }, [onToggleExpand]);

    if (!currentTrack) return null;

    return (
        <div
            ref={pillRef}
            className={`${styles.pill} ${isCollapsed ? styles.pillVisible : ''} ${isDragging ? styles.pillDragging : ''}`}
            style={style}
            role="button"
            tabIndex={isCollapsed ? 0 : -1}
            aria-label={t('mini_player_expand_aria', 'Expand player')}
            aria-hidden={!isCollapsed}
            onKeyDown={handleKeyDown}
            onClick={handleExpandClick}
            // Pointer events for drag.
            // Note: we spread onto the wrapper so the whole pill is draggable.
            {...pointerHandlers}
        >
            {/* Album art */}
            <img
                src={currentTrack.cover}
                alt=""
                className={styles.cover}
                draggable={false}
            />

            {/* Track info */}
            <div className={styles.info}>
                <span className={styles.title}>{currentTrack.title}</span>
                <span className={styles.artist}>{currentTrack.artist}</span>
            </div>

            {/* Play / Pause */}
            <button
                className={styles.playBtn}
                onClick={handlePlayPauseClick}
                aria-label={isPlaying ? t('pause') : t('play')}
                tabIndex={isCollapsed ? 0 : -1}
            >
                {isPlaying
                    ? <Pause  size={16} fill="currentColor" />
                    : <Play   size={16} fill="currentColor" className={styles.playIcon} />
                }
            </button>

            {/* Expand chevron — visual hint only, click bubbles to wrapper */}
            <span className={styles.chevron} aria-hidden="true">
                <ChevronUp size={14} />
            </span>
        </div>
    );
});

FloatingMiniPlayer.displayName = 'FloatingMiniPlayer';
export default FloatingMiniPlayer;