/**
 * Хук для управління режимами повтору
 * Відповідає за: repeatMode (off/all/one), hasRepeatedOnce (для 'one' режиму)
 */
import { useState, useCallback } from 'react';

export function useRepeatMode() {
    const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'all', 'one'
    const [hasRepeatedOnce, setHasRepeatedOnce] = useState(false);

    const toggleRepeat = useCallback(() => {
        setRepeatMode(prev => {
            const nextMode = prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off';

            // Скидаємо лічильник, якщо виходимо з режиму 'one'
            if (nextMode !== 'one') {
                setHasRepeatedOnce(false);
            }

            console.log(`Toggling repeat mode from ${prev} to ${nextMode}`);
            return nextMode;
        });
    }, []);

    const resetRepeatOnce = useCallback(() => {
        setHasRepeatedOnce(false);
    }, []);

    return {
        repeatMode,
        hasRepeatedOnce,
        setHasRepeatedOnce,
        toggleRepeat,
        resetRepeatOnce
    };
}