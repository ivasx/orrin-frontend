import { useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Globe, Lock, Clock, Music2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import Button from '../../components/UI/Button/Button.jsx';
import ContextMenu from '../../components/UI/OptionsMenu/OptionsMenu.jsx';
import styles from './PlaylistPage.module.css';

const formatDuration = (totalSeconds) => {
    if (!totalSeconds) return '0 min';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) return `${hours} hr ${minutes} min`;
    return `${minutes} min`;
};

export default function PlaylistHero({
                                         playlist,
                                         onPlay,
                                         showMenu,
                                         menuPosition,
                                         onMenuOpen,
                                         onMenuClose,
                                         onEditDetails,
                                         onDeletePlaylist,
                                     }) {
    const { t } = useTranslation();
    const dotsButtonRef = useRef(null);

    const handleDotsClick = useCallback((e) => {
        e.stopPropagation();
        if (dotsButtonRef.current) {
            const rect = dotsButtonRef.current.getBoundingClientRect();
            onMenuOpen({ x: rect.right, y: rect.bottom });
        }
    }, [onMenuOpen]);

    const menuItems = [
        {
            id: 'edit',
            label: t('playlist_edit_details'),
            icon: <Pencil size={16} />,
            action: onEditDetails,
        },
        { type: 'separator' },
        {
            id: 'delete',
            label: t('playlist_delete'),
            icon: <Trash2 size={16} />,
            variant: 'danger',
            action: onDeletePlaylist,
        },
    ];

    return (
        <div className={styles.hero}>
            <div className={styles.heroCoverWrapper}>
                {playlist.cover ? (
                    <img
                        src={playlist.cover}
                        alt={playlist.name}
                        className={styles.heroCover}
                    />
                ) : (
                    <div className={styles.heroCoverFallback}>
                        <Music2 size={48} className={styles.heroCoverIcon} />
                    </div>
                )}
            </div>

            <div className={styles.heroContent}>
                <div className={styles.heroMeta}>
                    <span className={styles.heroEyebrow}>
                        {playlist.isPublic
                            ? <><Globe size={12} /> {t('playlist_public')}</>
                            : <><Lock size={12} /> {t('playlist_private')}</>
                        }
                    </span>
                    <h1 className={styles.heroTitle}>{playlist.name}</h1>
                    {playlist.description && (
                        <p className={styles.heroDescription}>{playlist.description}</p>
                    )}
                    <div className={styles.heroStats}>
                        <span className={styles.heroStat}>
                            {playlist.trackCount} {t('tracks')}
                        </span>
                        <span className={styles.heroStatDivider}>·</span>
                        <span className={styles.heroStat}>
                            <Clock size={12} className={styles.heroStatIcon} />
                            {formatDuration(playlist.totalDuration)}
                        </span>
                    </div>
                </div>

                <div className={styles.heroActions}>
                    <Button
                        variant="primary"
                        onClick={onPlay}
                        disabled={!playlist.tracks?.length}
                        icon={<Play size={18} fill="currentColor" />}
                    >
                        {t('play')}
                    </Button>

                    <button
                        ref={dotsButtonRef}
                        className={`${styles.heroOptionsBtn}${showMenu ? ` ${styles.heroOptionsBtnOpen}` : ''}`}
                        onClick={handleDotsClick}
                        aria-label={t('post_more_options')}
                        aria-expanded={showMenu}
                        aria-haspopup="menu"
                    >
                        <MoreHorizontal size={20} />
                    </button>

                    <ContextMenu
                        isVisible={showMenu}
                        position={menuPosition}
                        onClose={onMenuClose}
                        menuItems={menuItems}
                        openDirection="down"
                    />
                </div>
            </div>
        </div>
    );
}