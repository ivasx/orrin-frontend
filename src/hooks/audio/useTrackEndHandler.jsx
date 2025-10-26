// src/hooks/audio/useTrackEndHandler.js
/**
 * Хук для обробки завершення треку
 * Відповідає за: логіку 'ended' події з урахуванням repeatMode
 */
import { useEffect } from 'react';

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
            console.log("Track ended. Repeat mode:", repeatMode, "Has repeated once:", hasRepeatedOnce);

            // Якщо 'all', то audio.loop вже спрацює автоматично
            if (repeatMode === 'one') {
                if (!hasRepeatedOnce) {
                    // Перший раз закінчився: ставимо флаг, перемотуємо і запускаємо заново
                    setHasRepeatedOnce(true);
                    console.log("Repeating once. Restarting playback.");
                    audio.currentTime = 0;
                    // Явно запускаємо відтворення
                    audio.play().catch(e => console.error("Repeat play error:", e));
                } else {
                    // Другий раз закінчився: скидаємо флаг і переходимо до наступного
                    console.log("Finished repeating once. Playing next.");
                    setHasRepeatedOnce(false);
                    nextTrack();
                }
            } else if (repeatMode === 'off') {
                // Якщо повтор вимкнений, просто переходимо до наступного
                console.log("Repeat off. Playing next.");
                nextTrack();
            }
            // Якщо 'all', то нічого не робимо - loop спрацює
        };

        audio.addEventListener('ended', handleTrackEnd);
        return () => audio.removeEventListener('ended', handleTrackEnd);
    }, [repeatMode, hasRepeatedOnce, nextTrack, setHasRepeatedOnce, audioRef]);
}