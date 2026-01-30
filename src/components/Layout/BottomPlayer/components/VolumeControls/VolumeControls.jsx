import React, {useRef, useCallback, useState, useEffect} from 'react';
import {Volume2, Volume1, VolumeX} from 'lucide-react';
import {useAudioCore} from '../../../../../context/AudioCoreContext.jsx';
import styles from './VolumeControls.module.css';

export default function VolumeControls() {
    const {volume, isMuted, toggleMute, updateVolume} = useAudioCore();
    const volumeBarRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const calculateVolume = (event) => {
        if (!volumeBarRef.current) return volume;
        const rect = volumeBarRef.current.getBoundingClientRect();
        const clientX = event.clientX ?? event.touches?.[0]?.clientX;
        if (clientX === undefined) return volume;
        const offsetX = clientX - rect.left;
        return Math.max(0, Math.min(1, offsetX / rect.width));
    };

    const handleInteraction = useCallback((e) => {
        const newVolume = calculateVolume(e.nativeEvent || e);
        updateVolume(newVolume);
    }, [updateVolume]);

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
            document.addEventListener('touchmove', handleMove);
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

    return (
        <div className={styles.wrapper}>
            <button className={styles.button} onClick={toggleMute} aria-label="Mute/Unmute">
                <Icon size={20}/>
            </button>
            <div
                className={styles.volumeContainer}
                ref={volumeBarRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
            >
                <div className={styles.track}>
                    <div className={styles.bar} style={{width: `${(isMuted ? 0 : volume) * 100}%`}}/>
                </div>
            </div>
        </div>
    );
}