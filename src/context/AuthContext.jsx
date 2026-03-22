import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUser, setAccessToken, setSessionExpiredCallback } from '../services/api/api.real.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access_token'));
    const [isLoading, setIsLoading] = useState(true);

    const logout = useCallback(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setAccessToken(null);
        setUser(null);
        setIsLoggedIn(false);
    }, []);

    useEffect(() => {
        setSessionExpiredCallback(logout);
    }, [logout]);

    const fetchUser = useCallback(async () => {
        try {
            const userData = await getCurrentUser();
            setUser(userData);
            setIsLoggedIn(true);
        } catch (error) {
            logout();
        } finally {
            setIsLoading(false);
        }
    }, [logout]);

    useEffect(() => {
        if (isLoggedIn) {
            fetchUser();
        } else {
            setIsLoading(false);
        }
    }, [isLoggedIn, fetchUser]);

    const login = useCallback((newToken, newRefreshToken = null, userData = null) => {
        localStorage.setItem('access_token', newToken);
        if (newRefreshToken) {
            localStorage.setItem('refresh_token', newRefreshToken);
        }
        setAccessToken(newToken);
        setIsLoggedIn(true);

        if (userData) {
            setUser(userData);
        } else {
            fetchUser();
        }
    }, [fetchUser]);

    const value = {
        user,
        isLoggedIn,
        isLoading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};