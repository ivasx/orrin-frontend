import { useQuery } from '@tanstack/react-query';
import { useTranslation } from "react-i18next";
import MusicSectionWrapper from '../../components/MusicSectionWrapper/MusicSectionWrapper.jsx';
import TrackSection from '../../components/TrackSection/TrackSection.jsx';
import SectionSkeleton from '../../components/SectionSkeleton/SectionSkeleton.jsx';
import { getTracks } from '../../services/api'; // Тимчасово використовуємо getTracks

export default function FavoritesPage() {
    const { t } = useTranslation();

    // TODO: Створити окремий ендпоінт /api/v1/favorites/ на бекенді
    // Поки що використовуємо getTracks як приклад
    const {
        data: tracks,
        isLoading,
        isError,
        error,
        refetch
    } = useQuery({
        queryKey: ['favorites'],
        queryFn: getTracks, // TODO: замінити на getFavorites
        // Можна додати додаткові опції:
        // staleTime: 5 * 60 * 1000, // 5 хвилин
        // refetchOnWindowFocus: false,
    });

    return (
        <MusicSectionWrapper spacing="top-only">
            {isLoading ? (
                <SectionSkeleton title={t('favorites_tracks')} />
            ) : isError ? (
                <SectionSkeleton
                    title={t('favorites_tracks')}
                    isError={true}
                    error={error}
                    onRetry={refetch}
                />
            ) : (
                <TrackSection
                    title={t('favorites_tracks')}
                    tracks={tracks || []}
                    onMoreClick={() => console.log(t('more_pressed'))}
                />
            )}
        </MusicSectionWrapper>
    );
}