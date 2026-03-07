import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUser } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('access_token'));
    const [isLoading, setIsLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        try {
            const userData = await getCurrentUser();
            setUser(userData);
        } catch (error) {
            logout();
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (token) {
            fetchUser();
        } else {
            setIsLoading(false);
        }
    }, [token, fetchUser]);

    const login = (newToken, newRefreshToken = null, userData = null) => {
        localStorage.setItem('access_token', newToken);
        if (newRefreshToken) {
            localStorage.setItem('refresh_token', newRefreshToken);
        }
        setToken(newToken);
        if (userData) {
            setUser(userData);
        } else {
            fetchUser();
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        isLoggedIn: !!token,
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