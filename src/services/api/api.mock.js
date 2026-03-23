// api.mock.js — Full mock API covering all Orrin endpoints
// Usage: set VITE_USE_MOCK_DATA=true && VITE_USE_MOCK_AUTH=true in .env.local

import {
    mockTracks,
    mockArtists,
    mockPosts,
    mockUsers,
    mockNotifications,
    mockFollowers,
    mockUserProfiles,
    mockArtistNotes,
} from '../../data/mockData.js';
import { normalizeTrackData, normalizeArtistData, normalizePostData, normalizeUserData } from '../../constants/fallbacks.js';

// Simulate realistic network latency
const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── AUTH ───────────────────────────────────────────────────

export const loginUser = async (credentials) => {
    await delay(600);
    if (credentials.password && credentials.password.length < 3) {
        throw new Error('Invalid credentials');
    }
    return {
        access: 'mock_access_' + Date.now(),
        refresh: 'mock_refresh_' + Date.now(),
    };
};

export const registerUser = async (userData) => {
    await delay(800);
    return {
        access: 'mock_access_' + Date.now(),
        refresh: 'mock_refresh_' + Date.now(),
    };
};

export const getCurrentUser = async () => {
    await delay(300);
    // Returns the "logged in" demo user
    const raw = mockUsers[3]; // orrin_demo
    return {
        id: raw.id,
        pk: raw.pk,
        username: raw.username,
        name: raw.name,
        first_name: raw.first_name,
        last_name: raw.last_name,
        avatar: raw.avatar,
        avatarUrl: raw.avatar,
        bio: raw.bio,
        managed_artists: raw.managed_artists,
        is_verified: raw.is_verified,
    };
};

// ─── TRACKS ─────────────────────────────────────────────────

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

export const getUserLibrary = async () => {
    await delay();
    return mockTracks.map(normalizeTrackData).filter(Boolean);
};

export const getUserFavorites = async () => {
    await delay();
    return mockTracks
        .filter((t) => t.is_liked)
        .map(normalizeTrackData)
        .filter(Boolean);
};

export const getUserHistory = async () => {
    await delay();
    // Return all tracks reversed to simulate "recently listened"
    return [...mockTracks].reverse().map(normalizeTrackData).filter(Boolean);
};

export const getFriendsActivity = async () => {
    await delay();
    return mockTracks.slice(0, 6).map(normalizeTrackData).filter(Boolean);
};

// ─── ARTISTS ─────────────────────────────────────────────────

export const getArtists = async () => {
    await delay();
    return mockArtists.map(normalizeArtistData).filter(Boolean);
};

export const getArtistById = async (slugOrId) => {
    await delay();
    const artist = mockArtists.find(
        (a) => a.id === slugOrId || a.slug === slugOrId
    );
    if (!artist) throw new Error(`Artist not found: ${slugOrId}`);

    // Attach mock popularTracks and notes
    const normalized = normalizeArtistData(artist);
    return {
        ...normalized,
        popularTracks: mockTracks.slice(0, 5).map(normalizeTrackData).filter(Boolean),
        notes: mockArtistNotes,
        similarArtists: mockArtists
            .filter((a) => a.id !== artist.id)
            .slice(0, 4)
            .map((a) => ({
                id: a.slug,
                name: a.name,
                imageUrl: a.image_url,
                subtitle: a.genre,
            })),
    };
};

// ─── FEED & POSTS ─────────────────────────────────────────────

export const getFeedPosts = async ({ type, sort, contentType, pageParam = 1 } = {}) => {
    await delay(500);

    let posts = [...mockPosts];

    // Filter by contentType
    if (contentType === 'with_music') {
        posts = posts.filter((p) => p.attachedTrack);
    } else if (contentType === 'text_only') {
        posts = posts.filter((p) => !p.attachedTrack);
    }

    // Sort
    if (sort === 'popular') {
        posts = posts.sort((a, b) => b.likesCount - a.likesCount);
    }

    // Pagination: 4 posts per page
    const pageSize = 4;
    const start = (pageParam - 1) * pageSize;
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
            id: mockUsers[3].id,
            name: mockUsers[3].name,
            avatar: mockUsers[3].avatar,
            isVerified: false,
            isArtist: false,
        },
        text: formData.get?.('text') || '',
        attachedTrack: null,
        timestamp: 'just now',
        fullTimestamp: new Date().toLocaleString(),
        likesCount: 0,
        commentsCount: 0,
        repostsCount: 0,
        isLiked: false,
        isReposted: false,
        isSaved: false,
        comments: [],
    };
    return normalizePostData(newPost) || newPost;
};

export const toggleLikePost = async (postId) => {
    await delay(200);
    return { success: true, postId };
};

export const repostPost = async (postId) => {
    await delay(200);
    return { success: true, postId };
};

export const addComment = async (postId, text) => {
    await delay(300);
    return {
        id: 'comment-new-' + Date.now(),
        author: { id: mockUsers[3].id, name: mockUsers[3].name, avatar: mockUsers[3].avatar },
        text,
        timestamp: 'just now',
        likes_count: 0,
    };
};

export const toggleSavePost = async (postId) => {
    await delay(200);
    return { success: true, postId };
};

export const reportPost = async (postId) => {
    await delay(200);
    return { success: true };
};

// ─── SEARCH ──────────────────────────────────────────────────

export const searchGlobal = async (query) => {
    await delay(300);
    const q = query.toLowerCase().trim();
    if (!q) return { tracks: [], artists: [] };

    const tracks = mockTracks
        .filter(
            (t) =>
                t.title.toLowerCase().includes(q) ||
                t.artist.name.toLowerCase().includes(q)
        )
        .map(normalizeTrackData)
        .filter(Boolean);

    const artists = mockArtists
        .filter((a) => a.name.toLowerCase().includes(q))
        .map(normalizeArtistData)
        .filter(Boolean);

    return { tracks, artists };
};

// ─── USERS & PROFILES ────────────────────────────────────────

export const getUserProfile = async (usernameOrId) => {
    await delay();
    const profile =
        mockUserProfiles[usernameOrId] ||
        Object.values(mockUserProfiles).find(
            (p) => p.id === usernameOrId || p.pk === Number(usernameOrId)
        );
    if (!profile) throw new Error(`User not found: ${usernameOrId}`);
    return profile;
};

export const toggleFollowUser = async (username) => {
    await delay(250);
    return { success: true };
};

export const getUserPosts = async (username) => {
    await delay();
    // Return a subset of posts filtered by "author"
    return mockPosts
        .filter((p) => {
            const user = Object.values(mockUserProfiles).find(
                (u) => u.username === username
            );
            return user ? p.author.id === user.id : false;
        })
        .concat(mockPosts.slice(0, 2)); // Supplement with some posts so it's never empty
};

export const getUserFollowers = async (username) => {
    await delay();
    return mockFollowers;
};

// ─── NOTIFICATIONS ────────────────────────────────────────────

export const getNotifications = async () => {
    await delay();
    return mockNotifications;
};

export const markNotificationAsRead = async (id) => {
    await delay(150);
    return { success: true };
};

export const markAllNotificationsAsRead = async () => {
    await delay(200);
    return { success: true };
};

// ─── AUTH HELPERS ────────────────────────────────────────────

export const requestPasswordReset = async (email) => {
    await delay(600);
    return { success: true, message: `Reset link sent to ${email}` };
};

export const confirmPasswordReset = async (uid, token, newPassword) => {
    await delay(600);
    return { success: true };
};

export const getSocialLoginUrl = (provider) => {
    return `#mock-social-login-${provider.toLowerCase()}`;
};