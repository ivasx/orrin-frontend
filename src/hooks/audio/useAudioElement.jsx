/**
 * Hook for controlling HTML <audio> element
 * Responsible for: updating src when changing track, updating loop attribute
 */
import { useRef, useEffect } from 'react';

export function useAudioElement(trackFromQueue, repeatMode) {
    const audioRef = useRef(null);
    const prevTrackIdRef = useRef(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const currentTrackId = trackFromQueue?.trackId;

        if (currentTrackId !== prevTrackIdRef.current) {
            prevTrackIdRef.current = currentTrackId;

            if (trackFromQueue && audio.src !== trackFromQueue.audio) {
                console.log("Setting new src:", trackFromQueue.audio);
                audio.src = trackFromQueue.audio;
                audio.currentTime = 0;
            } else if (!trackFromQueue && audio.src) {
                console.log("Clearing src");
                audio.pause();
                audio.removeAttribute('src');
                audio.load();
                audio.currentTime = 0;
            }
        }
    }, [trackFromQueue]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const shouldLoop = repeatMode === 'all';
        if (audio.loop !== shouldLoop) {
            console.log(`Setting audio loop attribute to: ${shouldLoop}`);
            audio.loop = shouldLoop;
        }
    }, [repeatMode]);

    return audioRef;
}