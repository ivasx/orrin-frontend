import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getTrackBySlug } from '../../services/api';
import { normalizeTrackData } from '../../constants/fallbacks.js';
import MusicLyrics from '../../components/Shared/MusicLyrics/MusicLyrics';
import InlineError from '../../components/Shared/InlineError/InlineError';
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

    const handleLineClick = (time) => {
        // TODO: Implement seek functionality
    };

    if (isLoading) {
        return (
            <div className="track-page">
                <div style={{color: 'white', padding: '50px'}}>Loading...</div>
            </div>
        );
    }

    if (isError || !track) {
        return (
            <div className="track-page">
                <InlineError
                    error={error}
                    title={t('error_loading_track')}
                    defaultMessage={t('track_not_found')}
                />
            </div>
        );
    }

    return (
        <div className="track-page">
            <div className="track-page-content-wrapper">
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