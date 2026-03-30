// api.mock.js — Full mock API covering all Orrin endpoints
// Usage: set VITE_USE_MOCK_DATA=true && VITE_USE_MOCK_AUTH=true in .env.local

import {
    mockTracks,
    mockArtists,
    mockPosts,
    mockArtistPosts,
    mockUsers,
    mockNotifications,
    mockFollowers,
    mockUserProfiles,
    mockArtistNotes,
} from '../../data/mockData.js';
import {
    normalizeTrackData,
    normalizeArtistData,
    normalizePostData,
    normalizeUserData,
} from '../../constants/fallbacks.js';

// Simulate realistic network latency
const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── AUTH ────────────────────────────────────────────────────────────────────

export const loginUser = async (credentials) => {
    await delay(600);
    if (credentials.password && credentials.password.length < 3) {
        throw new Error('Invalid credentials');
    }
    return {
        access:  'mock_access_'  + Date.now(),
        refresh: 'mock_refresh_' + Date.now(),
    };
};

export const registerUser = async (userData) => {
    await delay(800);
    return {
        access:  'mock_access_'  + Date.now(),
        refresh: 'mock_refresh_' + Date.now(),
    };
};

export const getCurrentUser = async () => {
    await delay(300);
    const raw = mockUsers[3]; // orrin_demo
    return {
        id:              raw.id,
        pk:              raw.pk,
        username:        raw.username,
        name:            raw.name,
        first_name:      raw.first_name,
        last_name:       raw.last_name,
        avatar:          raw.avatar,
        avatarUrl:       raw.avatar,
        bio:             raw.bio,
        managed_artists: raw.managed_artists,
        is_verified:     raw.is_verified,
    };
};

// ─── TRACKS ──────────────────────────────────────────────────────────────────

export const getTracks = async () => {
    await delay();
    return mockTracks.map(normalizeTrackData).filter(Boolean);
};

export const getTracksByIds = async (trackIds = []) => {
    await delay();
    return mockTracks
        .filter((t) => trackIds.includes(t.id) || trackIds.includes(t.slug))
        .map(normalizeTrackData)
        .filter(Boolean);
};

export const getTrackBySlug = async (slug) => {
    await delay();
    const track = mockTracks.find((t) => t.slug === slug || t.id === slug);
    if (!track) throw new Error('Track not found');
    return normalizeTrackData(track);
};

export const getUserLibrary   = async () => { await delay(); return mockTracks.map(normalizeTrackData).filter(Boolean); };
export const getUserFavorites = async () => { await delay(); return mockTracks.filter((t) => t.is_liked).map(normalizeTrackData).filter(Boolean); };
export const getUserHistory   = async () => { await delay(); return [...mockTracks].reverse().map(normalizeTrackData).filter(Boolean); };
export const getFriendsActivity = async () => { await delay(); return mockTracks.slice(0, 6).map(normalizeTrackData).filter(Boolean); };

// ─── ARTISTS ─────────────────────────────────────────────────────────────────

export const getArtists = async () => {
    await delay();
    return mockArtists.map(normalizeArtistData).filter(Boolean);
};

/**
 * Returns full artist data including all fields needed by every ArtistPage tab:
 *   - popularTracks  → Songs tab
 *   - discography    → preserved in normalizeArtistData → Discography tab
 *   - members        → preserved in normalizeArtistData → Members tab
 *   - description    → preserved (mapped from `about`) → About + Songs bio
 *   - history        → preserved → History tab
 *   - socials        → preserved → About tab
 *   - notes          → Notes tab
 *   - similarArtists → "Fans also like" section
 */
export const getArtistById = async (slugOrId) => {
    await delay();
    const artist = mockArtists.find(
        (a) => a.id === slugOrId || a.slug === slugOrId,
    );
    if (!artist) throw new Error(`Artist not found: ${slugOrId}`);

    // Normalize preserves members, discography, socials, history, description etc.
    const normalized = normalizeArtistData(artist);

    // Attach tracks that belong to this artist
    const popularTracks = mockTracks
        .filter((t) => t.artist?.id === artist.id || t.artist?.slug === artist.slug)
        .map(normalizeTrackData)
        .filter(Boolean);

    return {
        ...normalized,
        popularTracks,
        notes: mockArtistNotes,
        similarArtists: mockArtists
            .filter((a) => a.id !== artist.id)
            .slice(0, 4)
            .map((a) => ({
                id:       a.slug,
                name:     a.name,
                // Use `image` (the primary mock field) so the card gets a real photo
                imageUrl: a.image || a.image_url,
                subtitle: a.genre,
            })),
    };
};

/**
 * Update an artist's profile fields (name, description, image, banner).
 * In mock mode we echo back a merged object so the query cache updates.
 */
export const updateArtistProfile = async (slugOrId, formData) => {
    await delay(700);

    const artist = mockArtists.find(
        (a) => a.id === slugOrId || a.slug === slugOrId,
    );
    if (!artist) throw new Error(`Artist not found: ${slugOrId}`);

    const getName = (key) =>
        formData instanceof FormData ? formData.get(key) : formData[key];

    const patch = {
        name:        getName('name')        || artist.name,
        description: getName('description') || artist.description,
    };

    const imageFile  = formData instanceof FormData ? formData.get('image')  : null;
    const bannerFile = formData instanceof FormData ? formData.get('banner') : null;

    if (imageFile  instanceof File) {
        patch.image     = URL.createObjectURL(imageFile);
        patch.image_url = patch.image;
    }
    if (bannerFile instanceof File) {
        patch.banner_url = URL.createObjectURL(bannerFile);
    }

    Object.assign(artist, patch);
    return normalizeArtistData({ ...artist, ...patch });
};

