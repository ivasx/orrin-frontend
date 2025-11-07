// src/pages/TrackPage/TrackPage.jsx
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getTrackBySlug } from '../../services/api';
// --- 1. Імпортуємо нормалізатор ---
import { normalizeTrackData } from '../../constants/fallbacks.js';
import './TrackPage.css';

export default function TrackPage() {
    const { trackId } = useParams(); // Насправді це slug
    const { t } = useTranslation();

    const {
        // --- 2. Перейменовуємо 'track' на 'rawTrack' ---
        data: rawTrack,
        isLoading,
        isError,
        error
    } = useQuery({
        queryKey: ['track', trackId],
        queryFn: () => getTrackBySlug(trackId),
        enabled: !!trackId,
    });

    // --- 3. Нормалізуємо дані ---
    const track = rawTrack ? normalizeTrackData(rawTrack) : null;

    if (isLoading) {
        return (
            <div className="track-page">
                <div className="track-page-header">
                    <div className="track-cover-skeleton"></div>
                    <div className="track-page-info">
                        <div className="skeleton-text skeleton-title"></div>
                        <div className="skeleton-text skeleton-artist"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (isError) {
        // ... (обробка помилок залишається без змін)
        return (
            <div className="track-page">
                <div className="error-container">
                    <h2>{t('error_loading_track', 'Помилка завантаження треку')}</h2>
                    <p>{error.message}</p>
                    <Link to="/" className="back-button">
                        {t('back_to_home', 'На головну')}
                    </Link>
                </div>
            </div>
        );
    }

    // --- 4. Перевіряємо нормалізований 'track' ---
    if (!track) {
        return (
            <div className="track-page">
                <div className="error-container">
                    <h2>{t('track_not_found', 'Трек не знайдено')}</h2>
                    <Link to="/" className="back-button">
                        {t('back_to_home', 'На головну')}
                    </Link>
                </div>
            </div>
        );
    }

    // --- 5. Тепер цей JSX коректний ---
    // 'track.artist' - це рядок (ім'я)
    // 'track.artistId' - це slug або id
    return (
        <div className="track-page">
            <div className="track-page-header">
                <img
                    src={track.cover}
                    alt={track.title}
                    className="track-page-cover"
                />
                <div className="track-page-info">
                    <h1>{track.title}</h1>
                    {track.artistId ? (
                        <Link to={`/artist/${track.artistId}`}>
                            <p>{track.artist}</p>
                        </Link>
                    ) : (
                        <p>{track.artist}</p>
                    )}
                    <span>{track.duration_formatted}</span>
                </div>
            </div>
            {/* Add more track details here */}
        </div>
    );
}