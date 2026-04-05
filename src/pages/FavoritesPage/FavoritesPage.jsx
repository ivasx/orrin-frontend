import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext.jsx';
import {
    getTopTracks,
    getTopAlbums,
    getTopArtists,
} from '../../services/api/index.js';
import MusicSectionWrapper from '../../components/Shared/MusicSectionWrapper/MusicSectionWrapper.jsx';
import TrackSection from '../../components/Shared/TrackSection/TrackSection.jsx';
import ArtistSection from '../../components/Shared/ArtistSection/ArtistSection.jsx';
import AlbumSection from '../../components/Shared/AlbumSection/AlbumSection.jsx';
import InfoSection from '../../components/Shared/InfoSection/InfoSection.jsx';
import Spinner from '../../components/UI/Spinner/Spinner.jsx';
import styles from './FavoritesPage.module.css';

const QUERY_OPTIONS = { staleTime: 5 * 60 * 1000 };

export default function FavoritesPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

    const [tracksQuery, albumsQuery, artistsQuery] = useQueries({
        queries: [
            {
                queryKey: ['topTracks'],
                queryFn: getTopTracks,
                enabled: isLoggedIn,
                ...QUERY_OPTIONS,
            },
            {
                queryKey: ['topAlbums'],
                queryFn: getTopAlbums,
                enabled: isLoggedIn,
                ...QUERY_OPTIONS,
            },
            {
                queryKey: ['topArtists'],
                queryFn: getTopArtists,
                enabled: isLoggedIn,
                ...QUERY_OPTIONS,
            },
        ],
    });

    if (!isLoggedIn) {
        return (
            <MusicSectionWrapper spacing="top-only">
                <InfoSection
                    title={t('favorites_tracks')}
                    message={t('login_to_see_favorites')}
                    action={{
                        label: t('login'),
                        onClick: () => navigate('/login'),
                        variant: 'primary',
                    }}
                />
            </MusicSectionWrapper>
        );
    }

    const isLoading = tracksQuery.isLoading || albumsQuery.isLoading || artistsQuery.isLoading;

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <Spinner />
            </div>
        );
    }

    const tracks  = tracksQuery.data  || [];
    const albums  = albumsQuery.data  || [];
    const artists = artistsQuery.data || [];

    const normalizedArtists = artists.map((a) => ({
        id:       a.id || a.slug,
        name:     a.name,
        imageUrl: a.imageUrl || a.image || a.image_url,
        genre:    a.genre,
        role:     a.role || a.genre,
    }));

    return (
        <div className={styles.dashboard}>
            <MusicSectionWrapper spacing="top-only">
                <header className={styles.header}>
                    <h1 className={styles.pageTitle}>{t('for_you')}</h1>
                    <p className={styles.pageSubtitle}>{t('for_you_subtitle')}</p>
                </header>
            </MusicSectionWrapper>

            <MusicSectionWrapper spacing="tight">
                {tracksQuery.isError ? (
                    <InfoSection
                        title={t('on_repeat')}
                        error={tracksQuery.error}
                        action={{
                            label: t('retry'),
                            onClick: () => tracksQuery.refetch(),
                            variant: 'outline',
                        }}
                    />
                ) : tracks.length === 0 ? (
                    <InfoSection
                        title={t('on_repeat')}
                        message={t('on_repeat_empty')}
                    />
                ) : (
                    <TrackSection
                        title={t('on_repeat')}
                        tracks={tracks}
                    />
                )}
            </MusicSectionWrapper>

            <MusicSectionWrapper spacing="tight">
                {albumsQuery.isError ? (
                    <InfoSection
                        title={t('top_albums')}
                        error={albumsQuery.error}
                        action={{
                            label: t('retry'),
                            onClick: () => albumsQuery.refetch(),
                            variant: 'outline',
                        }}
                    />
                ) : albums.length === 0 ? (
                    <InfoSection
                        title={t('top_albums')}
                        message={t('top_albums_empty')}
                    />
                ) : (
                    <AlbumSection
                        title={t('top_albums')}
                        albums={albums}
                    />
                )}
            </MusicSectionWrapper>

            <MusicSectionWrapper spacing="tight">
                {artistsQuery.isError ? (
                    <InfoSection
                        title={t('top_artists')}
                        error={artistsQuery.error}
                        action={{
                            label: t('retry'),
                            onClick: () => artistsQuery.refetch(),
                            variant: 'outline',
                        }}
                    />
                ) : normalizedArtists.length === 0 ? (
                    <InfoSection
                        title={t('top_artists')}
                        message={t('top_artists_empty')}
                    />
                ) : (
                    <ArtistSection
                        title={t('top_artists')}
                        artists={normalizedArtists}
                    />
                )}
            </MusicSectionWrapper>
        </div>
    );
}