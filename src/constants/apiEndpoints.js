export const API_ENDPOINTS = {
    TRACKS: '/api/tracks/',
    ARTISTS: '/api/artists/',
    USER_FEED: '/api/users/feed/',
    USER_ME: '/api/users/me/',
    AUTH: {
        LOGIN: '/api/token/',
        REFRESH: '/api/token/refresh/',
        REGISTER: '/api/users/register/',
    },
    ARTIST_DETAIL: (id) => `/api/artists/${id}/`,
    TRACK_DETAIL: (id) => `/api/tracks/${id}/`,
};

export const buildUrl = (endpoint, params = {}) => {
    const url = new URL(endpoint, window.location.origin);
    Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
            url.searchParams.append(key, params[key]);
        }
    });
    return url.pathname + url.search;
};