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

async function handleResponse(response, endpoint) {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
            errorData.message || `HTTP error ${response.status}`,
            response.status,
            endpoint
        );
    }

    if (response.status === 204) {
        return null;
    }
    const data = await response.json();
    return data.results || data;
}

function getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function fetchJson(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const isFormData = options.body instanceof FormData;

    const headers = {
        ...getAuthHeaders(),
        ...options.headers,
    };

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    try {
        const response = await fetch(url, { ...options, headers });
        return await handleResponse(response, endpoint);
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(error.message || 'Network error', 0, endpoint);
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