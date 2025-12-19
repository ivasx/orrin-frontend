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
 * Delays execution for specified milliseconds
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetches JSON data from API endpoint with retry logic
 * @param {string} endpoint - API endpoint path
 * @param {Object} options - Fetch options
 * @param {number} retries - Number of retry attempts (default: 2)
 * @returns {Promise<any>} - Parsed JSON data
 * @throws {ApiError} - If request fails after all retries
 */
async function fetchJson(endpoint, options = {}, retries = 2) {
    const url = `${API_BASE_URL}${endpoint}`;
    let lastError;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const apiError = new ApiError(
                    errorData.message || `HTTP error ${response.status}`,
                    response.status,
                    endpoint
                );
                
                // Retry on 5xx errors (server errors)
                if (response.status >= 500 && attempt < retries) {
                    const delayMs = (attempt + 1) * 1000; // Exponential backoff: 1s, 2s, 3s...
                    await delay(delayMs);
                    lastError = apiError;
                    continue;
                }
                
                throw apiError;
            }
            
            const data = await response.json();
            return data.results || data;
        } catch (error) {
            // If it's already an ApiError, handle retry logic
            if (error instanceof ApiError) {
                // If it's a 5xx error and we have retries left, continue
                if (error.status >= 500 && attempt < retries) {
                    const delayMs = (attempt + 1) * 1000;
                    await delay(delayMs);
                    lastError = error;
                    continue;
                }
                // Otherwise, throw it
                throw error;
            }
            
            // Network errors - retry if we have attempts left
            if (error instanceof TypeError && error.message.includes('fetch')) {
                if (attempt < retries) {
                    const delayMs = (attempt + 1) * 1000;
                    await delay(delayMs);
                    lastError = new ApiError('Network error', 0, endpoint);
                    continue;
                }
                throw new ApiError('Network error', 0, endpoint);
            }
            
            // Other errors - retry if we have attempts left
            if (attempt < retries) {
                const delayMs = (attempt + 1) * 1000;
                await delay(delayMs);
                lastError = new ApiError(error.message || 'Unknown error', 0, endpoint);
                continue;
            }
            
            throw new ApiError(error.message || 'Unknown error', 0, endpoint);
        }
    }
    
    // If we exhausted all retries, throw the last error
    throw lastError || new ApiError('Request failed after retries', 0, endpoint);
}

/**
 * Gets a list of tracks (from API or mock data)
 * If VITE_USE_MOCK_DATA is 'true', returns mock data immediately
 */
export const getTracks = async () => {
    // Check if mock data should be used
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        return ways;
    }
    
    try {
        // Fetch from API
        const apiData = await fetchJson('/api/v1/tracks/');
        
        // If API returns null or empty, handle it
        if (apiData === null || (Array.isArray(apiData) && apiData.length === 0)) {
            throw new ApiError('API returned empty result', null, '/api/v1/tracks/');
        }
        
        return apiData;
    } catch (error) {
        // If API error occurred
        if (error instanceof ApiError) {
            throw error;
        }
        
        // Other unexpected errors
        throw new ApiError(error.message || 'Unknown error when loading tracks', 0, '/api/v1/tracks/');
    }
};

/**
 * Gets list of tracks per slug
 * GET /api/v1/tracks/?ids=id1,id2,id3
 */
export const getTracksByIds = async (trackIds = []) => {
    if (trackIds.length === 0) return [];

    // Check if mock data should be used
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        const foundTracks = ways.filter(track => trackIds.includes(track.trackId));
        return Promise.resolve(foundTracks);
    }

    try {
        const data = await fetchJson(`/api/v1/tracks/?ids=${trackIds.join(',')}`);
        return data || [];
    } catch (error) {
        // Fallback to mock data if API fails
        const foundTracks = ways.filter(track => trackIds.includes(track.trackId));
        return Promise.resolve(foundTracks);
    }
};

/**
 * Gets one track by slug
 */
export const getTrackBySlug = async (slug) => {
    // Check if mock data should be used
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        const mockTrack = ways.find(t => t.trackId === slug || String(t.id) === slug);
        if (mockTrack) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return Promise.resolve(mockTrack);
        }
        throw new ApiError(`Track with slug "${slug}" not found in mock data`, 404, `/api/v1/tracks/${slug}/`);
    }

    try {
        return await fetchJson(`/api/v1/tracks/${slug}/`);
    } catch (error) {
        // Fallback to mock data if API fails
        const mockTrack = ways.find(t => t.trackId === slug || String(t.id) === slug);
        if (mockTrack) {
            return Promise.resolve(mockTrack);
        }
        throw error;
    }
};

/**
 * Gets artists list (from API or mock data)
 * If VITE_USE_MOCK_DATA is 'true', returns mock data immediately
 */
export const getArtists = async () => {
    // Check if mock data should be used
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        return popularArtists;
    }
    
    try {
        // Fetch from API
        const apiData = await fetchJson('/api/v1/artists/');
        
        // If API returns null or empty, handle it
        if (apiData === null || (Array.isArray(apiData) && apiData.length === 0)) {
            throw new ApiError('API returned empty result', null, '/api/v1/artists/');
        }
        
        return apiData;
    } catch (error) {
        // If API error occurred
        if (error instanceof ApiError) {
            throw error;
        }
        
        // Other unexpected errors
        throw new ApiError(error.message || 'Unknown error when loading artists', 0, '/api/v1/artists/');
    }
};

/**
 * Gets one artist per ID
 */
export const getArtistById = async (slugOrId) => {
    // Check if mock data should be used
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        const artist = popularArtists.find(a =>
            String(a.id) === String(slugOrId) || a.slug === slugOrId
        );

        if (artist) {
            return Promise.resolve(artist);
        }

        throw new ApiError(`Artist with id/slug "${slugOrId}" not found in mock data`, 404, `/api/v1/artists/${slugOrId}/`);
    }

    try {
        return await fetchJson(`/api/v1/artists/${slugOrId}/`);
    } catch (error) {
        // Fallback to mock data if API fails
        const artist = popularArtists.find(a =>
            String(a.id) === String(slugOrId) || a.slug === slugOrId
        );

        if (artist) {
            return Promise.resolve(artist);
        }

        throw error;
    }
};