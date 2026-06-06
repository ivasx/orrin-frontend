import {logger} from '../utils/logger';

const FALLBACK_COVER = '/orrin-logo.svg';
const FALLBACK_AVATAR = '/default-avatar.png';
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
    (value !== undefined && value !== null) ? Boolean(value) : defaultValue;

// ── Artist ────────────────────────────────────────────────────────────────────

export const normalizeArtistData = (artist) => {
    if (!artist) return null;
    if (artist._normalized === true) return artist;

    if (typeof artist === 'string') {
        return {
            _normalized: true,
            id: null,
            name: artist,
            slug: null,
            imageUrl: FALLBACK_AVATAR,
        };
    }

    // genres can be slug strings or objects
    const genreList = Array.isArray(artist.genres) ? artist.genres : [];
    const genreStr = genreList
        .map((g) => (typeof g === 'string' ? g : g?.name ?? g?.slug ?? ''))
        .filter(Boolean)
        .join(', ');

    // members from BandMemberSerializer: { id, name, role, image_url }
    const members = Array.isArray(artist.members)
        ? artist.members.map((m) => ({
            id: m.id,
            name: m.name,
            role: m.role,
            // BandMemberSerializer returns image_url; keep imageUrl alias
            imageUrl: m.image_url || m.imageUrl || FALLBACK_AVATAR,
            username: m.username || null,
        }))
        : [];

    // discography from AlbumBriefSerializer: { id, slug, title, year, type, cover_url }
    const discography = Array.isArray(artist.discography)
        ? artist.discography.map((alb) => ({
            id: alb.id || alb.slug,
            slug: alb.slug || alb.id,
            title: alb.title,
            year: alb.year,
            type: alb.type || alb.album_type || 'Album',
            // AlbumBriefSerializer returns cover_url; AlbumCard expects cover
            cover: alb.cover_url || alb.cover || FALLBACK_COVER,
            artist: alb.artist_name || alb.artist,
        }))
        : [];

    // similarArtists from SimilarArtistSerializer: { id, slug, name, image_url, monthly_listeners, is_verified }
    const similarArtists = Array.isArray(artist.similar_artists || artist.similarArtists)
        ? (artist.similar_artists || artist.similarArtists).map((a) => ({
            id: a.id || a.slug,
            slug: a.slug || a.id,
            name: a.name,
            imageUrl: a.image_url || a.imageUrl || FALLBACK_AVATAR,
            subtitle: a.genre || a.mini_description,
            listenersMonthly: a.monthly_listeners || 0,
            isVerified: getBoolean(a.is_verified ?? a.isVerified, false),
        }))
        : [];

    // popularTracks from ArtistTrackSerializer: { slug, title, artist_name, cover_url, audio_url, plays_count, is_liked }
    const popularTracks = Array.isArray(artist.popular_tracks || artist.popularTracks)
        ? (artist.popular_tracks || artist.popularTracks).map(normalizeTrackData).filter(Boolean)
        : [];

    return {
        _normalized: true,

        id: artist.slug || artist.id,
        slug: artist.slug || '',
        name: getFallbackValue(artist.name, FALLBACK_ARTIST_NAME),

        // ArtistSerializer returns image_url; ArtistPage expects imageUrl
        imageUrl: artist.image_url || artist.imageUrl || artist.image || FALLBACK_AVATAR,

        // ArtistPage uses listenersMonthly for the eyebrow text
        listenersMonthly: artist.monthly_listeners || artist.listenersMonthly || 0,

        isVerified: getBoolean(artist.is_verified ?? artist.isVerified, false),

        // ArtistPage (AboutTab) uses description; bk field is `about`
        description: artist.about || artist.description || artist.mini_description || '',
        about: artist.about || artist.description || '',
        history: artist.history || '',
        miniDescription: artist.mini_description || artist.miniDescription || '',

        genre: artist.genre || genreStr || '',
        genres: genreList,
        location: artist.location || '',
        joinDate: artist.join_date || artist.joinDate || '',
        socials: artist.socials || null,
        type: artist.type || 'solo',

        followersCount: artist.followers_count || artist.followersCount || 0,
        isFollowing: getBoolean(artist.is_following ?? artist.isFollowing, false),

        members,
        discography,
        similarArtists,
        popularTracks,

        // Notes are fetched separately by ArtistNotesTab; keep empty default
        notes: Array.isArray(artist.notes) ? artist.notes : [],
    };
};

// ── Track ─────────────────────────────────────────────────────────────────────

