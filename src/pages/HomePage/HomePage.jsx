import { useQuery } from '@tanstack/react-query';
import { useTranslation } from "react-i18next";
import TrackSection from '../../components/Shared/TrackSection/TrackSection.jsx';
import ArtistSection from '../../components/Shared/ArtistSection/ArtistSection.jsx';
import MusicSectionWrapper from "../../components/Shared/MusicSectionWrapper/MusicSectionWrapper.jsx";
import InfoSection from '../../components/Shared/InfoSection/InfoSection.jsx'; // Новий універсальний компонент
import Spinner from '../../components/UI/Spinner/Spinner.jsx';
import { getTracks, getArtists, getFriendsActivity } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// Helper component for background updates
const UpdatingIndicator = () => (
    <div style={{ display: 'flex', alignItems: 'center', marginLeft: '12px', opacity: 0.7 }}>
        <div style={{ transform: 'scale(0.6)' }}>
            <Spinner />
        </div>
    </div>
);

export default function HomePage() {
    const { t } = useTranslation();
    const { isLoggedIn } = useAuth();

    // 1. Tracks Query
    const {
        data: tracks = [],
        isLoading: isLoadingTracks,
        isFetching: isFetchingTracks,
        isError: isTracksError,
        error: tracksError,
        refetch: refetchTracks,
    } = useQuery({
        queryKey: ['tracks', 'listen-now'],
        queryFn: getTracks,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // 2. Artists Query
    const {
        data: artists = [],
        isLoading: isLoadingArtists,
        isFetching: isFetchingArtists,
        isError: isArtistsError,
        error: artistsError,
        refetch: refetchArtists,
    } = useQuery({
        queryKey: ['artists', 'popular'],
        queryFn: getArtists,
        staleTime: 1000 * 60 * 10, // 10 minutes
    });

    // 3. Friends Query
    const {
        data: friendsActivity = [],
        isLoading: isLoadingFriends,
        isError: isFriendsError,
    } = useQuery({
        queryKey: ['friends', 'activity'],
        queryFn: getFriendsActivity,
        enabled: isLoggedIn,
        retry: 1,
    });

    return (
        <>
            <MusicSectionWrapper spacing="top-only">
                {isLoadingTracks ? (
                    <InfoSection title={t('listen_now')} isLoading={true} />
                ) : isTracksError ? (
                    <InfoSection
                        title={t('listen_now')}
                        error={tracksError}
                        action={{
                            label: t('retry'),
                            onClick: refetchTracks,
                            variant: 'secondary'
                        }}
                    />
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <TrackSection
                            title={t('listen_now')}
                            tracks={tracks}
                            onMoreClick={() => { /* TODO: Navigate to full list */ }}
                        />
                        {isFetchingTracks && !isLoadingTracks && <UpdatingIndicator />}
                    </div>
                )}
            </MusicSectionWrapper>

            <MusicSectionWrapper spacing="default">
                {isLoadingArtists ? (
                    <InfoSection title={t('popular_artists')} isLoading={true} />
                ) : isArtistsError ? (
                    <InfoSection
                        title={t('popular_artists')}
                        error={artistsError}
                        action={{
                            label: t('retry'),
                            onClick: refetchArtists,
                            variant: 'secondary'
                        }}
                    />
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <ArtistSection
                            title={t('popular_artists')}
                            artists={artists}
                            onMoreClick={() => { /* TODO: Navigate to full list */ }}
                        />
                        {isFetchingArtists && !isLoadingArtists && <UpdatingIndicator />}
                    </div>
                )}
            </MusicSectionWrapper>

            <MusicSectionWrapper spacing="default">
                {!isLoggedIn ? (
                    <InfoSection
                        title={t('from_friends')}
                        message={t('login_prompt_text')}
                        action={{
                            label: t('login_prompt_button'),
                            onClick: () => {
                                // TODO: Redirect to login page
                                console.log("Redirect to login...");
                            },
                            variant: 'primary'
                        }}
                    />
                ) : isLoadingFriends ? (
                    <InfoSection title={t('from_friends')} isLoading={true} />
                ) : isFriendsError ? (
                    <InfoSection
                        title={t('from_friends')}
                        message={t('error_loading_friends')}
                    />
                ) : friendsActivity.length > 0 ? (
                    <TrackSection
                        title={t('from_friends')}
                        tracks={friendsActivity}
                        onMoreClick={() => { /* TODO: Navigate to friends page */ }}
                    />
                ) : (
                    <InfoSection
                        title={t('from_friends')}
                        message={t('empty_state_message')}
                    />
                )}
            </MusicSectionWrapper>
        </>
    );
}