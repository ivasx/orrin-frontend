import {
    normalizeTrackData,
    normalizeArtistData,
    normalizePostData,
    normalizeUserData,
} from '../../constants/fallbacks.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export class ApiError extends Error {
    constructor(message, status = null, endpoint = null, data = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.endpoint = endpoint;
        this.data = data;
    }
}

let inMemoryAccessToken = localStorage.getItem('access_token');
let isRefreshing = false;
let failedQueue = [];
let onSessionExpiredCallback = () => {
};

export const setAccessToken = (token) => {
    inMemoryAccessToken = token;
};

export const setSessionExpiredCallback = (callback) => {
    onSessionExpiredCallback = callback;
};

const processQueue = (error, token = null) => {
    failedQueue.forEach((promise) => {
        error ? promise.reject(error) : promise.resolve(token);
    });
    failedQueue = [];
};

const refreshAuthToken = async () => {
    try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('Refresh token is missing');

        const response = await fetch(`${API_BASE_URL}/api/v1/auth/token/refresh/`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({refresh: refreshToken}),
        });

        if (!response.ok) throw new Error('Refresh token request failed');

        const data = await response.json();
        const newAccessToken = data.access || data.access_token;
        const newRefresh = data.refresh || data.refresh_token || refreshToken;

        setAccessToken(newAccessToken);
        localStorage.setItem('access_token', newAccessToken);
        localStorage.setItem('refresh_token', newRefresh);
        return newAccessToken;
    } catch (error) {
        setAccessToken(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        onSessionExpiredCallback();
        throw error;
    }
};

function extractErrorMessage(errorData) {
    if (!errorData || typeof errorData !== 'object') return null;
    if (typeof errorData.detail === 'string') return errorData.detail;
    if (typeof errorData.message === 'string') return errorData.message;
    const messages = Object.entries(errorData)
        .filter(([, value]) => value !== null && value !== undefined)
        .map(([field, value]) => {
            const text = Array.isArray(value) ? value.join(' ') : String(value);
            return field === 'non_field_errors' ? text : `${field}: ${text}`;
        });
    return messages.length > 0 ? messages.join('\n') : null;
}

async function handleResponse(response, endpoint) {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = extractErrorMessage(errorData) || `HTTP error ${response.status}`;
        throw new ApiError(errorMessage, response.status, endpoint, errorData);
    }
    if (response.status === 204) return null;
    const data = await response.json();
    return data.results ?? data;
}

const executeFetch = async (endpoint, options, token) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {...options.headers};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
    const response = await fetch(url, {...options, headers});
    if (response.status === 401) throw new ApiError('Unauthorized', 401, endpoint);
    return handleResponse(response, endpoint);
};

export async function fetchJson(endpoint, options = {}) {
    try {
        return await executeFetch(endpoint, options, inMemoryAccessToken);
    } catch (error) {
        if (error.status !== 401) throw error;

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({resolve, reject});
            })
                .then((token) => executeFetch(endpoint, options, token))
                .catch((err) => Promise.reject(err));
        }

        isRefreshing = true;

        return new Promise((resolve, reject) => {
            refreshAuthToken()
                .then((newToken) => {
                    processQueue(null, newToken);
                    resolve(executeFetch(endpoint, options, newToken));
                })
                .catch((err) => {
                    processQueue(err, null);
                    reject(err);
                })
                .finally(() => {
                    isRefreshing = false;
                });
        });
    }
}

export {loginUser, registerUser, getCurrentUser} from '../auth/index.js';

export const getTracks = async () => {
    const data = await fetchJson('/api/v1/tracks/');
    return Array.isArray(data) ? data.map(normalizeTrackData).filter(Boolean) : [];
};

export const getTracksByIds = async (trackIds = []) => {
    if (!trackIds.length) return [];
    const data = await fetchJson(`/api/v1/tracks/?ids=${trackIds.join(',')}`);
    return Array.isArray(data) ? data.map(normalizeTrackData).filter(Boolean) : [];
};

export const getTrackBySlug = async (slug) => {
    const data = await fetchJson(`/api/v1/tracks/${slug}/`);
    return normalizeTrackData(data);
};

export const getTrackComments = async (trackId) => {
    const data = await fetchJson(`/api/v1/tracks/${trackId}/comments/`);
    return Array.isArray(data) ? data : (data.results || []);
};

export const getTrackNotes = async (trackSlug) => {
    const data = await fetchJson(`/api/v1/tracks/${trackSlug}/notes/`);
    return Array.isArray(data) ? data : (data.results || []);
};

export const getUserLibrary = async () => {
    const data = await fetchJson('/api/v1/library/');
    return Array.isArray(data) ? data.map(normalizeTrackData).filter(Boolean) : [];
};

export const getUserFavorites = async () => {
    const data = await fetchJson('/api/v1/favorites/');
    return Array.isArray(data) ? data.map(normalizeTrackData).filter(Boolean) : [];
};

