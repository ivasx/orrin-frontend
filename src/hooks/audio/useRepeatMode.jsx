/**
 * Hook for controlling repeat modes
 * Responsible for: repeatMode (off/all/one), hasRepeatedOnce (for 'one' mode)
 */
import { useState, useCallback } from 'react';
import { logger } from '../../utils/logger';

export function useRepeatMode() {
    const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'all', 'one'
    const [hasRepeatedOnce, setHasRepeatedOnce] = useState(false);

    const toggleRepeat = useCallback(() => {
        setRepeatMode(prev => {
            const nextMode = prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off';

            if (nextMode !== 'one') {
                setHasRepeatedOnce(false);
            }

            logger.log(`Toggling repeat mode from ${prev} to ${nextMode}`);
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