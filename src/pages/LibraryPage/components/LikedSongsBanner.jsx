import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Music2 } from 'lucide-react';
import Button from '../../../components/UI/Button/Button.jsx';
import { useAudioCore } from '../../../context/AudioCoreContext.jsx';
import styles from '../LibraryPage.module.css';

export default function LikedSongsBanner({ tracks, isLoading }) {
    const { t } = useTranslation();
    const { playTrack } = useAudioCore();

    const handlePlay = useCallback(() => {
        if (tracks && tracks.length > 0) {
            playTrack(tracks[0], tracks);
        }
    }, [tracks, playTrack]);

    const coverGrid = tracks?.slice(0, 4) ?? [];

    return (
        <div className={styles.hero}>
            <div className={styles.heroCoverGrid}>
                {isLoading ? (
                    <div className={styles.heroCoverPlaceholder}>
                        <Music2 size={40} className={styles.heroCoverIcon} />
                    </div>
                ) : coverGrid.length > 0 ? (
                    <div className={styles.heroCoverMosaic}>
                        {coverGrid.map((track, i) => (
                            <img
                                key={track.trackId || i}
                                src={track.cover}
                                alt={track.title}
                                className={styles.heroCoverTile}
                            />
                        ))}
                        {coverGrid.length < 4 && Array.from({ length: 4 - coverGrid.length }).map((_, i) => (
                            <div key={`blank-${i}`} className={styles.heroCoverBlank} />
                        ))}
                    </div>
                ) : (
                    <div className={styles.heroCoverPlaceholder}>
                        <Music2 size={40} className={styles.heroCoverIcon} />
                    </div>
                )}
            </div>

            <div className={styles.heroContent}>
                <div className={styles.heroMeta}>
                    <span className={styles.heroEyebrow}>{t('playlist')}</span>
                    <h1 className={styles.heroTitle}>{t('liked_songs')}</h1>
                    {!isLoading && (
                        <p className={styles.heroSubtitle}>
                            {tracks?.length ?? 0} {t('tracks')}
                        </p>
                    )}
                </div>

                <Button
                    variant="primary"
                    onClick={handlePlay}
                    disabled={isLoading || !tracks?.length}
                    icon={<Play size={18} fill="currentColor" />}
                >
                    {t('play')}
                </Button>
            </div>
        </div>
    );
}