export const normalizeTrackData = (track) => {
    if (!track) return null;

    // Already normalised guard
    if (track.trackId && track.durationFormatted && track.artistObj) return track;

    const trackId = track.trackId || track.slug || track.id;
    if (!trackId) {
        logger.warn('Track normalization failed: Missing slug or id', track);
        return null;
    }

    // artist can be an object (from ArtistSerializer) or a plain string
    const artistData = normalizeArtistData(
        typeof track.artist === 'object' ? track.artist : null
    );

    return {
        trackId: String(trackId),
        id: String(trackId),
        slug: String(trackId),

        title: getFallbackValue(track.title, FALLBACK_TRACK_TITLE),

        // AudioCore / MediaSession use track.artist (string)
        artist: artistData
            ? artistData.name
            : (typeof track.artist === 'string' ? track.artist : null)
            || track.artist_name
            || FALLBACK_ARTIST_NAME,

        artistSlug: artistData ? artistData.slug : (track.artist_slug || track.artistSlug || null),
        artistObj: artistData,

        // TrackSerializer / ArtistTrackSerializer return cover_url / audio_url
        cover: track.cover_url || track.cover || FALLBACK_COVER,
        audio: track.audio_url || track.audio || FALLBACK_AUDIO,

        duration: typeof track.duration === 'number' ? track.duration : 0,
        durationFormatted: track.duration_formatted
            || track.durationFormatted
            || formatDuration(track.duration),

        // plays_count from TrackSerializer
        playsCount: track.plays_count || track.playsCount || 0,

        // is_liked comes from TrackSerializer (when liked_ids context provided)
        isLiked: getBoolean(track.is_liked ?? track.isLiked, false),

        // lyrics from LyricsSerializer: { type: 'static'|'synced', content }
        lyrics: track.lyrics || {type: 'none', content: null},

        // History support
        historyEntryId: track.historyEntryId || track.history_entry_id || null,
        playedAt: track.playedAt || track.played_at || null,
    };
};

// ── User ──────────────────────────────────────────────────────────────────────

export const normalizeUserData = (user) => {
    if (!user) return null;

    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();

    return {
        id: user.id ?? user.pk ?? user.user_id ?? null,
        pk: user.pk ?? user.id ?? null,

        name: fullName || user.name || user.username || FALLBACK_USERNAME,
        username: user.username || '',
        email: user.email || '',

        first_name: firstName,
        last_name: lastName,

        // avatar — backend returns avatar_url from UserProfileSerializer
        avatar: user.avatar_url || user.avatarUrl || user.avatar || null,
        avatar_url: user.avatar_url || user.avatarUrl || user.avatar || null,
        cover_photo: user.cover_photo || null,
        cover_photo_url: user.cover_photo_url || user.coverPhotoUrl || null,

        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        date_of_birth: user.date_of_birth || null,
        gender: user.gender || null,
        date_joined: user.date_joined || null,

        followers_count: user.followers_count ?? 0,
        following_count: user.following_count ?? 0,

        managed_artists: Array.isArray(user.managed_artists) ? user.managed_artists : [],

        // Both snake_case (bk) and camelCase (fk) variants kept for compatibility
        is_verified: getBoolean(user.is_verified ?? user.isVerified, false),
        isVerified: getBoolean(user.is_verified ?? user.isVerified, false),
        is_following: getBoolean(user.is_following ?? user.isFollowing, false),
    };
};

// ── Post ──────────────────────────────────────────────────────────────────────

/**
 * The new PostSerializer already returns camelCase (isLiked, likesCount, etc.)
 * This normaliser bridges old mock shapes AND the new backend shape.
 */
export const normalizePostData = (post) => {
    if (!post) return null;

    const rawAuthor = post.author || post.user || {};

    return {
        id: post.id || post.pk,
        text: post.text || post.content || '',

        // PostSerializer returns `timestamp` (human-relative) and `fullTimestamp` (ISO)
        timestamp: post.timestamp || post.created_at,
        fullTimestamp: post.fullTimestamp || post.full_timestamp || post.created_at,

        // camelCase from new PostSerializer; snake_case fallback for mock
        likesCount: post.likesCount ?? post.likes_count ?? 0,
        commentsCount: post.commentsCount ?? post.comments_count ?? 0,
        repostsCount: post.repostsCount ?? post.reposts_count ?? 0,

        isLiked: getBoolean(post.isLiked ?? post.is_liked, false),
        isReposted: getBoolean(post.isReposted ?? post.is_reposted, false),
        isSaved: getBoolean(post.isSaved ?? post.is_saved, false),

        // PostSerializer returns author.isVerified / isArtist (camelCase)
        author: {
            id: rawAuthor.id,
            username: rawAuthor.username || '',
            name: rawAuthor.name
                || `${rawAuthor.first_name || ''} ${rawAuthor.last_name || ''}`.trim()
                || rawAuthor.username
                || FALLBACK_USERNAME,
            avatar: rawAuthor.avatar || null,
            isVerified: getBoolean(rawAuthor.isVerified ?? rawAuthor.is_verified, false),
            isArtist: getBoolean(rawAuthor.isArtist ?? rawAuthor.is_artist, false),
        },

        // PostSerializer returns `attachedTrack` with { trackId, title, artist, cover }
        attachedTrack: post.attachedTrack
            ? {
                trackId: post.attachedTrack.trackId || post.attachedTrack.slug,
                title: post.attachedTrack.title,
                artist: post.attachedTrack.artist,
                cover: post.attachedTrack.cover || post.attachedTrack.cover_url,
            }
            : post.attached_track
                ? normalizeTrackData(post.attached_track)
                : null,

        comments: Array.isArray(post.comments) ? post.comments : [],
    };
};

// ── Helpers ───────────────────────────────────────────────────────────────────

export const isTrackPlayable = (normalizedTrack) =>
    !!(normalizedTrack && normalizedTrack.audio);
