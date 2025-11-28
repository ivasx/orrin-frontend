/* src/services/api.js */
import { ways, popularArtists } from '../data.js'; // Імпортуємо мок-дані

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

async function fetchJson(endpoint, options = {}) {
    // ... старий код fetchJson залишаємо або замінюємо логікою нижче
    const url = `${API_BASE_URL}${endpoint}`;
    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const data = await response.json();
        return data.results || data;
    } catch (error) {
        console.warn(`API fetch failed for ${endpoint}, falling back to mock data.`);
        return null; // Повертаємо null, щоб функції нижче використали мок-дані
    }
}

/**
 * Отримує список треків (з API або мок-даних)
 */
export const getTracks = async () => {
    // Спробуємо отримати з API, якщо не вийде - повернемо ways
    try {
        // Якщо ви розробляєте без бекенду, можна одразу повертати ways:
        return Promise.resolve(ways);

        // const data = await fetchJson('/api/v1/tracks/');
        // return data || ways;
    } catch (e) {
        return ways;
    }
};

/**
 * Отримує один трек за slug/id
 */
export const getTrackBySlug = async (slug) => {
    // Шукаємо в мок-даних
    const mockTrack = ways.find(t => t.trackId === slug || String(t.id) === slug);

    if (mockTrack) {
        // Емулюємо затримку мережі для реалістичності (опціонально)
        // await new Promise(resolve => setTimeout(resolve, 300));
        return Promise.resolve(mockTrack);
    }

    // Якщо в моках немає, можна спробувати API
    return fetchJson(`/api/v1/tracks/${slug}/`);
};

/**
 * Отримує список артистів
 */
export const getArtists = async () => {
    return Promise.resolve(popularArtists);
};

/**
 * Отримує артиста за ID
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