import { logger } from '../utils/logger';

const FALLBACK_COVER   = '/orrin-logo.svg';
const FALLBACK_AVATAR  = '/orrin-logo.svg';
const FALLBACK_AUDIO   = null;
const FALLBACK_TRACK_TITLE  = 'Unknown Title';
const FALLBACK_ARTIST_NAME  = 'Unknown Artist';
const FALLBACK_USERNAME     = 'Anonymous';

const getFallbackValue = (value, fallback) =>
    (value === null || value === undefined || value === '') ? fallback : value;

const formatDuration = (duration) => {
    if (!duration) return '0:00';
    if (typeof duration === 'string' && duration.includes(':')) return duration;
    const secondsNum = parseInt(duration, 10);
    if (isNaN(secondsNum) || secondsNum < 0) return '0:00';
    const mins = Math.floor(secondsNum / 60);
    const secs = secondsNum % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getBoolean = (value, defaultValue) =>
    (value !== undefined && value !== null) ? value : defaultValue;

/**
 * Normalizes raw artist data from the API or mock store into the canonical
 * shape expected by ArtistPage and all sub-components.
 *
 * Fields preserved (in addition to the core identity fields):
 *   members      — band member objects for the Members tab
 *   discography  — album objects for the Discography tab
 *   socials      — { instagram, youtube, spotify } for the About tab
 *   type         — 'solo' | 'group', drives Members tab visibility
 *   location     — display string for the About tab
 *   joinDate     — year/date string for the About tab
 *   description  — long-form bio (mapped from `about` or `description`)
 *   history      — history text for the History tab
 *   genre        — genre string
 *
 * @param {Object|string|null} artist
 * @returns {Object|null}
 */
export const normalizeArtistData = (artist) => {
    if (!artist) return null;

    // Already normalized — detect by the presence of our canonical fields.
    // We check `imageUrl` AND `slug` because the old guard only checked imageUrl,
    // which caused already-normalized objects to be returned without members etc.
    if (
        artist._normalized === true
    ) {
        return artist;
    }

    if (typeof artist === 'string') {
        return {
            _normalized: true,
            id: null,
            name: artist,
            slug: null,
            imageUrl: FALLBACK_AVATAR,
        };
    }

    return {
        _normalized: true,

        // ── Identity ──────────────────────────────────────────────────────
        id:           artist.slug || artist.id,
        name:         getFallbackValue(artist.name, FALLBACK_ARTIST_NAME),
        slug:         artist.slug || '',

        // ── Photo ─────────────────────────────────────────────────────────
        // Mock data uses `image` (primary) and `image_url` (fallback).
        // Real API may return `image_url` or `image`.
        imageUrl:     artist.image || artist.image_url || FALLBACK_AVATAR,

        // ── Stats ─────────────────────────────────────────────────────────
        listenersMonthly: artist.monthly_listeners || 0,
        isVerified:       getBoolean(artist.is_verified, false),

        // ── Bio / About tab ───────────────────────────────────────────────
        // `about` is the mock field name; real API may use `description`.
        description: artist.about || artist.description || '',
        history:     artist.history     || '',
        genre:       artist.genre       || '',
        location:    artist.location    || '',
        joinDate:    artist.joinDate    || artist.join_date || '',
        socials:     artist.socials     || null,

        // ── Members tab (groups only) ─────────────────────────────────────
        type:    artist.type    || 'solo',
        members: Array.isArray(artist.members) ? artist.members : [],

        // ── Discography tab ───────────────────────────────────────────────
        discography: Array.isArray(artist.discography) ? artist.discography : [],
    };
};

/**
 * Normalizes raw track data into the canonical shape expected by the player
 * and all track-list components.
 *
 * @param {Object|null} track
 * @returns {Object|null}
 */
export const normalizeTrackData = (track) => {
    if (!track) return null;

    // Already normalized — canonical tracks always have trackId + durationFormatted + artistObj.
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
        trackId:          String(trackId),
        title:            getFallbackValue(track.title, FALLBACK_TRACK_TITLE),
        artist:           artistData
            ? artistData.name
            : (typeof track.artist === 'string' ? track.artist : FALLBACK_ARTIST_NAME),
        artistSlug:       artistData ? artistData.slug : null,
        artistObj:        artistData,
        cover:            track.cover_url || track.cover || FALLBACK_COVER,
        audio:            track.audio_url || track.audio || FALLBACK_AUDIO,
        duration:         typeof track.duration === 'number' ? track.duration : 0,
        durationFormatted: track.duration_formatted || formatDuration(track.duration),
        playsCount:       track.plays_count || 0,
        isLiked:          getBoolean(track.is_liked, false),
        lyrics:           track.lyrics || { type: 'none', content: null },
    };
};

/**
 * Normalizes raw user data.
 *
 * @param {Object|null} user
 * @returns {Object|null}
 */
export const normalizeUserData = (user) => {
    if (!user) return null;
    return {
        id:         user.id || user.pk || user.user_id,
        name:       getFallbackValue(user.name || user.username, FALLBACK_USERNAME),
        username:   user.username || '',
        avatar:     user.avatar || user.image || FALLBACK_AVATAR,
        isVerified: getBoolean(user.is_verified, false),
    };
};

/**
 * Normalizes raw post data.
 *
 * @param {Object|null} post
 * @returns {Object|null}
 */
export const normalizePostData = (post) => {
    if (!post) return null;
    return {
        id:            post.id || post.pk,
        text:          post.text || post.content || '',
        timestamp:     post.created_at || post.timestamp,
        likesCount:    post.likes_count  || post.likesCount  || 0,
        commentsCount: post.comments_count || post.commentsCount || 0,
        repostsCount:  post.reposts_count  || post.repostsCount  || 0,
        author:        normalizeUserData(post.author || post.user),
        attachedTrack: post.attached_track
            ? normalizeTrackData(post.attached_track)
            : (post.attachedTrack || null),
        isLiked:       getBoolean(post.is_liked ?? post.isLiked, false),
        isReposted:    getBoolean(post.is_reposted ?? post.isReposted, false),
        isSaved:       getBoolean(post.is_saved ?? post.isSaved, false),
        comments:      Array.isArray(post.comments) ? post.comments : [],
    };
};

/**
 * Returns true if the normalized track has a playable audio URL.
 *
 * @param {Object|null} normalizedTrack
 * @returns {boolean}
 */
export const isTrackPlayable = (normalizedTrack) =>
    !!(normalizedTrack && normalizedTrack.audio);