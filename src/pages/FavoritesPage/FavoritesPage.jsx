import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import MusicSectionWrapper from '../../components/Shared/MusicSectionWrapper/MusicSectionWrapper.jsx';
import TrackSection from '../../components/Shared/TrackSection/TrackSection.jsx';
import InfoSection from '../../components/Shared/InfoSection/InfoSection.jsx'; // Новий універсальний компонент
import { useAuth } from '../../context/AuthContext.jsx';
import { getUserFavorites } from '../../services/api.js';
import { logger } from '../../utils/logger.js';

export default function FavoritesPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

    const {
        data: tracks = [],
        isLoading,
        isError,
        error,
        refetch
    } = useQuery({
        queryKey: ['favorites'], // unique cash key
        queryFn: getUserFavorites,
        enabled: isLoggedIn,
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
                        variant: 'primary'
                    }}
                />
            </MusicSectionWrapper>
        );
    }

    if (isLoading) {
        return (
            <MusicSectionWrapper spacing="top-only">
                <InfoSection title={t('favorites_tracks')} isLoading={true} />
            </MusicSectionWrapper>
        );
    }

    if (isError) {
        logger.error("Error rendering favorites:", error);

        return (
            <MusicSectionWrapper spacing="top-only">
                <InfoSection
                    title={t('favorites_tracks')}
                    error={error}
                    action={{
                        label: t('retry', 'Спробувати ще'),
                        onClick: refetch,
                        variant: 'outline'
                    }}
                />
            </MusicSectionWrapper>
        );
    }

    return (
        <MusicSectionWrapper spacing="top-only">
            {tracks.length > 0 ? (
                <TrackSection
                    title={t('favorites_tracks')}
                    tracks={tracks}
                    onMoreClick={() => logger.log("Load more favorites")}
                />
            ) : (
                <InfoSection
                    title={t('favorites_empty_title')}
                    message={t('favorites_empty_msg')}
                />
            )}
        </MusicSectionWrapper>
    );
}