export const getUserHistory = async () => {
    const data = await fetchJson('/api/v1/history/');
    const tracks = Array.isArray(data) ? data : (data.results || []);
    return tracks.map(normalizeTrackData).filter(Boolean);
};

export const getListeningHistory = async () => {
    const data = await fetchJson('/api/v1/history/');
    const entries = Array.isArray(data) ? data : (data.results || []);
    return entries
        .map((entry) => {
            const normalized = normalizeTrackData(entry);
            if (!normalized) return null;
            return {
                ...normalized,
                historyEntryId: entry.historyEntryId || entry.history_entry_id || entry.id,
                playedAt: entry.playedAt || entry.played_at || null,
            };
        })
        .filter(Boolean);
};

export const clearListeningHistory = async () => {
    await fetchJson('/api/v1/history/', {method: 'DELETE'});
    return {success: true};
};

export const removeTrackFromHistory = async (historyEntryId) => {
    await fetchJson(`/api/v1/history/${historyEntryId}/`, {method: 'DELETE'});
    return {success: true};
};

export const getLikedSongs = async () => {
    const data = await fetchJson('/api/v1/library/liked/');
    return Array.isArray(data) ? data.map(normalizeTrackData).filter(Boolean) : [];
};

export const getUserPlaylists = async () => {
    const data = await fetchJson('/api/v1/library/playlists/');
    return Array.isArray(data) ? data : (data.results || []);
};

export const getPlaylistById = async (id) => {
    return fetchJson(`/api/v1/library/playlists/${id}/`);
};

export const deletePlaylist = async (id) => {
    await fetchJson(`/api/v1/library/playlists/${id}/`, {method: 'DELETE'});
    return {success: true};
};

export const getSavedAlbums = async () => {
    const data = await fetchJson('/api/v1/library/albums/');
    return Array.isArray(data) ? data : (data.results || []);
};

export const getFollowingArtists = async () => {
    const data = await fetchJson('/api/v1/library/artists/');
    return Array.isArray(data) ? data : (data.results || []);
};

export const createPlaylist = async (formData) => {
    return fetchJson('/api/v1/library/playlists/', {
        method: 'POST',
        body: formData,
    });
};

export const getArtists = async () => {
    const data = await fetchJson('/api/v1/artists/');
    return Array.isArray(data) ? data.map(normalizeArtistData) : [];
};

export const getArtistById = async (slugOrId) => {
    const data = await fetchJson(`/api/v1/artists/${slugOrId}/`);
    return normalizeArtistData(data);
};

export const updateArtistProfile = async (slugOrId, formData) => {
    const data = await fetchJson(`/api/v1/artists/${slugOrId}/`, {
        method: 'PATCH',
        body: formData,
    });
    return normalizeArtistData(data);
};

export const getArtistPosts = async (slugOrId) => {
    const data = await fetchJson(`/api/v1/artists/${slugOrId}/posts/`);
    const posts = Array.isArray(data) ? data : (data.results || []);
    return posts.map(normalizePostData).filter(Boolean);
};

export const getFeedPosts = async ({type, sort, contentType, pageParam = 1} = {}) => {
    const params = new URLSearchParams();
    if (type) params.append('feed_type', type);
    if (sort) params.append('sort', sort);
    if (contentType) params.append('content_type', contentType);
    if (pageParam) params.append('page', pageParam);
    const qs = params.toString();
    const data = await fetchJson(`/api/v1/feed/${qs ? `?${qs}` : ''}`);
    const posts = Array.isArray(data) ? data : (data.results || []);
    return posts.map(normalizePostData);
};

export const createPost = async (postData) => {
    const body = {};
    for (const [key, value] of postData.entries()) {
        body[key] = value;
    }
    if (body.track_id) {
        body.track_slug = body.track_id;
        delete body.track_id;
    }
    return fetchJson('/api/v1/feed/', {
        method: 'POST',
        body: JSON.stringify(body),
    });
};

export const toggleLikePost = async (postId) =>
    fetchJson(`/api/v1/feed/posts/${postId}/like/`, {method: 'POST'});

export const repostPost = async (postId) =>
    fetchJson(`/api/v1/feed/posts/${postId}/repost/`, {method: 'POST'});

export const toggleSavePost = async (postId) =>
    fetchJson(`/api/v1/feed/posts/${postId}/save/`, {method: 'POST'});

export const reportPost = async (postId, reason = 'spam') =>
    fetchJson(`/api/v1/feed/posts/${postId}/report/`, {
        method: 'POST',
        body: JSON.stringify({reason}),
    });

export const addComment = async (postId, text) =>
    fetchJson(`/api/v1/feed/posts/${postId}/comments/`, {
        method: 'POST',
        body: JSON.stringify({text}),
    });

export const getFriendsActivity = async () => {
    const data = await fetchJson('/api/v1/friends/activity/');
    return Array.isArray(data) ? data.map(normalizeTrackData).filter(Boolean) : [];
};

