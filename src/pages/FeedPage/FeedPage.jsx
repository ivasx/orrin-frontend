import { useTranslation } from "react-i18next";
import { useQuery } from '@tanstack/react-query';
import { getTracks } from '../../services/api';
import TrackSection from '../../components/TrackSection/TrackSection.jsx';
import MusicSectionWrapper from '../../components/MusicSectionWrapper/MusicSectionWrapper.jsx';
import SectionSkeleton from '../../components/SectionSkeleton/SectionSkeleton.jsx';


export default function FeedPage() {
    const {t} = useTranslation();

    const {
        data: tracks,
        isLoading,
        isError,
        error,
        refetch
    } = useQuery({
        queryKey: ['tracks', 'feed'],
        queryFn: getTracks,
    });

    // --- ОБРОБКА СТАНІВ ЗАВАНТАЖЕННЯ ---
    if (isLoading) {
        return (
            <MusicSectionWrapper spacing="top-only">
                <SectionSkeleton title={t('your_feed')} />
            </MusicSectionWrapper>
        );
    }

    if (isError) {
        return (
            <MusicSectionWrapper spacing="top-only">
                <SectionSkeleton
                    title={t('your_feed')}
                    isError={true}
                    error={error}
                    onRetry={refetch}
                />
            </MusicSectionWrapper>
        );
    }
    // --- КІНЕЦЬ ОБРОБКИ СТАНІВ ---

    return (
        <MusicSectionWrapper spacing="top-only">
            <TrackSection
                title={t('your_feed')}
                tracks={tracks || []} // Використовуємо завантажені дані
                onMoreClick={() => console.log(t('more_pressed'))}
            />
        </MusicSectionWrapper>
    );
}