const FALLBACK_COVER = '/orrin-logo.svg';
const FALLBACK_AVATAR = '/orrin-logo.svg';
const FALLBACK_AUDIO = null;
const FALLBACK_TRACK_TITLE = 'Unknown Title';
const FALLBACK_ARTIST_NAME = 'Unknown Artist';

/**
 * Returns the value, or a fallback if the value is "empty"
 */
const getFallbackValue = (value, fallback) => {
    if (value === null || value === undefined || value === '') {
        return fallback;
    }
    return value;
};

/**
 * Retrieves the artist name.
 * API (v1) returns an object: { id, name, slug }
 * Mocks (data.js) return a string: "Artist Name"
 */
const extractArtistName = (artistData) => {
    if (typeof artistData === 'object' && artistData !== null && artistData.name) {
        return artistData.name;
    }
    if (typeof artistData === 'string' && artistData) {
        return artistData;
    }
    return FALLBACK_ARTIST_NAME;
};

/**
 * Retrieves the artist ID/Slug.
 * API (v1) returns an object: { id, name, slug } (use id or slug)
 * Mocks (data.js) return the artistId in the track itself
 */
const extractArtistId = (artistData, trackArtistId) => {
    if (typeof artistData === 'object' && artistData !== null) {
        return artistData.slug || artistData.id || null; // from API
    }
    return trackArtistId || null; // from mock data
};

/**
 * Formats the duration (which can be a number of seconds or a string)
 */
const formatDuration = (duration) => {
    if (typeof duration === 'string' && duration.includes(':')) {
        return duration;
    }

    const secondsNum = parseInt(duration, 10);
    if (isNaN(secondsNum) || secondsNum < 0) {
        return '0:00';
    }

    const mins = Math.floor(secondsNum / 60);
    const secs = secondsNum % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};


/**
 * Normalizes track data from the backend (API) or frontend (mock/data.js)
 */
export const normalizeTrackData = (track) => {
    if (!track) return null;

    // ID priority: slug (API) > trackId (mocks) > id (mocks)
    const trackId = track.slug || track.trackId || track.id;

    if (!trackId) {
        console.error('Track without valid ID detected:', track);
        return null;
    }

    const artistName = extractArtistName(track.artist);
    const artistId = extractArtistId(track.artist, track.artistId || track.artist_id);

    const coverUrl = track.cover || track.cover_url || track.coverUrl;
    const cover = getFallbackValue(coverUrl, FALLBACK_COVER);

    const audioUrl = track.audio || track.audio_url || track.audioUrl;
    const audio = audioUrl || FALLBACK_AUDIO;

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
        lyrics: track.lyrics || { type: 'none', content: null }
    };
};

/**
 * Normalizes artist data from the backend (API) or frontend (mocks/data.js)
 */
export const normalizeArtistData = (artist) => {
    if (!artist) return null;

    // ID priority: slug (API) > id (API/mock)
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
        genre: artist.genre || null,
        type: artist.type || null,
        description: artist.description || null,
        listenersMonthy: artist.listenersMonthy || artist.listeners_monthly || null,
        location: artist.location || null,
        socials: artist.socials || null,
        members: artist.members || [],
        discography: artist.discography || [],
        notes: artist.notes || [],
        popularTracks: artist.popularTracks || [],
        similarArtists: artist.similarArtists || [],
    };
};

/**
 * Checks if the track has a valid URL to play.
 * @param {object} normalizedTrack - Normalized track object
 * @returns {boolean}
 */
export const isTrackPlayable = (normalizedTrack) => {
    return !!normalizedTrack?.audio;
};