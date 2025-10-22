import React, { useRef, useCallback, useEffect, useState } from 'react';
import { Volume2, Volume1, VolumeX } from 'lucide-react';
import { useAudioPlayer } from '../../context/AudioPlayerContext.jsx';
// Важливо: Імпортуємо стилі від TimeControls ТАКОЖ, щоб перевикористати класи
import './VolumeControls.css'; // Стилі саме для VolumeControls
import '../BottomPlayer/BottomPlayer.css'; // Імпортуємо стилі плеєра для перевикористання

export default function VolumeControls() {
    const { volume, isMuted, toggleMute, updateVolume } = useAudioPlayer();
    const volumeBarRef = useRef(null); // Ref для контейнера повзунка
    const [isDragging, setIsDragging] = useState(false);

    // Функція для розрахунку гучності на основі кліку/перетягування
    const calculateVolume = (event) => {
        if (!volumeBarRef.current) return volume; // Повертаємо поточну, якщо ref ще не готовий

        const rect = volumeBarRef.current.getBoundingClientRect();
        // Визначаємо координату X кліку/дотику відносно елемента
        const clientX = event.clientX ?? event.touches?.[0]?.clientX;
        if (clientX === undefined) return volume; // Не вдалося отримати координату

        const offsetX = clientX - rect.left;
        const width = rect.width;
        // Розраховуємо гучність (від 0 до 1), обмежуючи значення
        const newVolume = Math.max(0, Math.min(1, offsetX / width));
        return newVolume;
    };

    // Обробник початку перетягування (натискання миші/дотик)
    const handleMouseDown = useCallback((e) => {
        setIsDragging(true);
        const newVolume = calculateVolume(e.nativeEvent);
        updateVolume(newVolume); // Одразу оновлюємо гучність
    }, [updateVolume]); // Немає потреби в calculateVolume у залежностях

    // Обробник руху миші/пальця ПІД ЧАС перетягування
    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;
        // Запобігаємо виділенню тексту під час перетягування
        e.preventDefault();
        const newVolume = calculateVolume(e);
        updateVolume(newVolume);
    }, [isDragging, updateVolume]); // Немає потреби в calculateVolume у залежностях

    // Обробник завершення перетягування
    const handleMouseUp = useCallback(() => {
        if (isDragging) {
            setIsDragging(false);
        }
    }, [isDragging]);

    // Додаємо та прибираємо глобальні слухачі для руху та відпускання
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('touchmove', handleMouseMove, { passive: false }); // passive: false для preventDefault
            document.addEventListener('touchend', handleMouseUp);
        }

        // Функція очищення
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleMouseMove);
            document.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);


    // Визначаємо іконку гучності
    const getVolumeIcon = () => {
        if (isMuted || volume === 0) return <VolumeX size={20} />;
        if (volume < 0.5) return <Volume1 size={20} />;
        return <Volume2 size={20} />;
    };

    // Розраховуємо відсоток заповнення для стилів
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