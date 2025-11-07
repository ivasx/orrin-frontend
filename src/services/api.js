import { normalizeTrackData, normalizeArtistData } from '../constants/fallbacks.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// Універсальна функція для обробки запитів та помилок
async function fetchJson(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            // Спробуємо отримати деталі помилки з JSON відповіді (якщо є)
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { detail: `HTTP error ${response.status}` };
            }
            // Створюємо об'єкт помилки з деталями
            const error = new Error(errorData.detail || `HTTP error ${response.status}`);
            error.status = response.status;
            error.data = errorData; // Додаємо дані помилки для можливої обробки
            throw error;
        }

        // Обробка порожньої відповіді (напр., 204 No Content)
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return null;
        }

        const data = await response.json();
        // Якщо API використовує пагінацію DRF, дані часто знаходяться у 'results'
        return data.results || data; // Повертаємо або 'results', або весь об'єкт

    } catch (error) {
        console.error(`API call failed: ${error.message}`, { endpoint, options, error });
        // Перекидаємо помилку далі, щоб useQuery міг її обробити
        throw error;
    }
}

// Функції для конкретних ендпоінтів

/**
 * Отримує список треків.
 * @returns {Promise<Array<object>>} Масив об'єктів треків
 */
export const getTracks = async () => {
    return fetchJson('/api/v1/tracks/');
};

/**
 * Отримує деталі одного треку за його slug.
 * @param {string} slug - Слаг треку
 * @returns {Promise<object>} Об'єкт треку
 */
export const getTrackBySlug = async (slug) => {
    if (!slug) throw new Error("Slug is required to fetch a track.");
    return fetchJson(`/api/v1/tracks/${slug}/`);
};

/**
 * Отримує список артистів.
 * @returns {Promise<Array<object>>} Масив об'єктів артистів
 */
export const getArtists = async () => {
    return fetchJson('/api/v1/artists/');
};

/**
 * Отримує деталі одного артиста за його slug або ID.
 * @param {string|number} slugOrId - Слаг або ID артиста
 * @returns {Promise<object>} Об'єкт артиста
 */
export const getArtistById = async (slugOrId) => {
    if (!slugOrId) throw new Error("Slug or ID is required to fetch an artist.");
    return fetchJson(`/api/v1/artists/${slugOrId}/`);
};