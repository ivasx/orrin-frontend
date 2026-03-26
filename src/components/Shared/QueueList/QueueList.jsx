import { memo } from 'react';
import { ListMusic } from 'lucide-react';
import { useQueue } from '../../../context/QueueContext.jsx';
import TrackCard from '../TrackCard/TrackCard.jsx';
import styles from './QueueList.module.css';

/**
 * Displays the tracks scheduled to play after the current one.
 * Reads queue state from QueueContext; accepts no data props.
 *
 * @param {string}  [title="Next up"]     - Section heading override.
 * @param {number}  [maxItems=Infinity]   - Cap the number of visible tracks.
 * @param {string}  [className=""]        - Extra class for layout overrides.
 */
function QueueList({ title = 'Next up', maxItems = Infinity, className = '' }) {
    const { queue, currentIndex } = useQueue();

    const upcomingTracks = currentIndex >= 0 ? queue.slice(currentIndex + 1) : queue;
    const visibleTracks  = isFinite(maxItems) ? upcomingTracks.slice(0, maxItems) : upcomingTracks;

    return (
        <div className={`${styles.root} ${className}`}>
            <div className={styles.header}>
                <h3 className={styles.heading}>{title}</h3>
                {upcomingTracks.length > 0 && (
                    <span className={styles.count}>
                        {upcomingTracks.length} {upcomingTracks.length === 1 ? 'track' : 'tracks'}
                    </span>
                )}
            </div>

            {visibleTracks.length === 0 ? (
                <EmptyState />
            ) : (
                <ol className={styles.list} aria-label="Upcoming tracks">
                    {visibleTracks.map((track, index) => (
                        <li key={`${track.trackId}-${index}`} className={styles.item}>
                            <span className={styles.position} aria-hidden="true">
                                {currentIndex + 1 + index + 1}
                            </span>
                            <TrackCard {...track} tracks={queue} />
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
}

function EmptyState() {
    return (
        <div className={styles.emptyState}>
            <ListMusic size={36} className={styles.emptyIcon} aria-hidden="true" />
            <p className={styles.emptyTitle}>The queue is empty</p>
            <p className={styles.emptySubtitle}>
                Play a track or a collection to populate the queue.
            </p>
        </div>
    );
}

export default memo(QueueList);