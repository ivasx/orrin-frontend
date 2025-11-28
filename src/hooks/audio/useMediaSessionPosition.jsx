/**
 * Hook for updating track position in Media Session
 * Responsible for: setPositionState in system widget
 */
import { useEffect } from 'react';

export function useMediaSessionPosition(audioRef, trackFromQueue, isPlaying) {
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !('mediaSession' in navigator) || !('setPositionState' in navigator.mediaSession)) {
            return;
        }

        let intervalId = null;

        const updatePositionState = () => {
            if (isFinite(audio.duration) && audio.duration > 0 && isFinite(audio.currentTime)) {
                try {
                    navigator.mediaSession.setPositionState({
                        duration: audio.duration,
                        position: audio.currentTime,
                        playbackRate: audio.playbackRate,
                    });
                } catch (error) { /* Ignore errors */ }
            }
        };

        const startInterval = () => {
            clearInterval(intervalId);
            updatePositionState();
            intervalId = setInterval(updatePositionState, 1000);
        };

        const stopInterval = () => {
            clearInterval(intervalId);
        };

        audio.addEventListener('loadedmetadata', startInterval);
        audio.addEventListener('play', startInterval);
        audio.addEventListener('playing', startInterval);
        audio.addEventListener('pause', stopInterval);
        audio.addEventListener('seeked', updatePositionState);

        if (isPlaying && audio.duration && audio.duration > 0) {
            startInterval();
        }

        return () => {
            clearInterval(intervalId);
            audio.removeEventListener('loadedmetadata', startInterval);
            audio.removeEventListener('play', startInterval);
            audio.removeEventListener('playing', startInterval);
            audio.removeEventListener('pause', stopInterval);
            audio.removeEventListener('seeked', updatePositionState);

            try {
                if (navigator.mediaSession && navigator.mediaSession.setPositionState) {
                    navigator.mediaSession.setPositionState(null);
                }
            } catch (error) {
                // Ignore errors
            }
        };
    }, [audioRef, trackFromQueue, isPlaying]);
}