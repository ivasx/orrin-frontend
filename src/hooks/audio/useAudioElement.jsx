/**
 * Hook for controlling HTML <audio> element
 * Responsible for: updating src when changing track, updating loop attribute
 */
import { useRef, useEffect } from 'react';
import { logger } from '../../utils/logger';

export function useAudioElement(trackFromQueue, repeatMode) {
    const audioRef = useRef(null);
    const prevTrackIdRef = useRef(null);

    // Initialize audio element once
    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.preload = 'auto';
            logger.info('[AudioCore] Audio DOM element created in memory');
        }
    }, []);

    // Handle track source changes
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const currentTrackId = trackFromQueue?.trackId;

        if (currentTrackId !== prevTrackIdRef.current) {
            prevTrackIdRef.current = currentTrackId;

            if (trackFromQueue && audio.src !== trackFromQueue.audio) {
                logger.info('[AudioCore] Setting new src:', trackFromQueue.audio);
                // Prevent AbortError by explicitly pausing and clearing buffer before new load
                audio.pause();
                audio.removeAttribute('src');
                audio.load();

                audio.src = trackFromQueue.audio;
                audio.load();
                audio.currentTime = 0;
            } else if (!trackFromQueue && audio.src) {
                logger.info('[AudioCore] Clearing src');
                audio.pause();
                audio.removeAttribute('src');
                audio.load();
            }
        }
    }, [trackFromQueue]);

    // Handle repeat mode
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const shouldLoop = repeatMode === 'all';
        if (audio.loop !== shouldLoop) {
            audio.loop = shouldLoop;
        }
    }, [repeatMode]);

    return audioRef;
}