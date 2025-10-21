import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

// Створюємо сам контекст
const AudioPlayerContext = createContext();

// Хук, щоб зручно діставати плеєр де завгодно
export const useAudioPlayer = () => {
    const context = useContext(AudioPlayerContext);
    if (!context) {
        throw new Error('useAudioPlayer треба юзати всередині AudioPlayerProvider');
    }
    return context;
};

// Головний компонент-провайдер, який все огортає
export const AudioPlayerProvider = ({ children }) => {
    // ---- Стейт плеєра ----
    const [currentTrack, setCurrentTrack] = useState(null); // Який трек грає зараз
    const [isPlaying, setIsPlaying] = useState(false);     // Грає чи на паузі?
    const [queue, setQueue] = useState([]);                 // Черга треків
    const [currentIndex, setCurrentIndex] = useState(-1);   // Позиція поточного треку в черзі
    const [isShuffled, setIsShuffled] = useState(false);    // Режим перемішування
    const [repeatMode, setRepeatMode] = useState('off');    // Режим повтору ('off', 'all', 'one')
    const audioRef = useRef(null);                          // Реф на сам <audio> елемент

    // Додатковий стейт для режиму "повторити один раз" ('one')
    const [hasRepeatedOnce, setHasRepeatedOnce] = useState(false);

    // ---- Основні функції керування ----

    // Функція, щоб запустити новий трек (і скинути лічильник для 'repeat one')
    const playNewTrack = (track, index) => {
        setCurrentTrack(track);
        setCurrentIndex(index);
        setIsPlaying(true);
        // Скидаємо прапорець повтору для кожного нового треку
        setHasRepeatedOnce(false);
    };

    // Запустити конкретний трек. Якщо є список, то ставимо його як чергу.
    const playTrack = useCallback((trackData, trackList = null) => {
        let newQueue = queue;
        // Якщо передали новий список треків, робимо його поточною чергою
        if (trackList && Array.isArray(trackList)) {
            newQueue = trackList;
            setQueue(trackList);
        }

        // Шукаємо індекс треку в (можливо оновленій) черзі
        let index = newQueue.findIndex(track => track.trackId === trackData.trackId);
        // Якщо треку нема - додаємо в кінець і беремо останній індекс
        if (index === -1) {
            newQueue = [...newQueue, trackData];
            index = newQueue.length - 1;
            setQueue(newQueue);
        }

        // Запускаємо відтворення
        playNewTrack(trackData, index);
    }, [queue]); // Залежить від 'queue', бо ми її модифікуємо

    // Поставити на паузу
    const pauseTrack = useCallback(() => setIsPlaying(false), []);

    // Повністю зупинити (скинути трек і стан)
    const stopTrack = useCallback(() => {
        setCurrentTrack(null);
        setIsPlaying(false);
        setCurrentIndex(-1);
    }, []);

    // Продовжити грати, якщо є що грати
    const resumeTrack = useCallback(() => {
        if (currentTrack) setIsPlaying(true);
    }, [currentTrack]);

    // Переключити на наступний трек
    const nextTrack = useCallback(() => {
        // Якщо черга порожня - нічого не робимо
        if (queue.length === 0) return;

        let nextIndex;
        if (isShuffled) {
            // В режимі шафл - рандомний індекс
            nextIndex = Math.floor(Math.random() * queue.length);
        } else if (currentIndex < queue.length - 1) {
            // Якщо не шафл і не кінець списку - просто наступний
            nextIndex = currentIndex + 1;
        } else {
            // Якщо кінець списку і повтор вимкнений - зупиняємо
            // (Повтори обробляються в 'useEffect' нижче)
            setIsPlaying(false);
            return;
        }
        // Запускаємо наступний трек
        playNewTrack(queue[nextIndex], nextIndex);
    }, [queue, currentIndex, isShuffled]); // Залежить від черги, індексу і режиму шафл

    // ---- Обробка подій аудіо-елемента ----

    // Хук, який слідкує за завершенням треку і вирішує, що робити далі
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return; // Якщо аудіо ще не готове

        // Функція, яка спрацює, коли трек дограє до кінця
        const handleTrackEnd = () => {
            switch (repeatMode) {
                // Якщо режим 'повторювати все'
                case 'all':
                    // Просто перемотуємо на початок і граємо знову
                    audio.currentTime = 0;
                    audio.play();
                    break;

                // Якщо режим 'повторити один раз'
                case 'one':
                    if (!hasRepeatedOnce) {
                        // Якщо це перше завершення, повторюємо і ставимо прапорець
                        setHasRepeatedOnce(true);
                        audio.currentTime = 0;
                        audio.play();
                    } else {
                        // Якщо це вже друге завершення, вимикаємо режим і граємо наступний
                        setRepeatMode('off');
                        nextTrack();
                    }
                    break;

                // Якщо режим 'без повтору' (або щось незрозуміле)
                case 'off':
                default:
                    // Просто граємо наступний трек
                    nextTrack();
                    break;
            }
        };

        // Вішаємо слухач на подію 'ended'
        audio.addEventListener('ended', handleTrackEnd);
        // Прибираємо слухач, коли компонент розмонтовується або змінюються залежності
        return () => audio.removeEventListener('ended', handleTrackEnd);
        // Залежить від режиму повтору, прапорця 'hasRepeatedOnce' і функції 'nextTrack'
    }, [repeatMode, hasRepeatedOnce, nextTrack]);

    // ---- Інші функції керування ----

    // Переключити на попередній трек
    const previousTrack = useCallback(() => {
        // Якщо черга порожня - нічого
        if (queue.length === 0) return;
        // Якщо трек грає більше 3 секунд - перемотуємо на початок поточного
        if (audioRef.current && audioRef.current.currentTime > 3) {
            audioRef.current.currentTime = 0;
            return;
        }

        let prevIndex;
        if (isShuffled) {
            // В режимі шафл - рандом
            prevIndex = Math.floor(Math.random() * queue.length);
        } else if (currentIndex > 0) {
            // Якщо не шафл і не перший трек - просто попередній
            prevIndex = currentIndex - 1;
        } else {
            // Якщо це перший трек - перемотуємо на початок
            if(audioRef.current) audioRef.current.currentTime = 0;
            return;
        }

        // Запускаємо попередній трек
        playNewTrack(queue[prevIndex], prevIndex);
    }, [queue, currentIndex, isShuffled]); // Залежить від черги, індексу, шафлу

    // Запустити трек з черги за його індексом
    const playFromQueue = useCallback((index) => {
        if (index >= 0 && index < queue.length) {
            playNewTrack(queue[index], index);
        }
    }, [queue]); // Залежить від черги

    // Переключити режим повтору: off -> all -> one -> off
    const toggleRepeat = useCallback(() => {
        setRepeatMode(prev => {
            if (prev === 'off') return 'all';
            if (prev === 'all') return 'one';
            if (prev === 'one') return 'off';
            return 'off'; // Про всяк випадок
        });
    }, []);

    // Видалити трек з черги
    const removeFromQueue = useCallback((index) => {
        setQueue(prev => {
            const newQueue = prev.filter((_, i) => i !== index);
            // Якщо видалили трек перед поточним, треба зменшити currentIndex
            if (index < currentIndex) {
                setCurrentIndex(curr => curr - 1);
            } else if (index === currentIndex) {
                // Якщо видалили поточний трек
                if (newQueue.length > 0) {
                    // Якщо в черзі ще щось є, граємо наступний (або той, що став на це місце)
                    const newIndex = Math.min(currentIndex, newQueue.length - 1);
                    playNewTrack(newQueue[newIndex], newIndex);
                } else {
                    // Якщо черга стала порожньою - зупиняємо музику
                    stopTrack();
                }
            }
            return newQueue;
        });
    }, [currentIndex, stopTrack, queue]); // Залежить від індексу, stopTrack, черги

    // Очистити всю чергу
    const clearQueue = useCallback(() => {
        setQueue([]);
        stopTrack(); // І зупинити музику
    }, [stopTrack]);

    // Додати трек в кінець черги
    const addToQueue = useCallback((track) => {
        // Перевіряємо, чи такого треку ще нема в черзі (опціонально, але корисно)
        setQueue(prev => {
            if (prev.some(t => t.trackId === track.trackId)) {
                return prev; // Вже є, нічого не робимо
            }
            return [...prev, track];
        });
    }, []);

    // Включити/виключити режим перемішування
    const toggleShuffle = useCallback(() => setIsShuffled(prev => !prev), []);

    // ---- Додатковий UI стейт (гучність, панельки і т.д.) ----
    const [volume, setVolume] = useState(1); // Гучність від 0 до 1
    const [isMuted, setIsMuted] = useState(false); // Зам'ючено?
    const [isExpanded, setIsExpanded] = useState(false); // Плеєр розгорнутий? (Може бути для мобілки)
    const [showQueue, setShowQueue] = useState(false); // Показати панель черги?
    const [showTrackInfo, setShowTrackInfo] = useState(false); // Панель інфо про трек?
    const [showVolumeControl, setShowVolumeControl] = useState(false); // Панель гучності?

    // Оновити гучність
    const updateVolume = useCallback((newVolume) => {
        const clampedVolume = Math.max(0, Math.min(1, newVolume)); // Гучність має бути 0..1
        setVolume(clampedVolume);
        if (audioRef.current) {
            audioRef.current.volume = clampedVolume; // Змінюємо гучність самого <audio>
        }
        // Якщо збільшили гучність, а було зам'ючено - розм'ючуємо
        if (clampedVolume > 0 && isMuted) {
            setIsMuted(false);
            if (audioRef.current) audioRef.current.muted = false;
        }
    }, [isMuted]); // Залежить від isMuted

    // Вкл/викл м'ют
    const toggleMute = useCallback(() => {
        setIsMuted(prev => {
            const newMuted = !prev;
            if (audioRef.current) {
                audioRef.current.muted = newMuted; // Змінюємо стан <audio>
            }
            return newMuted;
        });
    }, []);

    // Перевірити, чи саме цей трек зараз грає
    const isTrackPlaying = useCallback((trackId) =>
            currentTrack?.trackId === trackId && isPlaying,
        [currentTrack, isPlaying]
    );

    // Функції для керування відображенням різних панелей плеєра
    // (Я їх згрупував, щоб було зрозуміліше)
    const expandPlayer = useCallback(() => setIsExpanded(true), []);
    const collapsePlayer = useCallback(() => { setIsExpanded(false); setShowQueue(false); setShowTrackInfo(false); setShowVolumeControl(false); }, []);
    const toggleQueue = useCallback(() => { setShowQueue(prev => !prev); setShowTrackInfo(false); setShowVolumeControl(false); }, []);
    const toggleTrackInfo = useCallback(() => { setShowTrackInfo(prev => !prev); setShowQueue(false); setShowVolumeControl(false); }, []);
    const toggleVolumeControl = useCallback(() => { setShowVolumeControl(prev => !prev); setShowQueue(false); setShowTrackInfo(false); }, []);


    // ---- Media Session API Integration ----
    // Це щоб браузер і система знали, що грає, і показували гарний віджет

    // Оновлюємо метадані (назва, обкладинка) і кнопки керування
    useEffect(() => {
        // Дивимось, чи браузер взагалі вміє в Media Session
        if (!('mediaSession' in navigator)) {
            console.log("Media Session API не підтримується");
            return;
        }

        // Якщо музика не грає, чистимо інфу
        if (!currentTrack) {
            navigator.mediaSession.metadata = null;
            navigator.mediaSession.playbackState = "none";
            // console.log("Media Session очищено");
            return;
        }

        const { title, artist, cover } = currentTrack;
        // console.log("Оновлюємо Media Session:", title, artist);

        // Записуємо інфу про трек
        navigator.mediaSession.metadata = new MediaMetadata({
            title: title || 'Unknown Title',
            artist: artist || 'Unknown Artist',
            album: 'Orrin', // Можна назву альбому, якщо є, або просто назву сервісу
            artwork: [
                // Треба масив, можна дати різні розміри картинки
                { src: cover || '/orrin-logo.svg', sizes: '96x96',   type: 'image/png' }, // Краще мати дефолтну картинку
                { src: cover || '/orrin-logo.svg', sizes: '128x128', type: 'image/png' },
                { src: cover || '/orrin-logo.svg', sizes: '192x192', type: 'image/png' },
                { src: cover || '/orrin-logo.svg', sizes: '256x256', type: 'image/png' },
                { src: cover || '/orrin-logo.svg', sizes: '384x384', type: 'image/png' },
                { src: cover || '/orrin-logo.svg', sizes: '512x512', type: 'image/png' },
            ]
        });

        // Кажемо системі, чи грає музика зараз
        navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";

        // Прив'язуємо наші функції до системних кнопок
        // Як тільки ми це робимо, кнопки стають активними
        try {
            navigator.mediaSession.setActionHandler('play', () => { console.log("Натиснуто Play"); resumeTrack(); });
            navigator.mediaSession.setActionHandler('pause', () => { console.log("Натиснуто Pause"); pauseTrack(); });
            navigator.mediaSession.setActionHandler('stop', () => { console.log("Натиснуто Stop"); stopTrack(); }); // Якщо хочеш обробити Stop
            navigator.mediaSession.setActionHandler('seekbackward', (details) => { console.log("Натиснуто Seek Backward"); /* тут логіка перемотки назад */ });
            navigator.mediaSession.setActionHandler('seekforward', (details) => { console.log("Натиснуто Seek Forward"); /* тут логіка перемотки вперед */ });
            navigator.mediaSession.setActionHandler('seekto', (details) => { console.log("Натиснуто Seek To"); /* тут логіка перемотки на час */ });
            navigator.mediaSession.setActionHandler('previoustrack', () => { console.log("Натиснуто Previous Track"); previousTrack(); });
            navigator.mediaSession.setActionHandler('nexttrack', () => { console.log("Натиснуто Next Track"); nextTrack(); });
        } catch (error) {
            console.error("Помилка прив'язки обробників Media Session:", error);
        }

        // Прибираємо обробники, коли трек міняється або компонент зникає
        return () => {
            // console.log("Прибираємо обробники Media Session");
            try {
                navigator.mediaSession.setActionHandler('play', null);
                navigator.mediaSession.setActionHandler('pause', null);
                navigator.mediaSession.setActionHandler('stop', null);
                navigator.mediaSession.setActionHandler('seekbackward', null);
                navigator.mediaSession.setActionHandler('seekforward', null);
                navigator.mediaSession.setActionHandler('seekto', null);
                navigator.mediaSession.setActionHandler('previoustrack', null);
                navigator.mediaSession.setActionHandler('nexttrack', null);
            } catch (error) {
                // Може бути помилка, якщо підтримка API зникла раптово
            }
        };
        // Цей ефект залежить від треку, стану play/pause і функцій керування
    }, [currentTrack, isPlaying, resumeTrack, pauseTrack, nextTrack, previousTrack, stopTrack]);

    // Оновлюємо прогрес-бар в системному віджеті
    useEffect(() => {
        const audio = audioRef.current;

        // Перевіряємо, чи є аудіо і чи підтримується функція setPositionState
        if (!audio || !('mediaSession' in navigator) || !('setPositionState' in navigator.mediaSession)) {
            return;
        }

        // Функція, що оновлює позицію
        const updatePositionState = () => {
            // Перевіряємо, чи є валідні значення часу
            if (isFinite(audio.duration) && isFinite(audio.currentTime)) {
                navigator.mediaSession.setPositionState({
                    duration: audio.duration,
                    position: audio.currentTime,
                    playbackRate: audio.playbackRate,
                });
            }
        };

        // Ставимо інтервал, щоб оновлювати позицію регулярно (напр., раз на секунду)
        // Бо 'timeupdate' може спрацьовувати занадто часто або невчасно
        const intervalId = setInterval(updatePositionState, 1000);

        // Також оновлюємо одразу, коли завантажились метадані (щоб отримати duration)
        audio.addEventListener('loadedmetadata', updatePositionState);
        // І коли відтворення почалось/відновилось
        audio.addEventListener('play', updatePositionState);
        audio.addEventListener('playing', updatePositionState);

        // Прибираємо все
        return () => {
            clearInterval(intervalId);
            audio.removeEventListener('loadedmetadata', updatePositionState);
            audio.removeEventListener('play', updatePositionState);
            audio.removeEventListener('playing', updatePositionState);
            // Скидаємо стан позиції
            try {
                navigator.mediaSession.setPositionState(null);
            } catch (error) {
                // Ігноруємо помилки при скиданні
            }
        };
        // Залежить тільки від аудіо-елемента
    }, [audioRef, currentTrack]); // Додав currentTrack, щоб перезапускати при зміні треку


    // ---- Передаємо все в контекст ----
    // Збираємо всі стейти і функції в один об'єкт
    const value = {
        currentTrack, isPlaying, playTrack, pauseTrack, stopTrack, resumeTrack, isTrackPlaying, audioRef,
        nextTrack, previousTrack, queue, currentIndex, playFromQueue, addToQueue, removeFromQueue,
        clearQueue, isShuffled, repeatMode, toggleShuffle, toggleRepeat, volume, isMuted,
        updateVolume, toggleMute, isExpanded, showQueue, showTrackInfo, showVolumeControl,
        expandPlayer, collapsePlayer, toggleQueue, toggleTrackInfo, toggleVolumeControl
    };

    // Рендеримо провайдер і сам <audio> елемент
    return (
        <AudioPlayerContext.Provider value={value}>
            {children}
            {/* preload="metadata" - щоб браузер завантажив тривалість і т.д. заздалегідь */}
            <audio ref={audioRef} preload="metadata"/>
        </AudioPlayerContext.Provider>
    );
};