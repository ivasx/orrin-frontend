import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import TrackSection from '../../components/Shared/TrackSection/TrackSection.jsx';
import ArtistSection from '../../components/Shared/ArtistSection/ArtistSection.jsx';
import MusicSectionWrapper from "../../components/Shared/MusicSectionWrapper/MusicSectionWrapper.jsx";
import InfoSection from '../../components/Shared/InfoSection/InfoSection.jsx';
import Spinner from '../../components/UI/Spinner/Spinner.jsx';
import { useAuth } from '../../context/AuthContext';
import {
    useTracksQuery,
    useArtistsQuery,
    useFriendsActivityQuery
} from '../../hooks/queries/useMusicQueries';
import styles from './HomePage.module.css';

const UpdatingIndicator = () => (
    <div className={styles.updatingIndicator}>
        <div className={styles.spinnerContainer}>
            <Spinner />
        </div>
    </div>
);

export default function HomePage() {
    const { t } = useTranslation();
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();

    const {
        data: tracks = [],
        isLoading: isLoadingTracks,
        isFetching: isFetchingTracks,
        isError: isTracksError,
        error: tracksError,
        refetch: refetchTracks,
    } = useTracksQuery();

    const {
        data: artists = [],
        isLoading: isLoadingArtists,
        isFetching: isFetchingArtists,
        isError: isArtistsError,
        error: artistsError,
        refetch: refetchArtists,
    } = useArtistsQuery();

    const {
        data: friendsActivity = [],
        isLoading: isLoadingFriends,
        isError: isFriendsError,
    } = useFriendsActivityQuery(isLoggedIn);

    const handleNavigateToLogin = () => {
        navigate('/login');
    };

    const handleNavigateToList = (path) => {
        navigate(path);
    };

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
                    <div className={styles.sectionHeaderWrapper}>
                        <TrackSection
                            title={t('listen_now')}
                            tracks={tracks}
                            onMoreClick={() => handleNavigateToList('/tracks')}
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
                    <div className={styles.sectionHeaderWrapper}>
                        <ArtistSection
                            title={t('popular_artists')}
                            artists={artists}
                            onMoreClick={() => handleNavigateToList('/artists')}
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
                            onClick: handleNavigateToLogin,
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
                        onMoreClick={() => handleNavigateToList('/friends')}
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