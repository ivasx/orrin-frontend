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
    const [originalQueue, setOriginalQueue] = useState([]); // Для повернення після вимкнення shuffle


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
            if (prev.some(t => t.trackId === track.trackId)) {
                return prev; // Вже є
            }
            const newQueue = [...prev, track];
            if (!isShuffled) {
                setOriginalQueue(newQueue);
            }
            if (prev.length === 0) {
                setCurrentIndex(0);
            }
            return newQueue;
        });
    }, [isShuffled]);

    const removeFromQueue = useCallback((indexToRemove) => {
        let trackIdToRemove = null;
        let nextIndex = currentIndex;

        setQueue(prevQueue => {
            if (indexToRemove < 0 || indexToRemove >= prevQueue.length) return prevQueue;

            trackIdToRemove = prevQueue[indexToRemove].trackId;
            const newQueue = prevQueue.filter((_, i) => i !== indexToRemove);

            if (indexToRemove < currentIndex) {
                nextIndex = currentIndex - 1;
            } else if (indexToRemove === currentIndex) {
                if (newQueue.length === 0) {
                    nextIndex = -1;
                } else if (currentIndex >= newQueue.length) {
                    nextIndex = newQueue.length - 1;
                }
            }


            if (!isShuffled && trackIdToRemove) {
                setOriginalQueue(oq => oq.filter(track => track.trackId !== trackIdToRemove));
            }

            return newQueue;
        });
        setCurrentIndex(nextIndex);

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
        } else {
            return (currentIndex + 1) % queue.length;
        }
    }, [queue, currentIndex, isShuffled]);

    const getPreviousIndex = useCallback((forceRewindToStart = false) => {
        if (queue.length === 0) return -1;

        if (isShuffled) {
            if (queue.length === 1) return 0;
            let prevIndex;
            do {
                prevIndex = Math.floor(Math.random() * queue.length);
            } while (prevIndex === currentIndex);
            return prevIndex;
        } else {
            return currentIndex > 0 ? currentIndex - 1 : queue.length - 1;
        }
    }, [queue, currentIndex, isShuffled]);


    const toggleShuffle = useCallback(() => {
        setIsShuffled(prevShuffled => {
            const currentlyShuffled = !prevShuffled;
            if (currentlyShuffled) {
                const currentTrackId = queue[currentIndex]?.trackId;
                const shuffledQueue = [...originalQueue].sort(() => Math.random() - 0.5);
                setQueue(shuffledQueue);
                setCurrentIndex(findTrackIndex(currentTrackId, shuffledQueue));
            } else {
                const currentTrackId = queue[currentIndex]?.trackId;
                setQueue(originalQueue);
                setCurrentIndex(findTrackIndex(currentTrackId, originalQueue));
            }
            return currentlyShuffled;
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
        getNextIndex,
        getPreviousIndex,
        setCurrentIndex,
        toggleShuffle,
    }), [queue, currentIndex, isShuffled, initializeQueue, addToQueue, removeFromQueue, clearQueue, getNextIndex, getPreviousIndex, toggleShuffle]);

    return (
        <QueueContext.Provider value={value}>
            {children}
        </QueueContext.Provider>
    );
};