import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import MusicSectionWrapper from '../../components/Shared/MusicSectionWrapper/MusicSectionWrapper.jsx';
import TrackSection from '../../components/Shared/TrackSection/TrackSection.jsx';
import SectionSkeleton from '../../components/UI/SectionSkeleton/SectionSkeleton.jsx';
import LoginPromptSection from "../../components/Shared/LoginPromptSection/LoginPromptSection.jsx";
import EmptyStateSection from '../../components/UI/EmptyStateSection/EmptyStateSection.jsx';
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
                <LoginPromptSection
                    title={t('favorites_tracks')}
                    promptText={t('login_to_see_favorites')}
                    buttonText={t('login')}
                    onLoginClick={() => navigate('/login')}
                />
            </MusicSectionWrapper>
        );
    }

    if (isLoading) {
        return (
            <MusicSectionWrapper spacing="top-only">
                <SectionSkeleton title={t('favorites_tracks')}/>
            </MusicSectionWrapper>
        );
    }

    if (isError) {
        logger.error("Error rendering favorites:", error);

        return (
            <MusicSectionWrapper spacing="top-only">
                <SectionSkeleton
                    title={t('favorites_tracks')}
                    isError={true}
                    onRetry={refetch}
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
                <EmptyStateSection
                    title={t('favorites_empty_title')}
                    description={t('favorites_empty_msg')}
                />
            )}
        </MusicSectionWrapper>
    );
}