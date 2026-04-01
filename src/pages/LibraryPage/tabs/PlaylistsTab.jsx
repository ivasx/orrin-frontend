import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Play, ListMusic, Globe, Lock, Plus } from 'lucide-react';
import Button from '../../../components/UI/Button/Button.jsx';
import Spinner from '../../../components/UI/Spinner/Spinner.jsx';
import { getUserPlaylists } from '../../../services/api/index.js';
import styles from '../LibraryPage.module.css';

function PlaylistCard({ playlist }) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/playlist/${playlist.id}`);
    };

    const handlePlayClick = (e) => {
        e.stopPropagation();
        navigate(`/playlist/${playlist.id}`);
    };

    return (
        <div className={styles.playlistCard} onClick={handleClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleClick()}>
            <div className={styles.playlistCoverWrapper}>
                {playlist.cover ? (
                    <img src={playlist.cover} alt={playlist.name} className={styles.playlistCover} />
                ) : (
                    <div className={styles.playlistCoverFallback}>
                        <ListMusic size={28} className={styles.playlistCoverIcon} />
                    </div>
                )}
                <button className={styles.playlistPlayBtn} aria-label={`${t('play')} ${playlist.name}`} onClick={handlePlayClick}>
                    <Play size={20} fill="currentColor" />
                </button>
            </div>
            <div className={styles.playlistInfo}>
                <span className={styles.playlistName}>{playlist.name}</span>
                <div className={styles.playlistMeta}>
                    {playlist.isPublic
                        ? <Globe size={11} className={styles.playlistMetaIcon} />
                        : <Lock size={11} className={styles.playlistMetaIcon} />
                    }
                    <span className={styles.playlistMetaText}>
                        {playlist.trackCount} {t('tracks')}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function PlaylistsTab({ onCreateClick }) {
    const { t } = useTranslation();
    const { data: playlists = [], isLoading } = useQuery({
        queryKey: ['userPlaylists'],
        queryFn: getUserPlaylists,
        staleTime: 5 * 60 * 1000,
    });

    return (
        <div className={styles.tabContent}>
            <div className={styles.tabActions}>
                <Button variant="secondary" onClick={onCreateClick} icon={<Plus size={16} />}>
                    {t('create_playlist')}
                </Button>
            </div>

            {isLoading ? (
                <div className={styles.loadingState}><Spinner /></div>
            ) : playlists.length === 0 ? (
                <div className={styles.emptyState}>
                    <ListMusic size={40} className={styles.emptyIcon} />
                    <p className={styles.emptyText}>{t('no_playlists')}</p>
                </div>
            ) : (
                <div className={styles.cardGrid}>
                    {playlists.map((playlist) => (
                        <PlaylistCard key={playlist.id} playlist={playlist} />
                    ))}
                </div>
            )}
        </div>
    );
}