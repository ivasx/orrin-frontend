import React, { useRef, useCallback, useEffect, useState } from 'react';
import { Volume2, Volume1, VolumeX } from 'lucide-react';
import { useAudioCore } from '../../../context/AudioCoreContext.jsx';

import './VolumeControls.css';
import './BottomPlayer.css';

export default function VolumeControls() {
    const { volume, isMuted, toggleMute, updateVolume } = useAudioCore();
    const volumeBarRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const calculateVolume = (event) => {
        if (!volumeBarRef.current) return volume;

        const rect = volumeBarRef.current.getBoundingClientRect();
        const clientX = event.clientX ?? event.touches?.[0]?.clientX;
        if (clientX === undefined) return volume;

        const offsetX = clientX - rect.left;
        const width = rect.width;
        const newVolume = Math.max(0, Math.min(1, offsetX / width));
        return newVolume;
    };

    const handleMouseDown = useCallback((e) => {
        setIsDragging(true);
        const newVolume = calculateVolume(e.nativeEvent);
        updateVolume(newVolume);
    }, [updateVolume]);

    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return
        e.preventDefault();
        const newVolume = calculateVolume(e);
        updateVolume(newVolume);
    }, [isDragging, updateVolume]);

    const handleMouseUp = useCallback(() => {
        if (isDragging) {
            setIsDragging(false);
        }
    }, [isDragging]);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('touchmove', handleMouseMove, { passive: false });
            document.addEventListener('touchend', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleMouseMove);
            document.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);


    const getVolumeIcon = () => {
        if (isMuted || volume === 0) return <VolumeX size={20} />;
        if (volume < 0.5) return <Volume1 size={20} />;
        return <Volume2 size={20} />;
    };

    const volumePercent = (isMuted ? 0 : volume) * 100;

    return (
        <div className="volume-wrapper">
            <button
                className="control-btn volume-icon-btn"
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute" : "Mute"}
            >
                {getVolumeIcon()}
            </button>
            <div
                className="progress-container volume-container"
                ref={volumeBarRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
            >
                <div className="progress-track volume-track">
                    <div
                        className="progress-bar volume-bar"
                        style={{ width: `${volumePercent}%` }}
                    />
                </div>
            </div>
        </div>
    );
}