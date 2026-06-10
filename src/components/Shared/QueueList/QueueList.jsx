import {memo, useRef, useState, useCallback} from 'react';
import {ListMusic, GripVertical} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {useQueue} from '../../../context/QueueContext.jsx';
import TrackCard from '../TrackCard/TrackCard.jsx';
import styles from './QueueList.module.css';

function QueueList({title, maxItems = Infinity, className = ''}) {
    const {t} = useTranslation();
    const {queue, currentIndex, reorderQueue, removeFromQueue} = useQueue();

    const dragSourceIndexRef = useRef(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [dropPosition, setDropPosition] = useState(null);

    const upcomingTracks = currentIndex >= 0 ? queue.slice(currentIndex + 1) : queue;
    const visibleTracks = isFinite(maxItems) ? upcomingTracks.slice(0, maxItems) : upcomingTracks;

    const toQueueIndex = useCallback(
        (upcomingIdx) => upcomingIdx + (currentIndex >= 0 ? currentIndex + 1 : 0),
        [currentIndex],
    );

    const handleDragStart = useCallback(
        (e, upcomingIdx) => {
            dragSourceIndexRef.current = toQueueIndex(upcomingIdx);
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', String(dragSourceIndexRef.current));
        },
        [toQueueIndex],
    );

    const handleDragOver = useCallback(
        (e, upcomingIdx) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';

            const targetQueueIdx = toQueueIndex(upcomingIdx);
            if (dragSourceIndexRef.current === targetQueueIdx) {
                setDragOverIndex(null);
                setDropPosition(null);
                return;
            }

            const rect = e.currentTarget.getBoundingClientRect();
            setDragOverIndex(upcomingIdx);
            setDropPosition(e.clientY < rect.top + rect.height / 2 ? 'top' : 'bottom');
        },
        [toQueueIndex],
    );

    const handleDrop = useCallback(
        (e, upcomingIdx) => {
            e.preventDefault();

            const sourceQueueIdx = dragSourceIndexRef.current;
            if (sourceQueueIdx == null) return;

            const targetQueueIdx = toQueueIndex(upcomingIdx);
            if (sourceQueueIdx === targetQueueIdx) return;

            const rect = e.currentTarget.getBoundingClientRect();
            const insertAfter = e.clientY >= rect.top + rect.height / 2;
            const adjustedTarget = insertAfter
                ? Math.min(targetQueueIdx + 1, queue.length - 1)
                : targetQueueIdx;

            reorderQueue(sourceQueueIdx, adjustedTarget);
        },
        [toQueueIndex, reorderQueue, queue.length],
    );

    const handleDragEnd = useCallback(() => {
        dragSourceIndexRef.current = null;
        setDragOverIndex(null);
        setDropPosition(null);
    }, []);

    return (
        <div className={`${styles.root} ${className}`}>
            <div className={styles.header}>
                <h3 className={styles.heading}>{title ?? t('queue_next_up')}</h3>
                {upcomingTracks.length > 0 && (
                    <span className={styles.count}>
                        {t('queue_track_count', {count: upcomingTracks.length})}
                    </span>
                )}
            </div>

            {visibleTracks.length === 0 ? (
                <EmptyState/>
            ) : (
                <ol className={styles.list} aria-label={t('queue_upcoming_tracks')}>
                    {visibleTracks.map((track, upcomingIdx) => {
                        const queueIdx = toQueueIndex(upcomingIdx);
                        const isDragging = dragSourceIndexRef.current === queueIdx;
                        const isOver = dragOverIndex === upcomingIdx;

                        return (
                            <li
                                key={`${track.trackId}-${queueIdx}`}
                                className={[
                                    styles.item,
                                    isDragging ? styles.itemDragging : '',
                                    isOver && dropPosition === 'top' ? styles.itemDropTop : '',
                                    isOver && dropPosition === 'bottom' ? styles.itemDropBottom : '',
                                ]
                                    .filter(Boolean)
                                    .join(' ')}
                                draggable
                                onDragStart={(e) => handleDragStart(e, upcomingIdx)}
                                onDragOver={(e) => handleDragOver(e, upcomingIdx)}
                                onDrop={(e) => handleDrop(e, upcomingIdx)}
                                onDragEnd={handleDragEnd}
                                aria-roledescription={t('queue_sortable_item')}
                            >
                                <span
                                    className={styles.dragHandle}
                                    aria-hidden="true"
                                    title={t('queue_drag_to_reorder')}
                                >
                                    <GripVertical size={16}/>
                                </span>

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

function EmptyState() {
    const {t} = useTranslation();

    return (
        <div className={styles.emptyState}>
            <ListMusic size={36} className={styles.emptyIcon} aria-hidden="true"/>
            <p className={styles.emptyTitle}>{t('queue_empty_title')}</p>
            <p className={styles.emptySubtitle}>{t('queue_empty_subtitle')}</p>
        </div>
    );
}

export default memo(QueueList);