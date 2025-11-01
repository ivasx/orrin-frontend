/**
 * Константи для заглушок медіа-контенту
 * Використовуються коли дані не приходять з бекенду
 */

// Заглушка для обкладинки треку/альбому
export const FALLBACK_COVER = '/orrin-logo.svg';

// Заглушка для аватара артиста
export const FALLBACK_AVATAR = '/orrin-logo.svg';

// Заглушка для назви треку
export const FALLBACK_TRACK_TITLE = 'Unknown Track';

// Заглушка для імені артиста
export const FALLBACK_ARTIST_NAME = 'Unknown Artist';

// Заглушка для тривалості
export const FALLBACK_DURATION = '0:00';

// Заглушка для аудіо
export const FALLBACK_AUDIO = null;

/**
 * Утиліта для безпечного отримання значення з fallback
 */
export const getFallbackValue = (value, fallback) => {
    if (value === undefined || value === null || value === '') {
        return fallback;
    }
    return value;
};

/**
 * Утиліта для форматування тривалості
 */
export const formatDuration = (duration) => {
    if (!duration || duration === 0) {
        return FALLBACK_DURATION;
    }

    // Якщо прийшла строка
    if (typeof duration === 'string') {
        // Якщо вже в форматі M:SS
        if (duration.includes(':')) {
            return duration;
        }
        // Якщо число у вигляді строки
        duration = parseInt(duration, 10);
    }

    // Якщо число (секунди)
    if (typeof duration === 'number' && !isNaN(duration)) {
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    return FALLBACK_DURATION;
};

/**
 * Нормалізує дані треку з бекенду
 */
export const normalizeTrackData = (track) => {
    if (!track) return null;

    return {
        trackId: track.trackId || track.id || `track-${Date.now()}`,
        title: getFallbackValue(track.title, FALLBACK_TRACK_TITLE),
        artist: getFallbackValue(track.artist, FALLBACK_ARTIST_NAME),
        artistId: track.artistId || track.artist_id,
        cover: getFallbackValue(track.cover || track.cover_url, FALLBACK_COVER),
        audio: track.audio || track.audio_url || FALLBACK_AUDIO,
        duration: track.duration,
        duration_formatted: formatDuration(track.duration_formatted || track.duration),
    };
};

/**
 * Перевіряє чи трек валідний для відтворення
 */
export const isTrackPlayable = (track) => {
    if (!track) return false;
    const normalized = normalizeTrackData(track);
    return !!normalized.audio && normalized.audio !== FALLBACK_AUDIO;
};