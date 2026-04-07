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
    mockPlaylists,
    mockSavedAlbums,
    mockFollowingArtists,
    mockTopTracks,
    mockTopAlbums,
    mockTopArtists,
    mockHistory,
    mockChats,
    mockMessages,
} from '../../data/mockData.js';
import {
    normalizeTrackData,
    normalizeArtistData,
    normalizePostData,
    normalizeUserData,
} from '../../constants/fallbacks.js';

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

let mutableHistory  = [...mockHistory];
let mutableChats    = mockChats.map((c) => ({ ...c }));
let mutableMessages = [...mockMessages];

const populatePlaylistTracks = (playlist) => {
    const tracks = (playlist.trackIds || [])
        .map((id) => mockTracks.find((t) => t.id === id))
        .filter(Boolean)
        .map(normalizeTrackData)
        .filter(Boolean);

    return {
        ...playlist,
        tracks,
        trackCount: tracks.length,
        totalDuration: tracks.reduce((acc, t) => acc + (t.duration || 0), 0),
    };
};

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
    const raw = mockUsers[3];
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

export const getListeningHistory = async () => {
    await delay(400);
    return mutableHistory
        .map((entry) => {
            const normalized = normalizeTrackData(entry);
            if (!normalized) return null;
            return {
                ...normalized,
                historyEntryId: entry.historyEntryId,
                playedAt:       entry.playedAt,
            };
        })
        .filter(Boolean);
};

export const clearListeningHistory = async () => {
    await delay(500);
    mutableHistory = [];
    return { success: true };
};

export const removeTrackFromHistory = async (historyEntryId) => {
    await delay(300);
    const index = mutableHistory.findIndex((e) => e.historyEntryId === historyEntryId);
    if (index !== -1) {
        mutableHistory.splice(index, 1);
    }
    return { success: true };
};

export const getLikedSongs = async () => {
    await delay(400);
    return mockTracks.filter((t) => t.is_liked).map(normalizeTrackData).filter(Boolean);
};

export const getUserPlaylists = async () => {
    await delay(350);
    return mockPlaylists.map(populatePlaylistTracks);
};

export const getPlaylistById = async (id) => {
    await delay(400);
    const playlist = mockPlaylists.find((p) => p.id === id);
    if (!playlist) throw new Error(`Playlist not found: ${id}`);
    return populatePlaylistTracks(playlist);
};

export const deletePlaylist = async (id) => {
    await delay(500);
    const index = mockPlaylists.findIndex((p) => p.id === id);
    if (index !== -1) {
        mockPlaylists.splice(index, 1);
    }
    return { success: true };
};

export const getSavedAlbums = async () => {
    await delay(350);
    return mockSavedAlbums;
};

export const getFollowingArtists = async () => {
    await delay(350);
    return mockFollowingArtists;
};

export const createPlaylist = async (formData) => {
    await delay(700);
    const getName = (key) => formData instanceof FormData ? formData.get(key) : formData[key];
    const imageFile = formData instanceof FormData ? formData.get('image') : null;

    const newPlaylist = {
        id: 'pl-new-' + Date.now(),
        name: getName('name') || 'New Playlist',
        description: getName('description') || '',
        cover: imageFile instanceof File ? URL.createObjectURL(imageFile) : null,
        trackCount: 0,
        trackIds: [],
        owner: { id: mockUsers[3].id, username: mockUsers[3].username, name: mockUsers[3].name },
        isPublic: true,
        createdAt: new Date().toISOString(),
        totalDuration: 0,
    };

    mockPlaylists.unshift(newPlaylist);
    return populatePlaylistTracks(newPlaylist);
};

export const getArtists = async () => {
    await delay();
    return mockArtists.map(normalizeArtistData).filter(Boolean);
};

export const getArtistById = async (slugOrId) => {
    await delay();
    const artist = mockArtists.find(
        (a) => a.id === slugOrId || a.slug === slugOrId,
    );
    if (!artist) throw new Error(`Artist not found: ${slugOrId}`);

    const normalized = normalizeArtistData(artist);

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
                imageUrl: a.image || a.image_url,
                subtitle: a.genre,
            })),
    };
};

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

export const getArtistPosts = async (slugOrId) => {
    await delay(400);

    const artist = mockArtists.find(
        (a) => a.id === slugOrId || a.slug === slugOrId,
    );
    if (!artist) return [];

    const posts = mockArtistPosts[artist.slug] || [];
    return posts;
};

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

export const getNotifications           = async () => { await delay(); return mockNotifications; };
export const markNotificationAsRead     = async (id) => { await delay(150); return { success: true }; };
export const markAllNotificationsAsRead = async ()   => { await delay(200); return { success: true }; };

export const requestPasswordReset = async (email) => { await delay(600); return { success: true }; };
export const confirmPasswordReset = async (uid, token, newPassword) => { await delay(600); return { success: true }; };
export const getSocialLoginUrl = (provider) => `#mock-social-login-${provider.toLowerCase()}`;

export const getTopTracks = async () => {
    await delay(400);
    return mockTopTracks.map(normalizeTrackData).filter(Boolean);
};

export const getTopAlbums = async () => {
    await delay(350);
    return mockTopAlbums;
};

export const getTopArtists = async () => {
    await delay(380);
    return mockTopArtists;
};

export const getUserChats = async () => {
    await delay(400);
    return [...mutableChats].sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
    );
};

export const getChatMessages = async (chatId) => {
    await delay(350);
    const chat = mutableChats.find((c) => c.id === chatId);
    if (!chat) throw new Error(`Chat not found: ${chatId}`);

    const messages = mutableMessages
        .filter((m) => m.chatId === chatId)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    mutableMessages = mutableMessages.map((m) =>
        m.chatId === chatId && m.senderId !== 'user-4'
            ? { ...m, isRead: true }
            : m,
    );

    mutableChats = mutableChats.map((c) =>
        c.id === chatId ? { ...c, unreadCount: 0 } : c,
    );

    return messages;
};

export const sendMessage = async (chatId, text) => {
    await delay(250);

    const chat = mutableChats.find((c) => c.id === chatId);
    if (!chat) throw new Error(`Chat not found: ${chatId}`);

    const now = new Date().toISOString();
    const newMessage = {
        id:        'msg-new-' + Date.now(),
        chatId,
        senderId:  'user-4',
        text:      text.trim(),
        timestamp: now,
        isRead:    false,
    };

    mutableMessages = [...mutableMessages, newMessage];

    mutableChats = mutableChats.map((c) =>
        c.id === chatId
            ? {
                ...c,
                lastMessage: {
                    id:        newMessage.id,
                    senderId:  newMessage.senderId,
                    text:      newMessage.text,
                    timestamp: newMessage.timestamp,
                    isRead:    false,
                },
                updatedAt: now,
            }
            : c,
    );

    return newMessage;
};