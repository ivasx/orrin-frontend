// --- Fallback константи ---
const FALLBACK_COVER = '/orrin-logo.svg';
const FALLBACK_AVATAR = '/orrin-logo.svg'; // Можна замінити на /default-avatar.png
const FALLBACK_AUDIO = null; // null означає, що відтворення неможливе
const FALLBACK_TRACK_TITLE = 'Unknown Title';
const FALLBACK_ARTIST_NAME = 'Unknown Artist';

// --- Допоміжні функції ---

/**
 * Повертає значення, або fallback, якщо значення "порожнє"
 */
const getFallbackValue = (value, fallback) => {
    if (value === null || value === undefined || value === '') {
        return fallback;
    }
    return value;
};

/**
 * Витягує ім'я артиста.
 * API (v1) повертає об'єкт: { id, name, slug }
 * Моки (data.js) повертають рядок: "Artist Name"
 */
const extractArtistName = (artistData) => {
    if (typeof artistData === 'object' && artistData !== null && artistData.name) {
        return artistData.name; // З API
    }
    if (typeof artistData === 'string' && artistData) {
        return artistData; // З моків
    }
    return FALLBACK_ARTIST_NAME;
};

/**
 * Витягує ID/Slug артиста.
 * API (v1) повертає об'єкт: { id, name, slug } (використовуємо id або slug)
 * Моки (data.js) повертають artistId в самому треку
 */
const extractArtistId = (artistData, trackArtistId) => {
    if (typeof artistData === 'object' && artistData !== null) {
        return artistData.slug || artistData.id || null; // З API
    }
    return trackArtistId || null; // З моків (track.artistId)
};

/**
 * Форматує тривалість (яка може бути числом секунд або рядком)
 */
const formatDuration = (duration) => {
    if (typeof duration === 'string' && duration.includes(':')) {
        return duration; // Вже відформатовано (напр. "3:45")
    }

    const secondsNum = parseInt(duration, 10);
    if (isNaN(secondsNum) || secondsNum < 0) {
        return '0:00';
    }

    const mins = Math.floor(secondsNum / 60);
    const secs = secondsNum % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// --- ОСНОВНІ ФУНКЦІЇ НОРМАЛІЗАЦІЇ ---

/**
 * Нормалізує дані треку з бекенду (API) або фронтенду (моки/data.js)
 */
export const normalizeTrackData = (track) => {
    if (!track) return null;

    // Пріоритет ID: slug (API) > trackId (моки) > id (моки)
    const trackId = track.slug || track.trackId || track.id;

    if (!trackId) {
        console.error('Track without valid ID detected:', track);
        return null;
    }

    const artistName = extractArtistName(track.artist);
    const artistId = extractArtistId(track.artist, track.artistId || track.artist_id);

    // Підтримка cover_url (API) та cover (моки)
    const coverUrl = track.cover || track.cover_url || track.coverUrl;
    const cover = getFallbackValue(coverUrl, FALLBACK_COVER);

    // Підтримка audio_url (API) та audio (моки)
    const audioUrl = track.audio || track.audio_url || track.audioUrl;
    const audio = audioUrl || FALLBACK_AUDIO;

    // Обробка тривалості
    const duration = track.duration; // (з API це число, з моків - рядок)
    const durationFormatted = track.duration_formatted; // (з API)

    return {
        trackId,
        title: getFallbackValue(track.title, FALLBACK_TRACK_TITLE),
        artist: artistName,
        artistId,
        cover,
        audio,
        duration: duration || 0,
        duration_formatted: formatDuration(durationFormatted || duration),
    };
};

/**
 * Нормалізує дані артиста з бекенду (API) або фронтенду (моки/data.js)
 */
export const normalizeArtistData = (artist) => {
    if (!artist) return null;

    // Пріоритет ID: slug (API) > id (API/моки)
    const artistId = artist.slug || artist.id;

    if (!artistId) {
        console.error('Artist without valid ID detected:', artist);
        return null;
    }

    const imageUrl = artist.imageUrl || artist.image_url || artist.cover_url || FALLBACK_AVATAR;

    return {
        id: artistId,
        name: getFallbackValue(artist.name, FALLBACK_ARTIST_NAME),
        slug: artist.slug || '',
        imageUrl,
        // Поля, які з'являться в API згодом (згідно моків)
        genre: artist.genre || null,
        type: artist.type || null,
        description: artist.description || null,
        listenersMonthy: artist.listenersMonthy || artist.listeners_monthly || null,
        location: artist.location || null,
        socials: artist.socials || null,
        // ...інші поля з моків (members, discography, notes...)
        members: artist.members || [],
        discography: artist.discography || [],
        notes: artist.notes || [],
        popularTracks: artist.popularTracks || [],
        similarArtists: artist.similarArtists || [],
    };
};

/**
 * Перевіряє, чи має трек валідний URL для відтворення.
 * @param {object} normalizedTrack - Нормалізований об'єкт треку
 * @returns {boolean}
 */
export const isTrackPlayable = (normalizedTrack) => {
    // Перевіряємо, що audio не null і не порожній рядок
    return !!normalizedTrack?.audio;
};