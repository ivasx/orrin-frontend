import {useEffect} from 'react';
import {logger} from '../../utils/logger';

export function useTrackEndHandler(
    audioRef,
    repeatMode,
    hasRepeatedOnce,
    setHasRepeatedOnce,
    nextTrack
) {
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTrackEnd = () => {
            logger.log('Track ended. Repeat mode:', repeatMode, 'Has repeated once:', hasRepeatedOnce);

            if (repeatMode === 'one') {
                if (!hasRepeatedOnce) {
                    setHasRepeatedOnce(true);
                    logger.log('Repeating once. Restarting playback.');
                    audio.currentTime = 0;
                    audio.play().catch((e) => logger.error('Repeat play error:', e));
                } else {
                    logger.log('Finished repeating once. Playing next.');
                    setHasRepeatedOnce(false);
                    nextTrack();
                }
                return;
            }

            nextTrack();
        };

        audio.addEventListener('ended', handleTrackEnd);
        return () => audio.removeEventListener('ended', handleTrackEnd);
    }, [repeatMode, hasRepeatedOnce, nextTrack, setHasRepeatedOnce, audioRef]);
}