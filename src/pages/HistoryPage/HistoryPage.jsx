import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import MusicSectionWrapper from '../../components/Shared/MusicSectionWrapper/MusicSectionWrapper.jsx';
import TrackSection from '../../components/Shared/TrackSection/TrackSection.jsx';
import SectionSkeleton from '../../components/UI/SectionSkeleton/SectionSkeleton.jsx';
import LoginPromptSection from '../../components/Shared/LoginPromptSection/LoginPromptSection.jsx';
import EmptyStateSection from '../../components/UI/EmptyStateSection/EmptyStateSection.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getUserHistory } from '../../services/api.js';
import { logger } from '../../utils/logger.js';


export default function HistoryPage() {
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
        queryKey: ['history'],
        queryFn: getUserHistory,
        enabled: isLoggedIn,
    });


    if (!isLoggedIn) {
        return (
            <MusicSectionWrapper spacing="top-only">
                <LoginPromptSection
                    title={t('listening_history')}
                    promptText={t('login_to_see_history')}
                    buttonText={t('login')}
                    onLoginClick={() => navigate('/login')}
                />
            </MusicSectionWrapper>
        );
    }

    if (isLoading) {
        return (
            <MusicSectionWrapper spacing="top-only">
                <SectionSkeleton title={t('listening_history')} />
            </MusicSectionWrapper>
        );
    }

    if (isError) {
        logger.error("History fetch error", error);
        return (
            <MusicSectionWrapper spacing="top-only">
                <SectionSkeleton
                    title={t('listening_history')}
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
                    title={t('listening_history')}
                    tracks={tracks}
                    onMoreClick={() => {
                        logger.log("Load more history");
                    }}
                />
            ) : (
                <EmptyStateSection
                    title={t('history_empty_title')}
                    description={t('history_empty_msg')}
                />
            )}
        </MusicSectionWrapper>
    );
}