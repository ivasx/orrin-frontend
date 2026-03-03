import { normalizeUserData } from '../../constants/fallbacks';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

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
        headers
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error ${response.status}`);
    }

    const data = await response.json();
    return data;
}

export const login = async (credentials) => {
    return authFetch('/api/v1/auth/token/', {
        method: 'POST',
        body: JSON.stringify(credentials)
    });
};

export const register = async (userData) => {
    return authFetch('/api/v1/auth/register/', {
        method: 'POST',
        body: JSON.stringify(userData)
    });
};

export const getMe = async () => {
    const data = await authFetch('/api/v1/users/me/');
    return normalizeUserData(data);
};