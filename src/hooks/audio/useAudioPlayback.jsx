/**
 * Hook for controlling playback
 * Responsible for: isPlaying state, play/pause logic
 */
import { useState, useCallback, useEffect } from 'react';
import { logger } from '../../utils/logger';

export function useAudioPlayback(audioRef, trackFromQueue) {
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !audio.src) {
            if (isPlaying) setIsPlaying(false);
            return;
        }

        let playPromise = null;

        if (isPlaying) {
            if (audio.paused) {
                logger.log("AudioCore: Attempting to play");
                playPromise = audio.play();
            }
        } else {
            if (!audio.paused) {
                logger.log("AudioCore: Pausing");
                audio.pause();
            }
        }

        if (playPromise) {
            playPromise.catch(error => {
                logger.error("Audio play error:", error);
                setIsPlaying(false);
            });
        }
    }, [isPlaying, trackFromQueue, audioRef]);

    const pause = useCallback(() => {
        setIsPlaying(false);
    }, []);

    const resume = useCallback(() => {
        if (trackFromQueue) {
            setIsPlaying(true);
        }
    }, [trackFromQueue]);

    const stop = useCallback(() => {
        setIsPlaying(false);
        const audio = audioRef.current;
        if (audio) {
            audio.pause();
            audio.removeAttribute('src');
            audio.load();
            audio.currentTime = 0;
        }
    }, [audioRef]);

    return {
        isPlaying,
        setIsPlaying,
        pause,
        resume,
        stop
    };
}