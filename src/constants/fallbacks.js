import {logger} from '../utils/logger';

const FALLBACK_COVER = '/orrin-logo.svg';
const FALLBACK_AVATAR = '/orrin-logo.svg';
const FALLBACK_AUDIO = null;
const FALLBACK_TRACK_TITLE = 'Unknown Title';
const FALLBACK_ARTIST_NAME = 'Unknown Artist';
const FALLBACK_USERNAME = 'Anonymous';

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

export const normalizeArtistData = (artist) => {
    if (!artist) return null;

    if (artist._normalized === true) {
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
        id: artist.slug || artist.id,
        name: getFallbackValue(artist.name, FALLBACK_ARTIST_NAME),
        slug: artist.slug || '',
        imageUrl: artist.image || artist.image_url || FALLBACK_AVATAR,
        listenersMonthly: artist.monthly_listeners || 0,
        isVerified: getBoolean(artist.is_verified, false),
        description: artist.about || artist.description || '',
        history: artist.history || '',
        genre: artist.genre || '',
        location: artist.location || '',
        joinDate: artist.joinDate || artist.join_date || '',
        socials: artist.socials || null,
        type: artist.type || 'solo',
        members: Array.isArray(artist.members) ? artist.members : [],
        discography: Array.isArray(artist.discography) ? artist.discography : [],
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
        artist: artistData
            ? artistData.name
            : (typeof track.artist === 'string' ? track.artist : FALLBACK_ARTIST_NAME),
        artistSlug: artistData ? artistData.slug : null,
        artistObj: artistData,
        cover: track.cover_url || track.cover || FALLBACK_COVER,
        audio: track.audio_url || track.audio || FALLBACK_AUDIO,
        duration: typeof track.duration === 'number' ? track.duration : 0,
        durationFormatted: track.duration_formatted || formatDuration(track.duration),
        playsCount: track.plays_count || 0,
        isLiked: getBoolean(track.is_liked, false),
        lyrics: track.lyrics || {type: 'none', content: null},
    };
};

export const normalizeUserData = (user) => {
    if (!user) return null;

    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();

    return {
        id: user.id || user.pk || user.user_id,
        name: fullName || user.name || user.username || FALLBACK_USERNAME,
        username: user.username || '',
        email: user.email || '',
        first_name: firstName,
        last_name: lastName,
        avatar: user.avatar || user.image || FALLBACK_AVATAR,
        cover_photo: user.cover_photo || null,
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        date_of_birth: user.date_of_birth || null,
        gender: user.gender || null,
        followers_count: user.followers_count ?? 0,
        following_count: user.following_count ?? 0,
        managed_artists: Array.isArray(user.managed_artists) ? user.managed_artists : [],
        isVerified: getBoolean(user.is_verified, false),
        is_following: getBoolean(user.is_following, false),
    };
};

export const normalizePostData = (post) => {
    if (!post) return null;
    return {
        id: post.id || post.pk,
        text: post.text || post.content || '',
        timestamp: post.created_at || post.timestamp,
        likesCount: post.likes_count || post.likesCount || 0,
        commentsCount: post.comments_count || post.commentsCount || 0,
        repostsCount: post.reposts_count || post.repostsCount || 0,
        author: normalizeUserData(post.author || post.user),
        attachedTrack: post.attached_track
            ? normalizeTrackData(post.attached_track)
            : (post.attachedTrack || null),
        isLiked: getBoolean(post.is_liked ?? post.isLiked, false),
        isReposted: getBoolean(post.is_reposted ?? post.isReposted, false),
        isSaved: getBoolean(post.is_saved ?? post.isSaved, false),
        comments: Array.isArray(post.comments) ? post.comments : [],
    };
};

export const isTrackPlayable = (normalizedTrack) =>
    !!(normalizedTrack && normalizedTrack.audio);
