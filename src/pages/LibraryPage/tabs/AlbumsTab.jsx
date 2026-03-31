import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Play, Disc3 } from 'lucide-react';
import Spinner from '../../../components/UI/Spinner/Spinner.jsx';
import { getSavedAlbums } from '../../../services/api/index.js';
import styles from '../LibraryPage.module.css';

function AlbumCard({ album }) {
    const { t } = useTranslation();
    return (
        <div className={styles.albumCard}>
            <div className={styles.albumCoverWrapper}>
                <img src={album.cover} alt={album.title} className={styles.albumCover} />
                <button className={styles.albumPlayBtn} aria-label={`${t('play')} ${album.title}`}>
                    <Play size={20} fill="currentColor" />
                </button>
            </div>
            <div className={styles.albumInfo}>
                <span className={styles.albumTitle}>{album.title}</span>
                <span className={styles.albumArtist}>{album.artist.name}</span>
                <span className={styles.albumYear}>{album.year}</span>
            </div>
        </div>
    );
}

export default function AlbumsTab() {
    const { t } = useTranslation();
    const { data: albums = [], isLoading } = useQuery({
        queryKey: ['savedAlbums'],
        queryFn: getSavedAlbums,
        staleTime: 5 * 60 * 1000,
    });

    if (isLoading) {
        return (
            <div className={styles.tabContent}>
                <div className={styles.loadingState}><Spinner /></div>
            </div>
        );
    }

    if (albums.length === 0) {
        return (
            <div className={styles.tabContent}>
                <div className={styles.emptyState}>
                    <Disc3 size={40} className={styles.emptyIcon} />
                    <p className={styles.emptyText}>{t('no_albums')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.tabContent}>
            <div className={styles.cardGrid}>
                {albums.map((album) => (
                    <AlbumCard key={album.id} album={album} />
                ))}
            </div>
        </div>
    );
}