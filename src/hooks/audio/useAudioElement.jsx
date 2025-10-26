/**
 * Хук для управління HTML <audio> елементом
 * Відповідає за: оновлення src при зміні треку, оновлення атрибута loop
 */
import { useRef, useEffect } from 'react';

export function useAudioElement(trackFromQueue, repeatMode) {
    const audioRef = useRef(null);
    const prevTrackIdRef = useRef(null);

    // Оновлення src ТІЛЬКИ при зміні треку
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const currentTrackId = trackFromQueue?.trackId;

        // Перевіряємо чи реально змінився трек
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

    // Окремий useEffect для оновлення loop (БЕЗ зміни src або currentTime)
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