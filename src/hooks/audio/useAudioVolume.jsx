/**
 * Hook for controlling audio volume
 * Responsible for: volume, mute, synchronization with audio element
 */
import { useState, useCallback, useEffect } from 'react';

export function useAudioVolume(audioRef) {
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.volume = volume;
        audio.muted = isMuted;
    }, [volume, isMuted, audioRef]);

    const updateVolume = useCallback((newVolume) => {
        const clampedVolume = Math.max(0, Math.min(1, newVolume));
        setVolume(clampedVolume);

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