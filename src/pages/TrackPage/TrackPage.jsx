import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getTrackBySlug } from '../../services/api/index.js';
import { normalizeTrackData } from '../../constants/fallbacks.js';
import { useAudioCore } from '../../context/AudioCoreContext.jsx';
import MusicLyrics from '../../components/Shared/MusicLyrics/MusicLyrics';
import InlineError from '../../components/Shared/InlineError/InlineError';
import styles from './TrackPage.module.css';

export default function TrackPage() {
    const { trackId } = useParams();
    const { t } = useTranslation();
    const { seek, playTrack, currentTrack, audioRef } = useAudioCore();

    const { data: rawTrack, isLoading, isError, error } = useQuery({
        queryKey: ['track', trackId],
        queryFn: () => getTrackBySlug(trackId),
        enabled: !!trackId,
    });

    const track = rawTrack ? normalizeTrackData(rawTrack) : null;

    const [currentTime, setCurrentTime] = useState(0);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const onTimeUpdate = () => setCurrentTime(audio.currentTime);
        audio.addEventListener('timeupdate', onTimeUpdate);
        return () => audio.removeEventListener('timeupdate', onTimeUpdate);
    }, [audioRef]);

    const handleLineClick = useCallback((time) => {
        if (!track) return;

        if (currentTrack?.trackId !== track.trackId) {
            playTrack(track);
            const audio = audioRef.current;
            const doSeek = () => seek(time);
            if (audio && audio.readyState >= 1) {
                doSeek();
            } else {
                audio?.addEventListener('loadedmetadata', doSeek, { once: true });
            }
        } else {
            seek(time);
        }
    }, [seek, playTrack, track, currentTrack, audioRef]);

    if (isLoading) {
        return (
            <div className={styles.page}>
                <div style={{ color: 'white', padding: '50px' }}>Loading...</div>
            </div>
        );
    }

    if (isError || !track) {
        return (
            <div className={styles.page}>
                <InlineError
                    error={error}
                    title={t('error_loading_track')}
                    defaultMessage={t('track_not_found')}
                />
            </div>
        );
    }

    const isThisTrackActive = currentTrack?.trackId === track.trackId;

    return (
        <div className={styles.page}>
            <div className={styles.contentWrapper}>
                <div className={styles.infoSide}>
                    <div className={styles.coverContainer}>
                        <img
                            src={track.cover}
                            alt={track.title}
                            className={styles.cover}
                        />
                    </div>

                    <div className={styles.metadata}>
                        <h1 className={styles.title}>{track.title}</h1>

                        <div className={styles.artistRow}>
                            {track.artistSlug ? (
                                <Link to={`/artist/${track.artistSlug}`}>
                                    {track.artist}
                                </Link>
                            ) : (
                                <span>{track.artist}</span>
                            )}
                        </div>

                        <div className={styles.metaExtra}>
                            <span>{track.durationFormatted || track.duration_formatted}</span>
                        </div>
                    </div>
                </div>

                <div className={styles.lyricsSide}>
                    <MusicLyrics
                        lyricsData={track.lyrics}
                        currentTime={isThisTrackActive ? currentTime : 0}
                        onLineClick={handleLineClick}
                    />
                </div>
            </div>
        </div>
    );
}