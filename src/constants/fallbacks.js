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
 * Обробляє дані артиста з бекенду або фронтенду
 * @param {string|number|object|array} artistData - Дані артиста
 * @returns {string} Ім'я артиста
 */
const extractArtistName = (artistData) => {
    if (!artistData) return FALLBACK_ARTIST_NAME;

    // Якщо це рядок (ім'я артиста)
    if (typeof artistData === 'string') {
        return artistData.trim() || FALLBACK_ARTIST_NAME;
    }

    // Якщо це число (ID з бекенду) - повертаємо fallback
    // У майбутньому тут можна буде зробити запит до API
    if (typeof artistData === 'number') {
        console.warn(`Artist data is just an ID (${artistData}). Consider fetching full artist details.`);
        return FALLBACK_ARTIST_NAME;
    }

    // Якщо це об'єкт з полем name
    if (typeof artistData === 'object' && artistData.name) {
        return artistData.name.trim() || FALLBACK_ARTIST_NAME;
    }

    // Якщо це масив артистів (множинні артисти)
    if (Array.isArray(artistData) && artistData.length > 0) {
        const names = artistData.map(a => {
            if (typeof a === 'string') return a;
            if (typeof a === 'object' && a.name) return a.name;
            return '';
        }).filter(n => n);

        return names.length > 0 ? names.join(', ') : FALLBACK_ARTIST_NAME;
    }

    return FALLBACK_ARTIST_NAME;
};

/**
 * Витягує ID артиста з різних форматів даних
 * @param {string|number|object} artistData - Дані артиста
 * @param {string|number} providedArtistId - Окремо переданий ID
 * @returns {string|number|null} ID артиста
 */
const extractArtistId = (artistData, providedArtistId) => {
    // Якщо є окремий artistId пропс, використовуємо його
    if (providedArtistId) return providedArtistId;

    // Якщо artist - це число (ID з бекенду)
    if (typeof artistData === 'number') return artistData;

    // Якщо artist - об'єкт з id
    if (typeof artistData === 'object' && artistData?.id) {
        return artistData.id;
    }

    // Якщо artist - об'єкт з slug
    if (typeof artistData === 'object' && artistData?.slug) {
        return artistData.slug;
    }

    return null;
};

/**
 * Нормалізує дані треку з бекенду або фронтенду
 * Підтримує різні формати даних (snake_case з API, camelCase з фронтенду)
 */
export const normalizeTrackData = (track) => {
    if (!track) return null;

    // КРИТИЧНО: trackId має бути стабільним для React keys
    // Пріоритет: slug (з API) > trackId (фронтенд) > id (фронтенд)
    // Ніколи не використовуємо Date.now() для генерації ID!
    const trackId = track.slug || track.trackId || track.id;

    // Якщо немає жодного валідного ID, повертаємо null - краще не рендерити такий трек
    if (!trackId) {
        console.error('Track without valid ID detected:', track);
        return null;
    }

    // Обробляємо артиста
    const artist = track.artist || FALLBACK_ARTIST_NAME;
    const artistName = extractArtistName(artist);
    const artistId = extractArtistId(artist, track.artistId || track.artist_id);

    // Обробляємо обкладинку (підтримка різних форматів)
    const coverUrl = track.cover || track.cover_url || track.coverUrl;
    const cover = getFallbackValue(coverUrl, FALLBACK_COVER);

    // Обробляємо аудіо (підтримка різних форматів)
    const audioUrl = track.audio || track.audio_url || track.audioUrl;
    const audio = audioUrl || FALLBACK_AUDIO;

    // Обробляємо тривалість
    const durationFormatted = track.duration_formatted || track.durationFormatted;
    const duration = track.duration;

    return {
        trackId, // Гарантовано стабільний ID
        title: getFallbackValue(track.title, FALLBACK_TRACK_TITLE),
        artist: artistName,
        artistId,
        cover,
        audio,
        duration,
        duration_formatted: formatDuration(durationFormatted || duration),
    };
};

/**
 * Перевіряє чи трек валідний для відтворення
 */
export const isTrackPlayable = (track) => {
    if (!track) return false;
    const normalized = normalizeTrackData(track);
    return !!normalized && !!normalized.audio && normalized.audio !== FALLBACK_AUDIO;
};