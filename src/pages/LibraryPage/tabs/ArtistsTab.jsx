import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import Spinner from '../../../components/UI/Spinner/Spinner.jsx';
import ArtistCard from '../../../components/Shared/ArtistCard/ArtistCard.jsx';
import { getFollowingArtists } from '../../../services/api/index.js';
import styles from '../LibraryPage.module.css';

export default function ArtistsTab() {
    const { t } = useTranslation();
    const { data: artists = [], isLoading } = useQuery({
        queryKey: ['followingArtists'],
        queryFn: getFollowingArtists,
        staleTime: 5 * 60 * 1000,
    });

    if (isLoading) {
        return (
            <div className={styles.tabContent}>
                <div className={styles.loadingState}><Spinner /></div>
            </div>
        );
    }

    if (artists.length === 0) {
        return (
            <div className={styles.tabContent}>
                <div className={styles.emptyState}>
                    <Users size={40} className={styles.emptyIcon} />
                    <p className={styles.emptyText}>{t('no_artists')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.tabContent}>
            <div className={styles.artistGrid}>
                {artists.map((artist) => (
                    <ArtistCard
                        key={artist.id}
                        id={artist.slug || artist.id}
                        name={artist.name}
                        genre={artist.genre}
                        imageUrl={artist.imageUrl}
                    />
                ))}
            </div>
        </div>
    );
}