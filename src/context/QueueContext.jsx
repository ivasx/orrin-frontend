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


    // Встановити нову чергу і поточний трек в ній
    const initializeQueue = useCallback((trackList, currentTrackId) => {
        const newQueue = Array.isArray(trackList) ? [...trackList] : [];
        const index = findTrackIndex(currentTrackId, newQueue);

        setQueue(newQueue);
        setCurrentIndex(index >= 0 ? index : -1);
        setOriginalQueue(newQueue); // Зберігаємо оригінальний порядок
        setIsShuffled(false); // За замовчуванням вимикаємо shuffle при новій черзі
    }, [findTrackIndex]);

    // Додати трек в кінець черги
    const addToQueue = useCallback((track) => {
        setQueue(prev => {
            if (prev.some(t => t.trackId === track.trackId)) {
                return prev; // Вже є
            }
            const newQueue = [...prev, track];
            // Якщо shuffle вимкнений, додаємо також до originalQueue
            if (!isShuffled) {
                setOriginalQueue(newQueue);
            }
            // Якщо черга була порожня, встановлюємо індекс на 0
            if (prev.length === 0) {
                setCurrentIndex(0);
            }
            return newQueue;
        });
    }, [isShuffled]);

    // Видалити трек з черги за індексом
    const removeFromQueue = useCallback((indexToRemove) => {
        let trackIdToRemove = null;
        let nextIndex = currentIndex; // Спочатку припускаємо, що індекс не зміниться

        setQueue(prevQueue => {
            if (indexToRemove < 0 || indexToRemove >= prevQueue.length) return prevQueue;

            trackIdToRemove = prevQueue[indexToRemove].trackId;
            const newQueue = prevQueue.filter((_, i) => i !== indexToRemove);

            // Оновлюємо currentIndex, якщо потрібно
            if (indexToRemove < currentIndex) {
                nextIndex = currentIndex - 1; // Зсуваємо індекс назад
            } else if (indexToRemove === currentIndex) {
                // Якщо видалили поточний трек
                if (newQueue.length === 0) {
                    nextIndex = -1; // Черга порожня
                } else if (currentIndex >= newQueue.length) {
                    // Якщо видалили останній, ставимо індекс на новий останній
                    nextIndex = newQueue.length - 1;
                }
                // Інакше індекс залишається той самий (новий трек на цій позиції)
            }
            // Оновлюємо стан індексу поза setQueue, щоб уникнути race condition
            // setCurrentIndex(nextIndex); // Оновлення буде після setQueue

            // Оновлюємо originalQueue, якщо shuffle вимкнений
            if (!isShuffled && trackIdToRemove) {
                setOriginalQueue(oq => oq.filter(track => track.trackId !== trackIdToRemove));
            }

            return newQueue;
        });
        // Оновлюємо індекс після оновлення черги
        setCurrentIndex(nextIndex);

    }, [currentIndex, isShuffled]);


    // Очистити чергу
    const clearQueue = useCallback(() => {
        setQueue([]);
        setCurrentIndex(-1);
        setOriginalQueue([]);
        setIsShuffled(false);
    }, []);

    // Отримати індекс наступного треку (враховуючи shuffle та кінець списку)
    const getNextIndex = useCallback(() => {
        if (queue.length === 0) return -1;
        if (isShuffled) {
            if (queue.length === 1) return 0; // Якщо тільки один трек
            let nextIndex;
            do {
                nextIndex = Math.floor(Math.random() * queue.length);
            } while (nextIndex === currentIndex); // Не повторюємо поточний одразу
            return nextIndex;
        } else {
            return (currentIndex + 1) % queue.length; // Зациклюємо чергу
            // Якщо не потрібно зациклювати:
            // return currentIndex < queue.length - 1 ? currentIndex + 1 : -1;
        }
    }, [queue, currentIndex, isShuffled]);

    // Отримати індекс попереднього треку (враховуючи shuffle та початок списку)
    const getPreviousIndex = useCallback((forceRewindToStart = false) => {
        if (queue.length === 0) return -1;
        // Якщо грає більше 3 секунд (або є флаг), повертаємо поточний індекс (для перемотки на початок)
        // Цю логіку краще перенести в AudioCoreContext, тут лише індекси
        // if (!forceRewindToStart && audioRef.current && audioRef.current.currentTime > 3) {
        //      return currentIndex;
        // }

        if (isShuffled) {
            if (queue.length === 1) return 0;
            let prevIndex;
            do {
                prevIndex = Math.floor(Math.random() * queue.length);
            } while (prevIndex === currentIndex);
            return prevIndex;
        } else {
            // Зациклюємо: якщо перший, то переходимо на останній
            return currentIndex > 0 ? currentIndex - 1 : queue.length - 1;
            // Якщо не потрібно зациклювати:
            // return currentIndex > 0 ? currentIndex - 1 : -1;
        }
    }, [queue, currentIndex, isShuffled]);


    // Перемішати/відновити чергу
    const toggleShuffle = useCallback(() => {
        setIsShuffled(prevShuffled => {
            const currentlyShuffled = !prevShuffled;
            if (currentlyShuffled) {
                // Перемішуємо поточну чергу
                const currentTrackId = queue[currentIndex]?.trackId;
                const shuffledQueue = [...originalQueue].sort(() => Math.random() - 0.5);
                setQueue(shuffledQueue);
                // Знаходимо поточний трек у новій перемішаній черзі
                setCurrentIndex(findTrackIndex(currentTrackId, shuffledQueue));
            } else {
                // Відновлюємо оригінальний порядок
                const currentTrackId = queue[currentIndex]?.trackId;
                setQueue(originalQueue);
                // Знаходимо поточний трек в оригінальній черзі
                setCurrentIndex(findTrackIndex(currentTrackId, originalQueue));
            }
            return currentlyShuffled;
        });
    }, [queue, currentIndex, originalQueue, findTrackIndex]);


    // Надаємо значення через context
    const value = useMemo(() => ({
        queue,
        currentIndex,
        currentTrack: queue[currentIndex] ?? null, // Зручно мати поточний трек тут
        isShuffled,
        initializeQueue,
        addToQueue,
        removeFromQueue,
        clearQueue,
        getNextIndex,
        getPreviousIndex,
        setCurrentIndex, // На випадок, якщо потрібно встановити індекс вручну
        toggleShuffle,
        // Не додаємо setQueue напряму, щоб керувати через функції
    }), [queue, currentIndex, isShuffled, initializeQueue, addToQueue, removeFromQueue, clearQueue, getNextIndex, getPreviousIndex, toggleShuffle]);

    return (
        <QueueContext.Provider value={value}>
            {children}
        </QueueContext.Provider>
    );
};