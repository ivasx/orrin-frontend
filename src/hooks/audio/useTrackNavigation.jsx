/**
 * Hook for navigating between tracks
 * Responsible for: next, previous, playTrackByIndex
 */
import { useCallback } from 'react';

export function useTrackNavigation(
    queue,
    getNextIndex,
    getPreviousIndex,
    setCurrentIndex,
    setIsPlaying,
    setHasRepeatedOnce,
    audioRef
) {
    const playTrackByIndex = useCallback((index) => {
        if (index >= 0 && index < queue.length) {
            setCurrentIndex(index);
            setIsPlaying(true);
            setHasRepeatedOnce(false);
        } else {
            console.warn(`Attempted to play track with invalid index: ${index}`);
            setIsPlaying(false);
            setCurrentIndex(-1);
        }
    }, [queue, setCurrentIndex, setIsPlaying, setHasRepeatedOnce]);

    const nextTrack = useCallback(() => {
        const nextIndex = getNextIndex();
        if (nextIndex !== -1) {
            playTrackByIndex(nextIndex);
        } else {
            setIsPlaying(false);
        }
    }, [getNextIndex, playTrackByIndex, setIsPlaying]);

    const previousTrack = useCallback(() => {
        if (audioRef.current && audioRef.current.currentTime > 3) {
            audioRef.current.currentTime = 0;
            setIsPlaying(true);
            return;
        }

        const prevIndex = getPreviousIndex();
        if (prevIndex !== -1) {
            playTrackByIndex(prevIndex);
        } else if (audioRef.current) {
            audioRef.current.currentTime = 0;
            setIsPlaying(true);
        }
    }, [getPreviousIndex, playTrackByIndex, audioRef, setIsPlaying]);

    return {
        playTrackByIndex,
        nextTrack,
        previousTrack
    };
}