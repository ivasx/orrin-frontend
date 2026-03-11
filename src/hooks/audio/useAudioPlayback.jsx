/**
 * Hook for controlling playback
 * Responsible for: isPlaying state, play/pause logic
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { logger } from '../../utils/logger';

export function useAudioPlayback(audioRef, trackFromQueue) {
    const [isPlaying, setIsPlaying] = useState(false);
    const playPromiseRef = useRef(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !audio.src) {
            if (isPlaying) setIsPlaying(false);
            return;
        }

        if (isPlaying) {
            if (audio.paused) {
                logger.info('[AudioCore] Attempting to play');
                playPromiseRef.current = audio.play();

                if (playPromiseRef.current !== undefined) {
                    playPromiseRef.current.catch(error => {
                        if (error.name === 'AbortError') {
                            logger.warn('[AudioCore] Playback aborted by rapid track change');
                        } else if (error.name === 'NotAllowedError') {
                            logger.error('[AudioCore] Autoplay prevented by browser requirements');
                            setIsPlaying(false);
                        } else {
                            logger.error('[AudioCore] Playback failed:', error);
                            setIsPlaying(false);
                        }
                    });
                }
            }
        } else {
            if (!audio.paused) {
                logger.info('[AudioCore] Pausing playback');
                // Ensure play promise is resolved before pausing to prevent DOM exceptions
                if (playPromiseRef.current !== undefined && playPromiseRef.current !== null) {
                    playPromiseRef.current.then(() => {
                        audio.pause();
                    }).catch(() => {
                        // Error already handled in play block
                    });
                } else {
                    audio.pause();
                }
            }
        }
    }, [isPlaying, trackFromQueue, audioRef]);

    const pause = useCallback(() => setIsPlaying(false), []);

    const resume = useCallback(() => {
        if (trackFromQueue) setIsPlaying(true);
    }, [trackFromQueue]);

    const stop = useCallback(() => {
        setIsPlaying(false);
        const audio = audioRef.current;
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    }, [audioRef]);

    return { isPlaying, setIsPlaying, pause, resume, stop };
}