/**
 * Returns posts authored by the artist or their band members.
 * Uses the `mockArtistPosts` map keyed by artist slug so the Posts tab
 * never shows generic user-feed content.
 *
 * @param {string} slugOrId
 * @returns {Promise<Array>}
 */
export const getArtistPosts = async (slugOrId) => {
    await delay(400);

    const artist = mockArtists.find(
        (a) => a.id === slugOrId || a.slug === slugOrId,
    );
    if (!artist) return [];

    const posts = mockArtistPosts[artist.slug] || [];

    // Return raw post objects — normalizePostData would strip the rich
    // `author` object (isArtist, isVerified) so we return as-is and let
    // the FeedPost component handle display.
    return posts;
};

// ─── FEED & POSTS ─────────────────────────────────────────────────────────────

export const getFeedPosts = async ({ type, sort, contentType, pageParam = 1 } = {}) => {
    await delay(500);

    let posts = [...mockPosts];

    if (contentType === 'with_music') posts = posts.filter((p) => p.attachedTrack);
    else if (contentType === 'text_only') posts = posts.filter((p) => !p.attachedTrack);

    if (sort === 'popular') posts = posts.sort((a, b) => b.likesCount - a.likesCount);

    const pageSize  = 4;
    const start     = (pageParam - 1) * pageSize;
    const pagePosts = posts.slice(start, start + pageSize);

    return {
        results: pagePosts,
        next: start + pageSize < posts.length
            ? `http://mock.api/feed?page=${pageParam + 1}`
            : null,
    };
};

export const createPost = async (formData) => {
    await delay(600);
    const newPost = {
        id: 'post-new-' + Date.now(),
        author: {
            id:         mockUsers[3].id,
            name:       mockUsers[3].name,
            avatar:     mockUsers[3].avatar,
            isVerified: false,
            isArtist:   false,
        },
        text:          formData.get?.('text') || '',
        attachedTrack: null,
        timestamp:     'just now',
        fullTimestamp: new Date().toLocaleString(),
        likesCount:    0,
        commentsCount: 0,
        repostsCount:  0,
        isLiked:       false,
        isReposted:    false,
        isSaved:       false,
        comments:      [],
    };
    return normalizePostData(newPost) || newPost;
};

export const toggleLikePost = async (postId) => { await delay(200); return { success: true, postId }; };
export const repostPost      = async (postId) => { await delay(200); return { success: true, postId }; };
export const toggleSavePost  = async (postId) => { await delay(200); return { success: true, postId }; };
export const reportPost      = async (postId) => { await delay(200); return { success: true }; };

export const addComment = async (postId, text) => {
    await delay(300);
    return {
        id:     'comment-new-' + Date.now(),
        author: { id: mockUsers[3].id, name: mockUsers[3].name, avatar: mockUsers[3].avatar },
        text,
        timestamp:   'just now',
        likes_count: 0,
    };
};

// ─── SEARCH ───────────────────────────────────────────────────────────────────

export const searchGlobal = async (query) => {
    await delay(300);
    const q = query.toLowerCase().trim();
    if (!q) return { tracks: [], artists: [] };

    const tracks = mockTracks
        .filter((t) =>
            t.title.toLowerCase().includes(q) ||
            t.artist?.name?.toLowerCase().includes(q),
        )
        .map(normalizeTrackData).filter(Boolean);

    const artists = mockArtists
        .filter((a) => a.name.toLowerCase().includes(q))
        .map(normalizeArtistData).filter(Boolean);

    return { tracks, artists };
};

// ─── USERS & PROFILES ─────────────────────────────────────────────────────────

export const getUserProfile = async (usernameOrId) => {
    await delay();
    const profile =
        mockUserProfiles[usernameOrId] ||
        Object.values(mockUserProfiles).find(
            (p) => p.id === usernameOrId || p.pk === Number(usernameOrId),
        );
    if (!profile) throw new Error(`User not found: ${usernameOrId}`);
    return profile;
};

export const updateUserProfile = async (username, payload) => {
    await delay(700);

    const profile =
        mockUserProfiles[username] ||
        Object.values(mockUserProfiles).find((p) => p.username === username);

    if (!profile) throw new Error(`User not found: ${username}`);

    const get = (key) =>
        payload instanceof FormData ? payload.get(key) : payload[key];

    const patch = {};
    ['first_name', 'last_name', 'bio', 'location', 'website'].forEach((field) => {
        const val = get(field);
        if (val !== null && val !== undefined) patch[field] = val;
    });

    const avatarFile = payload instanceof FormData ? payload.get('avatar') : null;
    if (avatarFile instanceof File) patch.avatar = URL.createObjectURL(avatarFile);

    Object.assign(profile, patch);
    return { ...profile, ...patch };
};

export const toggleFollowUser = async (username) => { await delay(250); return { success: true }; };

export const getUserPosts = async (username) => {
    await delay();
    return mockPosts
        .filter((p) => {
            const user = Object.values(mockUserProfiles).find((u) => u.username === username);
            return user ? p.author.id === user.id : false;
        })
        .concat(mockPosts.slice(0, 2));
};

export const getUserFollowers = async (username) => {
    await delay();
    return mockFollowers;
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

export const getNotifications           = async () => { await delay(); return mockNotifications; };
export const markNotificationAsRead     = async (id) => { await delay(150); return { success: true }; };
export const markAllNotificationsAsRead = async ()   => { await delay(200); return { success: true }; };

// ─── AUTH HELPERS ─────────────────────────────────────────────────────────────

export const requestPasswordReset = async (email) => { await delay(600); return { success: true }; };
export const confirmPasswordReset = async (uid, token, newPassword) => { await delay(600); return { success: true }; };
export const getSocialLoginUrl = (provider) => `#mock-social-login-${provider.toLowerCase()}`;