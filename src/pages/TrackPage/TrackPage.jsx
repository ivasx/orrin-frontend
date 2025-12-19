import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getTrackBySlug } from '../../services/api';
import { normalizeTrackData } from '../../constants/fallbacks.js';
import MusicLyrics from '../../components/MusicLyrics/MusicLyrics';
import './TrackPage.css';

export default function TrackPage() {
    const { trackId } = useParams();
    const { t } = useTranslation();

    const {
        data: rawTrack,
        isLoading,
        isError,
        error
    } = useQuery({
        queryKey: ['track', trackId],
        queryFn: () => getTrackBySlug(trackId),
        enabled: !!trackId,
    });

    const track = rawTrack ? normalizeTrackData(rawTrack) : null;

    // --- Функція кліку по рядку (заготовка) ---
    const handleLineClick = (time) => {
        // TODO: Implement seek functionality
    };

    if (isLoading) {
        return (
            <div className="track-page">
                {/* Простий лоадер */}
                <div style={{color: 'white', padding: '50px'}}>Loading...</div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="track-page">
                <div className="error-container">
                    <h2>{t('error_loading_track', 'Помилка завантаження треку')}</h2>
                    <p>{error.message}</p>
                    <Link to="/" className="back-button">{t('back_to_home', 'На головну')}</Link>
                </div>
            </div>
        );
    }

    if (!track) {
        return (
            <div className="track-page">
                <div className="error-container">
                    <h2>{t('track_not_found', 'Трек не знайдено')}</h2>
                    <Link to="/" className="back-button">{t('back_to_home', 'На головну')}</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="track-page">
            <div className="track-page-content-wrapper">
                {/* ЛІВА ЧАСТИНА: Інфо */}
                <div className="tp-info-side">
                    <div className="tp-cover-container">
                        <img
                            src={track.cover}
                            alt={track.title}
                            className="tp-cover"
                        />
                    </div>

                    <div className="tp-metadata">
                        <h1 className="tp-title">{track.title}</h1>

                        <div className="tp-artist-row">
                            {track.artistId ? (
                                <Link to={`/artist/${track.artistId}`}>
                                    {track.artist}
                                </Link>
                            ) : (
                                <span>{track.artist}</span>
                            )}
                        </div>

                        <div className="tp-meta-extra">
                            <span>{track.duration_formatted}</span>
                        </div>
                    </div>
                </div>

                {/* ПРАВА ЧАСТИНА: Лірика */}
                <div className="tp-lyrics-side">
                    <MusicLyrics
                        lyricsData={track.lyrics}
                        currentTime={0}
                        onLineClick={handleLineClick}
                    />
                </div>
            </div>
        </div>
    );
}