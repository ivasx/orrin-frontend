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
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.detail || errorData.message || `HTTP error ${response.status}`;
        throw new Error(message);
    }

    if (response.status === 204) return null;
    return response.json();
}

// SimpleJWT expects { email, password } because USERNAME_FIELD = 'email',
// but our custom backend EmailOrUsernameModelBackend reads from 'username' key.
// We send it as 'username' — the backend handles both email and username values.
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
