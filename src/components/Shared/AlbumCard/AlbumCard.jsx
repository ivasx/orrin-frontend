import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styles from './AlbumCard.module.css';

function AlbumCard({ id, title, artist, cover, year, to }) {
    const { t } = useTranslation();
    const artistSlug = artist?.slug || artist?.id;
    const artistName = artist?.name || '';

    const inner = (
        <>
            <div className={styles.coverWrapper}>
                <img
                    src={cover}
                    alt={title}
                    className={styles.cover}
                    loading="lazy"
                />
                <div className={styles.overlay}>
                    <button
                        className={styles.playButton}
                        aria-label={t('play')}
                        tabIndex={0}
                        onClick={(e) => e.preventDefault()}
                    >
                        <Play size={22} fill="currentColor" />
                    </button>
                </div>
            </div>
            <div className={styles.info}>
                <span className={styles.title} title={title}>{title}</span>
                <span className={styles.meta}>
                    {artistSlug ? (
                        <Link
                            to={`/artist/${artistSlug}`}
                            className={styles.artistLink}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {artistName}
                        </Link>
                    ) : (
                        <span>{artistName}</span>
                    )}
                    {year && <span className={styles.year}>{year}</span>}
                </span>
            </div>
        </>
    );

    if (to) {
        return (
            <Link to={to} className={styles.cardLink}>
                {inner}
            </Link>
        );
    }

    return (
        <div className={styles.card}>
            {inner}
        </div>
    );
}

export default memo(AlbumCard);