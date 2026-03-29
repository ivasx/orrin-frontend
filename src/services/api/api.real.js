import {
    normalizeTrackData,
    normalizeArtistData,
    normalizePostData,
    normalizeUserData,
} from '../../constants/fallbacks.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export class ApiError extends Error {
    constructor(message, status = null, endpoint = null) {
        super(message);
        this.name     = 'ApiError';
        this.status   = status;
        this.endpoint = endpoint;
    }
}

let inMemoryAccessToken = localStorage.getItem('access_token');
let isRefreshing = false;
let failedQueue  = [];
let onSessionExpiredCallback = () => {};

export const setAccessToken = (token) => { inMemoryAccessToken = token; };

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

        const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!response.ok) throw new Error('Refresh token request failed');

        const data           = await response.json();
        const newAccessToken = data.access || data.access_token;
        const newRefresh     = data.refresh || data.refresh_token || refreshToken;

        setAccessToken(newAccessToken);
        localStorage.setItem('access_token',  newAccessToken);
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

async function handleResponse(response, endpoint) {
    if (!response.ok) {
        const errorData    = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || errorData.message || `HTTP error ${response.status}`;
        throw new ApiError(errorMessage, response.status, endpoint);
    }
    if (response.status === 204) return null;
    const data = await response.json();
    return data.results ?? data;
}

const executeFetch = async (endpoint, options, token) => {
    const url     = `${API_BASE_URL}${endpoint}`;
    const headers = { ...options.headers };

    if (token) headers['Authorization'] = `Bearer ${token}`;

    // Only set Content-Type for JSON — let the browser set it for FormData
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, { ...options, headers });
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
                failedQueue.push({ resolve, reject });
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
                .finally(() => { isRefreshing = false; });
        });
    }
}

// Auth is delegated to services/auth/index.js
export { loginUser, registerUser, getCurrentUser } from '../auth/index.js';

// ─── TRACKS ──────────────────────────────────────────────────────────────────

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

