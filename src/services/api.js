import { ways, popularArtists } from '../data.js';

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
 * Fetches JSON data from API endpoint
 * @param {string} endpoint - API endpoint path
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - Parsed JSON data
 * @throws {ApiError} - If request fails
 */
async function fetchJson(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(
                errorData.message || `HTTP error ${response.status}`,
                response.status,
                endpoint
            );
        }
        
        const data = await response.json();
        return data.results || data;
    } catch (error) {
        // If it's already an ApiError, re-throw it
        if (error instanceof ApiError) {
            throw error;
        }
        
        // Network errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new ApiError('Network error', 0, endpoint);
        }
        
        // Other errors
        throw new ApiError(error.message || 'Unknown error', 0, endpoint);
    }
}

/**
 * Gets a list of tracks (from API or mock data)
 * First tries to fetch from API, falls back to mock data in dev mode
 */
export const getTracks = async () => {
    try {
        // First, try to fetch from API
        const apiData = await fetchJson('/api/v1/tracks/');
        
        // If API returns null or empty, handle it
        if (apiData === null || (Array.isArray(apiData) && apiData.length === 0)) {
            if (import.meta.env.DEV) {
                console.warn('API returned null or empty result, mock data is used.');
                return ways;
            }
            throw new ApiError('API returned empty result', null, '/api/v1/tracks/');
        }
        
        return apiData;
    } catch (error) {
        // If API error occurred
        if (error instanceof ApiError) {
            if (import.meta.env.DEV) {
                console.warn(`API not available for ${error.endpoint || '/api/v1/tracks/'}, mock data is used. Error:`, error.message);
                return ways;
            }
            // In production, throw the error
            throw error;
        }
        
        // Other unexpected errors
        if (import.meta.env.DEV) {
            console.warn('Unexpected error when loading tracks, mock data is used:', error);
            return ways;
        }
        throw error;
    }
};

/**
 * Gets list of tracks per slug
 * GET /api/v1/tracks/?ids=id1,id2,id3
 */
export const getTracksByIds = async (trackIds = []) => {
    if (trackIds.length === 0) return [];

    const foundTracks = ways.filter(track => trackIds.includes(track.trackId));

    /*
    const data = await fetchJson(`/api/v1/tracks/?ids=${trackIds.join(',')}`);
    return data || foundTracks;
    */

    return Promise.resolve(foundTracks);
};

/**
 * Gets one track by slug
 */
export const getTrackBySlug = async (slug) => {
    const mockTrack = ways.find(t => t.trackId === slug || String(t.id) === slug);

    if (mockTrack) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return Promise.resolve(mockTrack);
    }

    return fetchJson(`/api/v1/tracks/${slug}/`);
};

/**
 * Gets artists list (from API or mock data)
 * First tries to fetch from API, falls back to mock data in dev mode
 */
export const getArtists = async () => {
    try {
        // First, try to fetch from API
        const apiData = await fetchJson('/api/v1/artists/');
        
        // If API returns null or empty, handle it
        if (apiData === null || (Array.isArray(apiData) && apiData.length === 0)) {
            if (import.meta.env.DEV) {
                console.warn('API returned null or empty result, mock data is being used');
                return popularArtists;
            }
            throw new ApiError('API returned empty result', null, '/api/v1/artists/');
        }
        
        return apiData;
    } catch (error) {
        // If API error occurred
        if (error instanceof ApiError) {
            if (import.meta.env.DEV) {
                console.warn(`API is not available for ${error.endpoint || '/api/v1/artists/'}, mock data is used. Error:`, error.message);
                return popularArtists;
            }
            // In production, throw the error
            throw error;
        }
        
        // Other unexpected errors
        if (import.meta.env.DEV) {
            console.warn('Unexpected error loading artists, using mock data:', error);
            return popularArtists;
        }
        throw error;
    }
};

/**
 * Gets one artist per ID
 */
export const getArtistById = async (slugOrId) => {
    const artist = popularArtists.find(a =>
        String(a.id) === String(slugOrId) || a.slug === slugOrId
    );

    if (artist) {
        return Promise.resolve(artist);
    }

    throw new Error("Artist not found in mock data");
};