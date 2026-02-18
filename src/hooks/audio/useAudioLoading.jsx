/**
 * Hook for tracking audio loading state and errors
 * Responsible for: isLoading, loadError states based on audio element events
 */
import { useState, useEffect } from 'react';
import { logger } from '../../utils/logger';

export function useAudioLoading(audioRef) {
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleLoadStart = () => {
            logger.log("Audio: Load start");
            setIsLoading(true);
            setLoadError(null);
        };

        const handleCanPlay = () => {
            logger.log("Audio: Can play");
            setIsLoading(false);
            setLoadError(null);
        };

        const handleCanPlayThrough = () => {
            logger.log("Audio: Can play through");
            setIsLoading(false);
            setLoadError(null);
        };

        const handleError = (e) => {
            logger.error("Audio: Error event", e, audio.error);
            setIsLoading(false);

            let errorMessage = 'Помилка завантаження аудіо';
            let errorType = 'unknown';

            if (audio.error) {
                switch (audio.error.code) {
                    case MediaError.MEDIA_ERR_NETWORK:
                        errorMessage = 'Помилка мережі';
                        errorType = 'network';
                        break;
                    case MediaError.MEDIA_ERR_DECODE:
                        errorMessage = 'Помилка декодування';
                        errorType = 'decode';
                        break;
                    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                        errorMessage = 'Формат не підтримується';
                        errorType = 'format';
                        break;
                    case MediaError.MEDIA_ERR_ABORTED:
                        errorMessage = 'Завантаження перервано';
                        errorType = 'aborted';
                        break;
                }
            }

            setLoadError({ message: errorMessage, type: errorType });
        };

        const handleStalled = () => {
            logger.log("Audio: Stalled");
            setIsLoading(true);
        };

        const handleWaiting = () => {
            logger.log("Audio: Waiting");
            setIsLoading(true);
        };

        const handleLoadedData = () => {
            logger.log("Audio: Loaded data");
            setIsLoading(false);
        };

        audio.addEventListener('loadstart', handleLoadStart);
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('canplaythrough', handleCanPlayThrough);
        audio.addEventListener('error', handleError);
        audio.addEventListener('stalled', handleStalled);
        audio.addEventListener('waiting', handleWaiting);
        audio.addEventListener('loadeddata', handleLoadedData);

        return () => {
            audio.removeEventListener('loadstart', handleLoadStart);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('canplaythrough', handleCanPlayThrough);
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('stalled', handleStalled);
            audio.removeEventListener('waiting', handleWaiting);
            audio.removeEventListener('loadeddata', handleLoadedData);
        };
    }, [audioRef]);

    return { isLoading, loadError };
}

