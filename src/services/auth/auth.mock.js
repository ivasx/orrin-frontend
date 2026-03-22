import { mockUsers } from '../../data/mockData';
import { logger } from '../../utils/logger';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const login = async (credentials) => {
    await delay(800);
    logger.log('[Mock Auth] Login attempt:', credentials);

    if (credentials.password && credentials.password.length < 4) {
        throw new Error('Невірний логін або пароль');
    }

    return {
        access: 'mock_access_token_' + Date.now(),
        refresh: 'mock_refresh_token_' + Date.now()
    };
};

export const register = async (userData) => {
    await delay(1000);
    logger.log('[Mock Auth] Register data:', userData);

    return {
        access: 'mock_access_token_' + Date.now(),
        refresh: 'mock_refresh_token_' + Date.now()
    };
};

export const getMe = async () => {
    await delay(400);
    return mockUsers[0] || null;
};