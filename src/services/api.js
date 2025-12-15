import { ways, popularArtists } from '../data.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

async function fetchJson(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const data = await response.json();
        return data.results || data;
    } catch (error) {
        console.warn(`API fetch failed for ${endpoint}, falling back to mock data.`);
        return null;
    }
}

/**
 * Gets a list of tracks (from API or mock data)
 */
export const getTracks = async () => {
    try {
        return Promise.resolve(ways);
    } catch (e) {
        return ways;
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
 * Gets artists list
 */
export const getArtists = async () => {
    return Promise.resolve(popularArtists);
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