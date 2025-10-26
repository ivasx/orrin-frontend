/**
 * Хук для управління гучністю аудіо
 * Відповідає за: volume, mute, синхронізацію з audio елементом
 */
import { useState, useCallback, useEffect } from 'react';

export function useAudioVolume(audioRef) {
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    // Синхронізація volume та muted з audio елементом
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.volume = volume;
        audio.muted = isMuted;
    }, [volume, isMuted, audioRef]);

    const updateVolume = useCallback((newVolume) => {
        const clampedVolume = Math.max(0, Math.min(1, newVolume));
        setVolume(clampedVolume);

        // Автоматично вимикаємо mute, якщо збільшуємо гучність
        if (clampedVolume > 0 && isMuted) {
            setIsMuted(false);
        }
    }, [isMuted]);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => !prev);
    }, []);

    return {
        volume,
        isMuted,
        updateVolume,
        toggleMute
    };
}