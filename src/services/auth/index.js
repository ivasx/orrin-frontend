import * as realAuth from './auth.real';
import * as mockAuth from './auth.mock';

const useMock = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

if (useMock) {
    console.warn('⚠️ AUTH SERVICE: Running in MOCK mode');
}

const authProvider = useMock ? mockAuth : realAuth;
export const loginUser = authProvider.login;
export const registerUser = authProvider.register;
export const getCurrentUser = authProvider.getMe;