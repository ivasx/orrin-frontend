import { memo, useRef, useState, useCallback } from 'react';
import { ListMusic, GripVertical } from 'lucide-react';
import { useQueue } from '../../../context/QueueContext.jsx';
import TrackCard from '../TrackCard/TrackCard.jsx';
import styles from './QueueList.module.css';

/**
 * Renders the upcoming tracks in the playback queue with native HTML5
 * drag-and-drop reordering support.
 *
 * @param {string}  [title="Next up"]   - Section heading override.
 * @param {number}  [maxItems=Infinity] - Cap the number of visible tracks.
 * @param {string}  [className=""]      - Extra class for layout overrides.
 */
function QueueList({ title = 'Next up', maxItems = Infinity, className = '' }) {
    const { queue, currentIndex, reorderQueue, removeFromQueue } = useQueue();

    /** Full-queue index of the track currently being dragged. */
    const dragSourceIndexRef = useRef(null);
    /** Full-queue index of the track the dragged item is hovering over. */
    const [dragOverIndex, setDragOverIndex] = useState(null);
    /** Side of the target the ghost is hovering on: 'top' | 'bottom'. */
    const [dropPosition, setDropPosition] = useState(null);

    const upcomingTracks = currentIndex >= 0 ? queue.slice(currentIndex + 1) : queue;
    const visibleTracks  = isFinite(maxItems) ? upcomingTracks.slice(0, maxItems) : upcomingTracks;

    /**
     * Converts a local "upcoming tracks" index back to a full-queue index.
     *
     * @param {number} upcomingIdx - Index within the upcomingTracks slice.
     * @returns {number} Full queue index.
     */
    const toQueueIndex = useCallback(
        (upcomingIdx) => upcomingIdx + (currentIndex >= 0 ? currentIndex + 1 : 0),
        [currentIndex],
    );

    const handleDragStart = useCallback((e, upcomingIdx) => {
        dragSourceIndexRef.current = toQueueIndex(upcomingIdx);
        e.dataTransfer.effectAllowed = 'move';
        // Store the index in the transfer for cross-list safety.
        e.dataTransfer.setData('text/plain', String(dragSourceIndexRef.current));
    }, [toQueueIndex]);

    const handleDragOver = useCallback((e, upcomingIdx) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        const targetQueueIdx = toQueueIndex(upcomingIdx);
        if (dragSourceIndexRef.current === targetQueueIdx) {
            setDragOverIndex(null);
            setDropPosition(null);
            return;
        }

        // Determine whether the ghost is in the upper or lower half of the item.
        const rect = e.currentTarget.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        setDragOverIndex(upcomingIdx);
        setDropPosition(e.clientY < midpoint ? 'top' : 'bottom');
    }, [toQueueIndex]);

    const handleDrop = useCallback((e, upcomingIdx) => {
        e.preventDefault();

        const sourceQueueIdx = dragSourceIndexRef.current;
        if (sourceQueueIdx == null) return;

        const targetQueueIdx = toQueueIndex(upcomingIdx);
        if (sourceQueueIdx === targetQueueIdx) return;

        // Adjust destination based on which half the ghost landed on.
        const rect = e.currentTarget.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        const insertAfter = e.clientY >= midpoint;
        const adjustedTarget = insertAfter
            ? Math.min(targetQueueIdx + 1, queue.length - 1)
            : targetQueueIdx;

        reorderQueue(sourceQueueIdx, adjustedTarget);
    }, [toQueueIndex, reorderQueue, queue.length]);

    const handleDragEnd = useCallback(() => {
        dragSourceIndexRef.current = null;
        setDragOverIndex(null);
        setDropPosition(null);
    }, []);

    return (
        <div className={`${styles.root} ${className}`}>
            <div className={styles.header}>
                <h3 className={styles.heading}>{title}</h3>
                {upcomingTracks.length > 0 && (
                    <span className={styles.count}>
                        {upcomingTracks.length}{' '}
                        {upcomingTracks.length === 1 ? 'track' : 'tracks'}
                    </span>
                )}
            </div>

            {visibleTracks.length === 0 ? (
                <EmptyState />
            ) : (
                <ol className={styles.list} aria-label="Upcoming tracks">
                    {visibleTracks.map((track, upcomingIdx) => {
                        const queueIdx = toQueueIndex(upcomingIdx);
                        const isDragging = dragSourceIndexRef.current === queueIdx;
                        const isOver    = dragOverIndex === upcomingIdx;

                        return (
                            <li
                                key={`${track.trackId}-${queueIdx}`}
                                className={[
                                    styles.item,
                                    isDragging                          ? styles.itemDragging : '',
                                    isOver && dropPosition === 'top'    ? styles.itemDropTop  : '',
                                    isOver && dropPosition === 'bottom' ? styles.itemDropBottom : '',
                                ].join(' ')}
                                draggable
                                onDragStart={(e) => handleDragStart(e, upcomingIdx)}
                                onDragOver={(e)  => handleDragOver(e, upcomingIdx)}
                                onDrop={(e)      => handleDrop(e, upcomingIdx)}
                                onDragEnd={handleDragEnd}
                                aria-roledescription="sortable item"
                            >
                                {/* Drag handle */}
                                <span
                                    className={styles.dragHandle}
                                    aria-hidden="true"
                                    title="Drag to reorder"
                                >
                                    <GripVertical size={16} />
                                </span>

                                {/* Position number */}
                                <span className={styles.position} aria-hidden="true">
                                    {currentIndex + 1 + upcomingIdx + 1}
                                </span>

                                <TrackCard
                                    {...track}
                                    tracks={queue}
                                    indexInQueue={queueIdx}
                                    isQueueContext
                                />
                            </li>
                        );
                    })}
                </ol>
            )}
        </div>
    );
}

/** Shown when the upcoming portion of the queue is empty. */
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