export const getUserLibrary   = async () => {
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

// ─── ARTISTS ─────────────────────────────────────────────────────────────────

export const getArtists = async () => {
    const data = await fetchJson('/api/v1/artists/');
    return Array.isArray(data) ? data.map(normalizeArtistData) : [];
};

export const getArtistById = async (slugOrId) => {
    const data = await fetchJson(`/api/v1/artists/${slugOrId}/`);
    return normalizeArtistData(data);
};

/**
 * Update an artist's profile. Accepts a FormData so file uploads work.
 *
 * @param {string}   slugOrId
 * @param {FormData} formData  - Fields: name, description, image, banner.
 * @returns {Promise<Object>}  Normalized artist data.
 */
export const updateArtistProfile = async (slugOrId, formData) => {
    const data = await fetchJson(`/api/v1/artists/${slugOrId}/`, {
        method: 'PATCH',
        body:   formData,  // FormData — browser sets Content-Type multipart/form-data
    });
    return normalizeArtistData(data);
};

/**
 * Get social posts published by an artist.
 *
 * @param {string} slugOrId
 * @returns {Promise<Array>}
 */
export const getArtistPosts = async (slugOrId) => {
    const data = await fetchJson(`/api/v1/artists/${slugOrId}/posts/`);
    const posts = Array.isArray(data) ? data : (data.results || []);
    return posts.map(normalizePostData).filter(Boolean);
};

// ─── FEED & POSTS ─────────────────────────────────────────────────────────────

export const getFeedPosts = async ({ type, sort, contentType, pageParam = 1 } = {}) => {
    const params = new URLSearchParams();
    if (type)        params.append('feed_type',    type);
    if (sort)        params.append('sort',         sort);
    if (contentType) params.append('content_type', contentType);
    if (pageParam)   params.append('page',         pageParam);

    const qs       = params.toString();
    const data     = await fetchJson(`/api/v1/feed/${qs ? `?${qs}` : ''}`);
    const posts    = Array.isArray(data) ? data : (data.results || []);
    return posts.map(normalizePostData);
};

export const createPost = async (postData) => fetchJson('/api/v1/feed/posts/', { method: 'POST', body: postData });
export const toggleLikePost = async (postId) => fetchJson(`/api/v1/feed/posts/${postId}/like/`,   { method: 'POST' });
export const repostPost      = async (postId) => fetchJson(`/api/v1/feed/posts/${postId}/repost/`, { method: 'POST' });
export const toggleSavePost  = async (postId) => fetchJson(`/api/v1/feed/posts/${postId}/save/`,   { method: 'POST' });
export const reportPost      = async (postId, reason = 'spam') =>
    fetchJson(`/api/v1/feed/posts/${postId}/report/`, { method: 'POST', body: JSON.stringify({ reason }) });

export const addComment = async (postId, text) =>
    fetchJson(`/api/v1/feed/posts/${postId}/comments/`, { method: 'POST', body: JSON.stringify({ text }) });

// ─── SOCIAL / SEARCH ─────────────────────────────────────────────────────────

export const getFriendsActivity = async () => {
    const data = await fetchJson('/api/v1/friends/activity/');
    return Array.isArray(data) ? data.map(normalizeTrackData).filter(Boolean) : [];
};

export const searchGlobal = async (query) => {
    const [tracks, artists] = await Promise.all([
        fetchJson(`/api/v1/tracks/?search=${encodeURIComponent(query)}`),
        fetchJson(`/api/v1/artists/?search=${encodeURIComponent(query)}`),
    ]);
    return {
        tracks:  (Array.isArray(tracks)  ? tracks  : tracks.results  || []).map(normalizeTrackData),
        artists: (Array.isArray(artists) ? artists : artists.results || []).map(normalizeArtistData),
    };
};

// ─── USERS & PROFILES ─────────────────────────────────────────────────────────

export const getUserProfile = async (username) => {
    const data = await fetchJson(`/api/v1/users/${username}/`);
    return normalizeUserData(data);
};

/**
 * Update the current user's own profile.
 *
 * @param {string}           username
 * @param {FormData|Object}  payload  - Fields: first_name, last_name, bio, location, website, avatar (File).
 * @returns {Promise<Object>} Updated profile.
 */
export const updateUserProfile = async (username, payload) => {
    const isFormData = payload instanceof FormData;
    const data = await fetchJson(`/api/v1/users/${username}/`, {
        method: 'PATCH',
        body:   isFormData ? payload : JSON.stringify(payload),
    });
    return normalizeUserData(data);
};

export const toggleFollowUser = async (username) =>
    fetchJson(`/api/v1/users/${username}/follow/`, { method: 'POST' });

export const getUserPosts = async (username) => {
    const data = await fetchJson(`/api/v1/users/${username}/posts/`);
    return Array.isArray(data) ? data.map(normalizePostData) : [];
};

export const getUserFollowers = async (username) => {
    const data = await fetchJson(`/api/v1/users/${username}/followers/`);
    return Array.isArray(data) ? data.map(normalizeUserData) : [];
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

export const getNotifications = async () => {
    const data = await fetchJson('/api/v1/notifications/');
    return Array.isArray(data) ? data : (data.results || []);
};

export const markNotificationAsRead     = async (id) => fetchJson(`/api/v1/notifications/${id}/read/`, { method: 'POST' });
export const markAllNotificationsAsRead = async ()   => fetchJson('/api/v1/notifications/read-all/',   { method: 'POST' });

// ─── AUTH HELPERS ─────────────────────────────────────────────────────────────

export const requestPasswordReset = (email) =>
    fetchJson('/api/v1/auth/password/reset/', {
        method: 'POST',
        body:   JSON.stringify({ email }),
    });

export const confirmPasswordReset = (uid, token, newPassword) =>
    fetchJson('/api/v1/auth/password/reset/confirm/', {
        method: 'POST',
        body:   JSON.stringify({ uid, token, new_password: newPassword }),
    });

export const getSocialLoginUrl = (provider) =>
    `${API_BASE_URL}/api/v1/auth/${provider.toLowerCase()}/login/`;