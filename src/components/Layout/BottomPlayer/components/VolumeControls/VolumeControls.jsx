import React, { useRef, useCallback, useState, useEffect, memo } from 'react';
import { Volume2, Volume1, VolumeX } from 'lucide-react';
import { useAudioCore } from '../../../../../context/AudioCoreContext.jsx';
import styles from './VolumeControls.module.css';

const VolumeControls = () => {
    const { volume, isMuted, toggleMute, updateVolume } = useAudioCore();
    const volumeBarRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const calculateVolume = useCallback((event) => {
        if (!volumeBarRef.current) return volume;
        const rect = volumeBarRef.current.getBoundingClientRect();

        let clientX;
        if (event.type?.includes('touch') || event.touches) {
            const touch = event.touches?.[0] || event.changedTouches?.[0];
            clientX = touch?.clientX;
        } else {
            clientX = event.clientX;
        }

        if (clientX === undefined) return volume;

        const offsetX = clientX - rect.left;
        return Math.max(0, Math.min(1, offsetX / rect.width));
    }, [volume]);

    const handleInteraction = useCallback((e) => {
        const newVolume = calculateVolume(e.nativeEvent || e);
        updateVolume(newVolume);
    }, [calculateVolume, updateVolume]);

    const handleMouseDown = useCallback((e) => {
        setIsDragging(true);
        handleInteraction(e);
    }, [handleInteraction]);

    useEffect(() => {
        const handleMove = (e) => {
            if (isDragging) handleInteraction(e);
        };
        const handleUp = () => setIsDragging(false);

        if (isDragging) {
            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', handleUp);
            document.addEventListener('touchmove', handleMove, { passive: false });
            document.addEventListener('touchend', handleUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleUp);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('touchend', handleUp);
        };
    }, [isDragging, handleInteraction]);

    const Icon = isMuted || volume === 0 ? VolumeX : (volume < 0.5 ? Volume1 : Volume2);
    const currentVolumeLevel = isMuted ? 0 : volume;

    return (
        <div className={styles.wrapper}>
            <button className={styles.button} onClick={toggleMute} aria-label="Mute/Unmute">
                <Icon size={20} />
            </button>
            <div
                className={styles.volumeContainer}
                ref={volumeBarRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
            >
                <div className={styles.track}>
                    <div
                        className={styles.bar}
                        style={{ width: `${currentVolumeLevel * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default memo(VolumeControls);