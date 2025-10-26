/**
 * Хук для оновлення позиції треку в Media Session
 * Відповідає за: setPositionState в системному віджеті
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
                } catch (error) {
                    // Ігноруємо помилки (наприклад, якщо браузер не підтримує)
                }
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

        // Додаємо слухачів подій
        audio.addEventListener('loadedmetadata', startInterval);
        audio.addEventListener('play', startInterval);
        audio.addEventListener('playing', startInterval);
        audio.addEventListener('pause', stopInterval);
        audio.addEventListener('seeked', updatePositionState);

        // Запускаємо інтервал, якщо вже грає
        if (isPlaying && audio.duration && audio.duration > 0) {
            startInterval();
        }

        // Cleanup
        return () => {
            clearInterval(intervalId);
            audio.removeEventListener('loadedmetadata', startInterval);
            audio.removeEventListener('play', startInterval);
            audio.removeEventListener('playing', startInterval);
            audio.removeEventListener('pause', stopInterval);
            audio.removeEventListener('seeked', updatePositionState);

            // Очищаємо position state при розмонтуванні
            try {
                if (navigator.mediaSession && navigator.mediaSession.setPositionState) {
                    navigator.mediaSession.setPositionState(null);
                }
            } catch (error) {
                // Ігноруємо помилки
            }
        };
    }, [audioRef, trackFromQueue, isPlaying]);
}