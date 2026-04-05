import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Disc3 } from 'lucide-react';
import Spinner from '../../../components/UI/Spinner/Spinner.jsx';
import AlbumCard from '../../../components/Shared/AlbumCard/AlbumCard.jsx';
import { getSavedAlbums } from '../../../services/api/index.js';
import styles from '../LibraryPage.module.css';

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
                    <AlbumCard
                        key={album.id}
                        id={album.id}
                        title={album.title}
                        artist={album.artist}
                        cover={album.cover}
                        year={album.year}
                    />
                ))}
            </div>
        </div>
    );
}