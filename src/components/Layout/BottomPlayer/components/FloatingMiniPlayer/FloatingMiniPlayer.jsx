import {memo, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {Play, Pause, ChevronUp} from 'lucide-react';
import {useDraggableSnap} from './useDraggableSnap.js';
import styles from './FloatingMiniPlayer.module.css';

const FloatingMiniPlayer = memo(({
                                     isCollapsed,
                                     currentTrack,
                                     isPlaying,
                                     onToggleExpand,
                                     onPlayPause,
                                 }) => {
    const {t} = useTranslation();
    const {pillRef, style, isDragging, pointerHandlers} = useDraggableSnap({bottomOffset: 16});

    const handleExpandClick = useCallback(
        (e) => {
            if (isDragging) {
                e.preventDefault();
                return;
            }
            onToggleExpand();
        },
        [isDragging, onToggleExpand],
    );

    const handlePlayPauseClick = useCallback(
        (e) => {
            e.stopPropagation();
            if (isDragging) return;
            onPlayPause();
        },
        [isDragging, onPlayPause],
    );

    const handleKeyDown = useCallback(
        (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggleExpand();
            }
        },
        [onToggleExpand],
    );

    if (!currentTrack) return null;

    return (
        <div
            ref={pillRef}
            className={[
                styles.pill,
                isCollapsed ? styles.pillVisible : '',
                isDragging ? styles.pillDragging : '',
            ]
                .filter(Boolean)
                .join(' ')}
            style={style}
            role="button"
            tabIndex={isCollapsed ? 0 : -1}
            aria-label={t('mini_player_expand_aria')}
            aria-hidden={!isCollapsed}
            onKeyDown={handleKeyDown}
            onClick={handleExpandClick}
            {...pointerHandlers}
        >
            <img
                src={currentTrack.cover}
                alt=""
                className={styles.cover}
                draggable={false}
            />

            <div className={styles.info}>
                <span className={styles.title}>{currentTrack.title}</span>
                <span className={styles.artist}>{currentTrack.artist}</span>
            </div>

            <button
                className={styles.playBtn}
                onClick={handlePlayPauseClick}
                aria-label={isPlaying ? t('pause') : t('play')}
                tabIndex={isCollapsed ? 0 : -1}
            >
                {isPlaying
                    ? <Pause size={16} fill="currentColor"/>
                    : <Play size={16} fill="currentColor" className={styles.playIcon}/>
                }
            </button>

            <span className={styles.chevron} aria-hidden="true">
                <ChevronUp size={14}/>
            </span>
        </div>
    );
});

FloatingMiniPlayer.displayName = 'FloatingMiniPlayer';
export default FloatingMiniPlayer;