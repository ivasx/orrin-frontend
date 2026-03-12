import {
    normalizeTrackData,
    normalizeArtistData,
    normalizePostData,
    normalizeUserData
} from '../constants/fallbacks';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export class ApiError extends Error {
    constructor(message, status = null, endpoint = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.endpoint = endpoint;
    }
}

// Synchronous initialization to prevent race conditions on initial mount
let inMemoryAccessToken = localStorage.getItem('access_token');
let isRefreshing = false;
let failedQueue = [];
let onSessionExpiredCallback = () => {};

export const setAccessToken = (token) => {
    inMemoryAccessToken = token;
};

export const setSessionExpiredCallback = (callback) => {
    onSessionExpiredCallback = callback;
};

const processQueue = (error, token = null) => {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(token);
        }
    });
    failedQueue = [];
};

const refreshAuthToken = async () => {
    try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            throw new Error('Refresh token is missing');
        }

        const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!response.ok) {
            throw new Error('Refresh token request failed');
        }

        const data = await response.json();
        const newAccessToken = data.access || data.access_token;
        const newRefreshToken = data.refresh || data.refresh_token || refreshToken;

        setAccessToken(newAccessToken);
        localStorage.setItem('access_token', newAccessToken);
        localStorage.setItem('refresh_token', newRefreshToken);

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
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || errorData.message || `HTTP error ${response.status}`;
        throw new ApiError(errorMessage, response.status, endpoint);
    }

    if (response.status === 204) {
        return null;
    }

    const data = await response.json();
    return data.results || data;
}

const executeFetch = async (endpoint, options, token) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = { ...options.headers };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
        throw new ApiError('Unauthorized', 401, endpoint);
    }

    return handleResponse(response, endpoint);
};

export async function fetchJson(endpoint, options = {}) {
    try {
        return await executeFetch(endpoint, options, inMemoryAccessToken);
    } catch (error) {
        if (error.status === 401) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => executeFetch(endpoint, options, token))
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
        throw error;
    }
}

export const loginUser = async (credentials) => {
    return fetchJson('/api/v1/auth/token/', {
        method: 'POST',
        body: JSON.stringify(credentials)
    });
};

export const registerUser = async (userData) => {
    return fetchJson('/api/v1/auth/register/', {
        method: 'POST',
        body: JSON.stringify(userData)
    });
};

export const getTracks = async () => {
    const data = await fetchJson('/api/v1/tracks/');
    return Array.isArray(data) ? data.map(normalizeTrackData).filter(Boolean) : [];
};

export const getTracksByIds = async (trackIds = []) => {
    if (trackIds.length === 0) return [];
    const data = await fetchJson(`/api/v1/tracks/?ids=${trackIds.join(',')}`);
    return Array.isArray(data) ? data.map(normalizeTrackData).filter(Boolean) : [];
};

export const getTrackBySlug = async (slug) => {
    const data = await fetchJson(`/api/v1/tracks/${slug}/`);
    return normalizeTrackData(data);
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
    const tracksRaw = Array.isArray(data) ? data : (data.results || []);
    return Array.isArray(tracksRaw) ? tracksRaw.map(normalizeTrackData).filter(Boolean) : [];
};

export const getArtists = async () => {
    const data = await fetchJson('/api/v1/artists/');
    return Array.isArray(data) ? data.map(normalizeArtistData) : [];
};

export const getArtistById = async (slugOrId) => {
    const data = await fetchJson(`/api/v1/artists/${slugOrId}/`);
    return normalizeArtistData(data);
};

export const getFeedPosts = async ({ type, sort, contentType } = {}) => {
    const queryParams = new URLSearchParams();
    if (type) queryParams.append('feed_type', type);
    if (sort) queryParams.append('sort', sort);
    if (contentType) queryParams.append('content_type', contentType);

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/feed/${queryString ? `?${queryString}` : ''}`;

    const data = await fetchJson(endpoint);
    return Array.isArray(data) ? data.map(normalizePostData) : [];
};

export const createPost = async (postData) => {
    return fetchJson('/api/v1/feed/posts/', {
        method: 'POST',
        body: postData
    });
};

export const toggleLikePost = async (postId) => {
    return fetchJson(`/api/v1/feed/posts/${postId}/like/`, { method: 'POST' });
};

export const repostPost = async (postId) => {
    return fetchJson(`/api/v1/feed/posts/${postId}/repost/`, { method: 'POST' });
};

export const addComment = async (postId, text) => {
    return fetchJson(`/api/v1/feed/posts/${postId}/comments/`, {
        method: 'POST',
        body: JSON.stringify({ text })
    });
};

export const toggleSavePost = async (postId) => {
    return fetchJson(`/api/v1/feed/posts/${postId}/save/`, { method: 'POST' });
};

export const reportPost = async (postId, reason = 'spam') => {
    return fetchJson(`/api/v1/feed/posts/${postId}/report/`, {
        method: 'POST',
        body: JSON.stringify({ reason })
    });
};

export const getFriendsActivity = async () => {
    const data = await fetchJson('/api/v1/friends/activity/');
    return Array.isArray(data) ? data.map(normalizeTrackData).filter(Boolean) : [];
};

export const getCurrentUser = async () => {
    const data = await fetchJson('/api/v1/users/me/');
    return normalizeUserData(data);
};

export const searchGlobal = async (query) => {
    const [tracks, artists] = await Promise.all([
        fetchJson(`/api/v1/tracks/?search=${encodeURIComponent(query)}`),
        fetchJson(`/api/v1/artists/?search=${encodeURIComponent(query)}`)
    ]);

    const normalizedTracks = (Array.isArray(tracks) ? tracks : tracks.results || []).map(normalizeTrackData);
    const normalizedArtists = (Array.isArray(artists) ? artists : artists.results || []).map(normalizeArtistData);

    return {
        tracks: normalizedTracks,
        artists: normalizedArtists
    };
};

export const getUserProfile = async (username) => {
    const data = await fetchJson(`/api/v1/users/${username}/`);
    return normalizeUserData(data);
};

export const toggleFollowUser = async (username) => {
    return fetchJson(`/api/v1/users/${username}/follow/`, { method: 'POST' });
};

export const getUserPosts = async (username) => {
    const data = await fetchJson(`/api/v1/users/${username}/posts/`);
    return Array.isArray(data) ? data.map(normalizePostData) : [];
};

export const getUserFollowers = async (username) => {
    const data = await fetchJson(`/api/v1/users/${username}/followers/`);
    return Array.isArray(data) ? data.map(normalizeUserData) : [];
};

export const getNotifications = async () => {
    const data = await fetchJson('/api/v1/notifications/');
    return Array.isArray(data) ? data : (data.results || []);
};

export const markNotificationAsRead = async (id) => {
    return fetchJson(`/api/v1/notifications/${id}/read/`, { method: 'POST' });
};

export const markAllNotificationsAsRead = async () => {
    return fetchJson('/api/v1/notifications/read-all/', { method: 'POST' });
};