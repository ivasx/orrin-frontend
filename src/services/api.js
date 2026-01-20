import {
    normalizeTrackData,
    normalizeArtistData,
    normalizePostData,
    normalizeUserData
} from '../constants/fallbacks';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
    constructor(message, status = null, endpoint = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.endpoint = endpoint;
    }
}

/**
 * Helper to handle fetch responses
 */
async function handleResponse(response, endpoint) {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
            errorData.message || `HTTP error ${response.status}`,
            response.status,
            endpoint
        );
    }
    const data = await response.json();
    // Support Django Rest Framework standard pagination: { count: 100, results: [...] }
    return data.results || data;
}

/**
 * Helper to get auth headers
 */
function getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

/**
 * Generic fetch wrapper
 */
async function fetchJson(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers,
    };

    try {
        const response = await fetch(url, { ...options, headers });
        return await handleResponse(response, endpoint);
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(error.message || 'Network error', 0, endpoint);
    }
}

/* --- TRACKS --- */

export const getTracks = async () => {
    const data = await fetchJson('/api/v1/tracks/');
    // Map transforms each item using the normalizer
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

/* --- ARTISTS --- */

export const getArtists = async () => {
    const data = await fetchJson('/api/v1/artists/');
    return Array.isArray(data) ? data.map(normalizeArtistData) : [];
};

export const getArtistById = async (slugOrId) => {
    const data = await fetchJson(`/api/v1/artists/${slugOrId}/`);
    return normalizeArtistData(data);
};

/* --- FEED --- */

export const getFeedPosts = async ({ type, sort, contentType } = {}) => {
    const queryParams = new URLSearchParams();
    if (type) queryParams.append('feed_type', type);
    if (sort) queryParams.append('sort', sort);
    if (contentType) queryParams.append('content_type', contentType);

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/feed/${queryString ? `?${queryString}` : ''}`;

    const data = await fetchJson(endpoint);
    // Normalize feed items (converts likes_count -> likesCount, etc.)
    return Array.isArray(data) ? data.map(normalizePostData) : [];
};

/* --- USER & FRIENDS --- */

export const getFriendsActivity = async () => {
    const data = await fetchJson('/api/v1/friends/activity/');
    // Assuming friends activity returns a list of tracks they listened to
    return Array.isArray(data) ? data.map(normalizeTrackData).filter(Boolean) : [];
};

export const getCurrentUser = async () => {
    const data = await fetchJson('/api/v1/users/me/');
    return normalizeUserData(data);
};