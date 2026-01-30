import { logger } from '../utils/logger';

const FALLBACK_COVER = '/orrin-logo.svg';
const FALLBACK_AVATAR = '/orrin-logo.svg';
const FALLBACK_AUDIO = null;
const FALLBACK_TRACK_TITLE = 'Unknown Title';
const FALLBACK_ARTIST_NAME = 'Unknown Artist';
const FALLBACK_USERNAME = 'Anonymous';

const getFallbackValue = (value, fallback) => {
    return (value === null || value === undefined || value === '') ? fallback : value;
};

const formatDuration = (duration) => {
    if (!duration) return '0:00';
    if (typeof duration === 'string' && duration.includes(':')) return duration;
    const secondsNum = parseInt(duration, 10);
    if (isNaN(secondsNum) || secondsNum < 0) return '0:00';
    const mins = Math.floor(secondsNum / 60);
    const secs = secondsNum % 60;
    return mins + ':' + secs.toString().padStart(2, '0');
};

const getBoolean = (value, defaultValue) => {
    return (value !== undefined && value !== null) ? value : defaultValue;
};

export const normalizeArtistData = (artist) => {
    if (!artist) return null;

    if (artist.id && artist.imageUrl && !artist.slug && artist.hasOwnProperty('isVerified')) {
        return artist;
    }

    if (typeof artist === 'string') {
        return { id: null, name: artist, slug: null, imageUrl: FALLBACK_AVATAR };
    }

    return {
        id: artist.slug || artist.id,
        name: getFallbackValue(artist.name, FALLBACK_ARTIST_NAME),
        slug: artist.slug || '',
        imageUrl: artist.image || artist.image_url || FALLBACK_AVATAR,
        listenersMonthly: artist.monthly_listeners || 0,
        isVerified: getBoolean(artist.is_verified, false),
        about: artist.about || '',
        history: artist.history || '',
    };
};

export const normalizeTrackData = (track) => {
    if (!track) return null;

    if (track.trackId && track.durationFormatted && track.artistObj) {
        return track;
    }

    const trackId = track.trackId || track.slug || track.id;

    if (!trackId) {
        logger.warn('Track normalization failed: Missing slug or id', track);
        return null;
    }

    const artistData = normalizeArtistData(track.artist || track.artistObj);

    return {
        trackId: String(trackId),
        title: getFallbackValue(track.title, FALLBACK_TRACK_TITLE),
        artist: artistData ? artistData.name : (typeof track.artist === 'string' ? track.artist : FALLBACK_ARTIST_NAME),
        artistId: artistData ? artistData.id : null,
        artistObj: artistData,
        cover: track.cover_url || track.cover || FALLBACK_COVER,
        audio: track.audio_url || track.audio || FALLBACK_AUDIO,
        duration: typeof track.duration === 'number' ? track.duration : 0,
        durationFormatted: track.duration_formatted || formatDuration(track.duration),
        playsCount: track.plays_count || 0,
        isLiked: getBoolean(track.is_liked, false),
        lyrics: track.lyrics || { type: 'none', content: null }
    };
};

export const normalizeUserData = (user) => {
    if (!user) return null;
    return {
        id: user.id || user.pk || user.user_id,
        name: getFallbackValue(user.name || user.username, FALLBACK_USERNAME),
        username: user.username || '',
        avatar: user.avatar || user.image || FALLBACK_AVATAR,
        isVerified: getBoolean(user.is_verified, false),
    };
};

export const normalizePostData = (post) => {
    if (!post) return null;
    return {
        id: post.id || post.pk,
        text: post.text || post.content || '',
        timestamp: post.created_at || post.timestamp,
        likesCount: post.likes_count || 0,
        author: normalizeUserData(post.author || post.user),
        attachedTrack: post.attached_track ? normalizeTrackData(post.attached_track) : null,
        isLiked: getBoolean(post.is_liked, false),
    };
};

export const isTrackPlayable = (normalizedTrack) => {
    return !!(normalizedTrack && normalizedTrack.audio);
};