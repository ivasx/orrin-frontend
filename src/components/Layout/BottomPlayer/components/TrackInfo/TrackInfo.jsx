import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { useMarquee } from '../../../../../hooks/useMarquee.jsx';
import styles from './TrackInfo.module.css';

const TrackInfo = ({ track }) => {
    const titleMarquee = useMarquee(track.trackId);
    const artistMarquee = useMarquee(track.trackId);

    const renderMarquee = (text, marqueeHook, baseClassName) => {
        const containerClass = `${baseClassName} ${marqueeHook.isScrolling ? styles.scrolling : ''}`;

        return (
            <div
                ref={marqueeHook.containerRef}
                className={containerClass}
                title={text}
            >
                <div className={styles.marqueeContent} ref={marqueeHook.contentRef}>
                    <span>{text}</span>
                    {marqueeHook.isScrolling && (
                        <span aria-hidden="true" className={styles.duplicate}>
                            {text}
                        </span>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <Link to={`/track/${track.trackId}`} className={styles.coverLink}>
                <img
                    src={track.cover}
                    alt={track.title}
                    className={styles.cover}
                    loading="lazy"
                />
            </Link>

            <div className={styles.info}>
                <Link to={`/track/${track.trackId}`} className={styles.link}>
                    {renderMarquee(track.title, titleMarquee, styles.title)}
                </Link>

                {track.artistSlug ? (
                    <Link to={`/artist/${track.artistSlug}`} className={styles.artistLink}>
                        {renderMarquee(track.artist, artistMarquee, styles.artist)}
                    </Link>
                ) : (
                    renderMarquee(track.artist, artistMarquee, styles.artist)
                )}
            </div>
        </div>
    );
};

export default memo(TrackInfo);