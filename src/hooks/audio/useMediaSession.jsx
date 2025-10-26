/**
 * Хук для інтеграції з Media Session API
 * Відповідає за: metadata, playbackState, action handlers
 */
import { useEffect } from 'react';

export function useMediaSession(
    trackFromQueue,
    isPlaying,
    resumeTrack,
    pauseTrack,
    stopTrack,
    nextTrack,
    previousTrack
) {
    useEffect(() => {
        if (!('mediaSession' in navigator)) return;

        // Якщо немає треку, очищаємо metadata та handlers
        if (!trackFromQueue) {
            navigator.mediaSession.metadata = null;
            navigator.mediaSession.playbackState = "none";
            try {
                navigator.mediaSession.setActionHandler('play', null);
                navigator.mediaSession.setActionHandler('pause', null);
                navigator.mediaSession.setActionHandler('stop', null);
                navigator.mediaSession.setActionHandler('previoustrack', null);
                navigator.mediaSession.setActionHandler('nexttrack', null);
            } catch (error) {
                console.error("Media Session clear error:", error);
            }
            return;
        }

        // Встановлюємо metadata
        const { title, artist, cover } = trackFromQueue;
        navigator.mediaSession.metadata = new MediaMetadata({
            title: title || 'Unknown Title',
            artist: artist || 'Unknown Artist',
            album: 'Orrin',
            artwork: [
                { src: cover || '/orrin-logo.svg', sizes: '96x96',   type: 'image/png' },
                { src: cover || '/orrin-logo.svg', sizes: '128x128', type: 'image/png' },
                { src: cover || '/orrin-logo.svg', sizes: '192x192', type: 'image/png' },
                { src: cover || '/orrin-logo.svg', sizes: '256x256', type: 'image/png' },
                { src: cover || '/orrin-logo.svg', sizes: '384x384', type: 'image/png' },
                { src: cover || '/orrin-logo.svg', sizes: '512x512', type: 'image/png' },
            ]
        });

        // Встановлюємо playback state
        navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";

        // Встановлюємо action handlers
        try {
            navigator.mediaSession.setActionHandler('play', () => {
                console.log("Media Session: Play");
                resumeTrack();
            });
            navigator.mediaSession.setActionHandler('pause', () => {
                console.log("Media Session: Pause");
                pauseTrack();
            });
            navigator.mediaSession.setActionHandler('stop', () => {
                console.log("Media Session: Stop");
                stopTrack();
            });
            navigator.mediaSession.setActionHandler('previoustrack', () => {
                console.log("Media Session: Previous");
                previousTrack();
            });
            navigator.mediaSession.setActionHandler('nexttrack', () => {
                console.log("Media Session: Next");
                nextTrack();
            });
            // Вимикаємо seek handlers (можна додати пізніше)
            navigator.mediaSession.setActionHandler('seekbackward', null);
            navigator.mediaSession.setActionHandler('seekforward', null);
            navigator.mediaSession.setActionHandler('seekto', null);
        } catch (error) {
            console.error("Media Session handler error:", error);
        }

    }, [trackFromQueue, isPlaying, resumeTrack, pauseTrack, stopTrack, nextTrack, previousTrack]);
}