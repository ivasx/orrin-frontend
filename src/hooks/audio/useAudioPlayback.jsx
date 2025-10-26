/**
 * Хук для управління відтворенням
 * Відповідає за: isPlaying стан, play/pause логіка
 */
import { useState, useCallback, useEffect } from 'react';

export function useAudioPlayback(audioRef, trackFromQueue) {
    const [isPlaying, setIsPlaying] = useState(false);

    // Керування play/pause на основі стану isPlaying
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !audio.src) {
            if (isPlaying) setIsPlaying(false);
            return;
        }

        let playPromise = null;

        if (isPlaying) {
            if (audio.paused) {
                console.log("AudioCore: Attempting to play");
                playPromise = audio.play();
            }
        } else {
            if (!audio.paused) {
                console.log("AudioCore: Pausing");
                audio.pause();
            }
        }

        if (playPromise) {
            playPromise.catch(error => {
                console.error("Audio play error:", error);
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