export const searchGlobal = async (query) => {
    const [tracks, artists, users] = await Promise.all([
        fetchJson(`/api/v1/tracks/?search=${encodeURIComponent(query)}`),
        fetchJson(`/api/v1/artists/?search=${encodeURIComponent(query)}`),
        fetchJson(`/api/v1/users/search/?search=${encodeURIComponent(query)}`),
    ]);
    return {
        tracks: (Array.isArray(tracks) ? tracks : tracks.results || []).map(normalizeTrackData),
        artists: (Array.isArray(artists) ? artists : artists.results || []).map(normalizeArtistData),
        users: (Array.isArray(users) ? users : users.results || []).map(normalizeUserData),
    };
};

export const getUserProfile = async (username) => {
    const data = await fetchJson(`/api/v1/users/${username}/`);
    return normalizeUserData(data);
};

export const updateUserProfile = async (username, payload) => {
    const isFormData = payload instanceof FormData;
    const data = await fetchJson('/api/v1/users/me/', {
        method: 'PATCH',
        body: isFormData ? payload : JSON.stringify(payload),
    });
    return normalizeUserData(data);
};

export const toggleFollowUser = async (username) =>
    fetchJson(`/api/v1/users/${username}/follow/`, {method: 'POST'});

export const getUserPosts = async (username) => {
    const data = await fetchJson(`/api/v1/users/${username}/posts/`);
    return Array.isArray(data) ? data.map(normalizePostData) : [];
};

export const getUserFollowers = async (username) => {
    const data = await fetchJson(`/api/v1/users/${username}/followers/`);
    return Array.isArray(data) ? data.map(normalizeUserData) : [];
};

export const getNotifications = async () => {
    const data = await fetchJson('/api/notifications/');
    return Array.isArray(data) ? data : (data.results || []);
};

export const markNotificationAsRead = async (id) =>
    fetchJson(`/api/notifications/${id}/read/`, {method: 'POST'});

export const markAllNotificationsAsRead = async () =>
    fetchJson('/api/notifications/read-all/', {method: 'POST'});

export const requestPasswordReset = (email) =>
    fetchJson('/api/v1/auth/password/reset/', {
        method: 'POST',
        body: JSON.stringify({email}),
    });

export const confirmPasswordReset = (uid, token, newPassword) =>
    fetchJson('/api/v1/auth/password/reset/confirm/', {
        method: 'POST',
        body: JSON.stringify({uid, token, new_password: newPassword}),
    });

export const getSocialLoginUrl = (_provider) =>
    `${API_BASE_URL}/api/v1/auth/google/login/`;

export const getTopTracks = async () => {
    const data = await fetchJson('/api/v1/stats/top-tracks/');
    return Array.isArray(data) ? data.map(normalizeTrackData).filter(Boolean) : [];
};

export const getTopAlbums = async () => {
    const data = await fetchJson('/api/v1/stats/top-albums/');
    return Array.isArray(data) ? data : (data.results || []);
};

export const getTopArtists = async () => {
    const data = await fetchJson('/api/v1/stats/top-artists/');
    return Array.isArray(data) ? data : (data.results || []);
};

export const getUserChats = async () => {
    const data = await fetchJson('/api/v1/chats/');
    return Array.isArray(data) ? data : (data.results || []);
};

export const getChatMessages = async (chatId) => {
    const data = await fetchJson(`/api/v1/chats/${chatId}/messages/`);
    return Array.isArray(data) ? data : (data.results || []);
};

export const sendMessage = async (chatId, text, trackId = null) => {
    const body = {text: text || ''};
    if (trackId) body.track_id = trackId;
    return fetchJson(`/api/v1/chats/${chatId}/messages/`, {
        method: 'POST',
        body: JSON.stringify(body),
    });
};

export const getUnreadMessagesCount = async () => {
    try {
        const chats = await getUserChats();
        return chats.reduce((total, chat) => total + (chat.unreadCount || chat.unread_count || 0), 0);
    } catch {
        return 0;
    }
};

export const getTerms = async (lang = 'en') => {
    return fetchJson(`/api/v1/legal/terms/?lang=${lang}`);
};

export const getPrivacyPolicy = async (lang = 'en') => {
    return fetchJson(`/api/v1/legal/privacy/?lang=${lang}`);
};



export const getArtistNotes = async (artistSlug) => {
    const data = await fetchJson(`/api/v1/artists/${artistSlug}/notes/`);
    return Array.isArray(data) ? data : (data.results || []);
};

export const createNote = async (noteData) => {
    return fetchJson('/api/v1/notes/', {
        method: 'POST',
        body: JSON.stringify(noteData),
    });
};

export const updateNote = async (noteId, noteData) => {
    return fetchJson(`/api/v1/notes/${noteId}/`, {
        method: 'PATCH',
        body: JSON.stringify(noteData),
    });
};

export const deleteNote = async (noteId) => {
    await fetchJson(`/api/v1/notes/${noteId}/`, { method: 'DELETE' });
    return { success: true };
};

export const toggleLikeNote = async (noteId) => {
    return fetchJson(`/api/v1/notes/${noteId}/like/`, { method: 'POST' });
};