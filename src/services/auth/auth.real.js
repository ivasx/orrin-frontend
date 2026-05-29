import { normalizeUserData } from '../../constants/fallbacks';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

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

async function authFetch(endpoint, options = {}) {
    const token = localStorage.getItem('access_token');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = extractErrorMessage(errorData) || `HTTP error ${response.status}`;
        const error = new Error(message);
        error.status = response.status;
        error.data = errorData;
        throw error;
    }

    if (response.status === 204) return null;
    return response.json();
}

export const login = async ({ username, password }) => {
    return authFetch('/api/v1/auth/token/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });
};

export const register = async (userData) => {
    return authFetch('/api/v1/auth/register/', {
        method: 'POST',
        body: JSON.stringify(userData),
    });
};

export const getMe = async () => {
    const data = await authFetch('/api/v1/users/me/');
    return normalizeUserData(data);
};