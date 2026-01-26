import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import MusicSectionWrapper from '../../components/Shared/MusicSectionWrapper/MusicSectionWrapper.jsx';
import TrackSection from '../../components/Shared/TrackSection/TrackSection.jsx';
import InfoSection from '../../components/Shared/InfoSection/InfoSection.jsx';
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
                <InfoSection
                    title={t('listening_history')}
                    message={t('login_to_see_history')}
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
                <InfoSection title={t('listening_history')} isLoading={true} />
            </MusicSectionWrapper>
        );
    }

    if (isError) {
        logger.error("History fetch error", error);
        return (
            <MusicSectionWrapper spacing="top-only">
                <InfoSection
                    title={t('listening_history')}
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
                    title={t('listening_history')}
                    tracks={tracks}
                    onMoreClick={() => {
                        logger.log("Load more history");
                    }}
                />
            ) : (
                <InfoSection
                    title={t('history_empty_title')}
                    message={t('history_empty_msg')}
                />
            )}
        </MusicSectionWrapper>
    );
}