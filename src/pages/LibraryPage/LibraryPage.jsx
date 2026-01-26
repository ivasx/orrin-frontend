import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import MusicSectionWrapper from '../../components/Shared/MusicSectionWrapper/MusicSectionWrapper.jsx';
import TrackSection from '../../components/Shared/TrackSection/TrackSection.jsx';
import InfoSection from '../../components/Shared/InfoSection/InfoSection.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getUserLibrary } from '../../services/api.js';
import { logger } from '../../utils/logger.js';

export default function LibraryPage() {
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
        queryKey: ['library'],
        queryFn: getUserLibrary,
        enabled: isLoggedIn,
    });

    if (!isLoggedIn) {
        return (
            <MusicSectionWrapper spacing="top-only">
                <InfoSection
                    title={t('your_library')}
                    message={t('to_start_using_the_library_log_in')}
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
                <InfoSection title={t('your_library')} isLoading={true} />
            </MusicSectionWrapper>
        );
    }

    if (isError) {
        logger.error("Library fetch error", error);
        return (
            <MusicSectionWrapper spacing="top-only">
                <InfoSection
                    title={t('your_library')}
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
                    title={t('your_library')}
                    tracks={tracks}
                    onMoreClick={() => {
                        logger.log("Load more library tracks");
                    }}
                />
            ) : (
                <InfoSection
                    title={t('your_library')}
                    message={t('library_empty_message', 'Ваша бібліотека порожня')}
                />
            )}
        </MusicSectionWrapper>
    );
}