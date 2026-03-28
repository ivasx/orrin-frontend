import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const QueueContext = createContext();

export const useQueue = () => {
    const context = useContext(QueueContext);
    if (!context) {
        throw new Error('useQueue must be used within a QueueProvider');
    }
    return context;
};

export const QueueProvider = ({ children }) => {
    const [queue, setQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [isShuffled, setIsShuffled] = useState(false);
    const [originalQueue, setOriginalQueue] = useState([]);

    const findTrackIndex = useCallback((trackId, currentQueue) => {
        return currentQueue.findIndex(track => track.trackId === trackId);
    }, []);

    const initializeQueue = useCallback((trackList, currentTrackId) => {
        const newQueue = Array.isArray(trackList) ? [...trackList] : [];
        const index = findTrackIndex(currentTrackId, newQueue);

        setQueue(newQueue);
        setCurrentIndex(index >= 0 ? index : -1);
        setOriginalQueue(newQueue);
        setIsShuffled(false);
    }, [findTrackIndex]);

    const addToQueue = useCallback((track) => {
        setQueue(prev => {
            if (prev.some(t => t.trackId === track.trackId)) return prev;
            const newQueue = [...prev, track];
            if (!isShuffled) setOriginalQueue(newQueue);
            if (prev.length === 0) setCurrentIndex(0);
            return newQueue;
        });
    }, [isShuffled]);

    /**
     * Reorders a track in the upcoming portion of the queue without
     * disturbing the currently playing track or any track before it.
     * Both indices are relative to the full queue array.
     *
     * @param {number} sourceIndex      - Full-queue index of the dragged track.
     * @param {number} destinationIndex - Full-queue index of the drop target.
     */
    const reorderQueue = useCallback((sourceIndex, destinationIndex) => {
        setQueue(prev => {
            // Guard: do not move a track that has already played or is playing.
            if (
                sourceIndex <= currentIndex ||
                destinationIndex <= currentIndex ||
                sourceIndex === destinationIndex ||
                sourceIndex < 0 ||
                destinationIndex < 0 ||
                sourceIndex >= prev.length ||
                destinationIndex >= prev.length
            ) {
                return prev;
            }

            const next = [...prev];
            const [moved] = next.splice(sourceIndex, 1);
            next.splice(destinationIndex, 0, moved);
            return next;
        });
    }, [currentIndex]);

    /**
     * Removes a specific track from the queue by its queue index.
     * The currently playing track cannot be removed.
     *
     * @param {string} trackId       - ID of the track to remove (used for originalQueue sync).
     * @param {number} indexInQueue  - Full-queue index of the track to remove.
     */
    const removeFromQueue = useCallback((trackId, indexInQueue) => {
        setQueue(prevQueue => {
            // Prevent removing the currently playing track.
            if (indexInQueue === currentIndex || indexInQueue < 0 || indexInQueue >= prevQueue.length) {
                return prevQueue;
            }

            const newQueue = prevQueue.filter((_, i) => i !== indexInQueue);

            // Adjust currentIndex if the removed track was before the playing track.
            if (indexInQueue < currentIndex) {
                setCurrentIndex(ci => ci - 1);
            }

            if (!isShuffled) {
                setOriginalQueue(oq => oq.filter(t => t.trackId !== trackId));
            }

            return newQueue;
        });
    }, [currentIndex, isShuffled]);

    /**
     * Inserts a track immediately after the currently playing track.
     * If the track is already in the queue, it is moved to the "play next" slot.
     *
     * @param {track} track - Normalized track object to insert.
     */
    const insertNext = useCallback((track) => {
        setQueue(prev => {
            const insertAt = currentIndex + 1;

            // Remove any existing occurrence to avoid duplicates.
            const filtered = prev.filter(t => t.trackId !== track.trackId);

            // Recalculate insertAt after potential removal of a preceding occurrence.
            const existingBefore = prev.findIndex(t => t.trackId === track.trackId);
            const adjustedInsertAt = existingBefore !== -1 && existingBefore < insertAt
                ? insertAt - 1
                : insertAt;

            const next = [...filtered];
            next.splice(adjustedInsertAt, 0, track);

            if (!isShuffled) setOriginalQueue(next);
            return next;
        });
    }, [currentIndex, isShuffled]);

    const clearQueue = useCallback(() => {
        setQueue([]);
        setCurrentIndex(-1);
        setOriginalQueue([]);
        setIsShuffled(false);
    }, []);

    const getNextIndex = useCallback(() => {
        if (queue.length === 0) return -1;
        if (isShuffled) {
            if (queue.length === 1) return 0;
            let nextIndex;
            do {
                nextIndex = Math.floor(Math.random() * queue.length);
            } while (nextIndex === currentIndex);
            return nextIndex;
        }
        return (currentIndex + 1) % queue.length;
    }, [queue, currentIndex, isShuffled]);

    const getPreviousIndex = useCallback(() => {
        if (queue.length === 0) return -1;
        if (isShuffled) {
            if (queue.length === 1) return 0;
            let prevIndex;
            do {
                prevIndex = Math.floor(Math.random() * queue.length);
            } while (prevIndex === currentIndex);
            return prevIndex;
        }
        return currentIndex > 0 ? currentIndex - 1 : queue.length - 1;
    }, [queue, currentIndex, isShuffled]);

    const toggleShuffle = useCallback(() => {
        setIsShuffled(prevShuffled => {
            const nowShuffled = !prevShuffled;
            if (nowShuffled) {
                const currentTrackId = queue[currentIndex]?.trackId;
                const shuffledQueue = [...originalQueue].sort(() => Math.random() - 0.5);
                setQueue(shuffledQueue);
                setCurrentIndex(findTrackIndex(currentTrackId, shuffledQueue));
            } else {
                const currentTrackId = queue[currentIndex]?.trackId;
                setQueue(originalQueue);
                setCurrentIndex(findTrackIndex(currentTrackId, originalQueue));
            }
            return nowShuffled;
        });
    }, [queue, currentIndex, originalQueue, findTrackIndex]);

    const value = useMemo(() => ({
        queue,
        currentIndex,
        currentTrack: queue[currentIndex] ?? null,
        isShuffled,
        initializeQueue,
        addToQueue,
        removeFromQueue,
        clearQueue,
        reorderQueue,
        insertNext,
        getNextIndex,
        getPreviousIndex,
        setCurrentIndex,
        toggleShuffle,
    }), [
        queue,
        currentIndex,
        isShuffled,
        initializeQueue,
        addToQueue,
        removeFromQueue,
        clearQueue,
        reorderQueue,
        insertNext,
        getNextIndex,
        getPreviousIndex,
        toggleShuffle,
    ]);

    return (
        <QueueContext.Provider value={value}>
            {children}
        </QueueContext.Provider>
    );
};