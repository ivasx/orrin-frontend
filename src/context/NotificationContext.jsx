import { createContext, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext';
import { useNotifications as useNotificationsHook } from '../hooks/useNotifications.jsx';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const { isLoggedIn } = useAuth();

    const {
        notifications: rawNotifications,
        unreadCount: rawUnreadCount,
        isLoading,
        isError,
        error,
        markAsRead,
        markAllAsRead,
        isMarkingAsRead,
        isMarkingAllAsRead,
    } = useNotificationsHook();

    const notifications = useMemo(
        () => (isLoggedIn ? rawNotifications : []),
        [isLoggedIn, rawNotifications],
    );

    const unreadCount = useMemo(
        () => (isLoggedIn ? rawUnreadCount : 0),
        [isLoggedIn, rawUnreadCount],
    );

    const value = useMemo(
        () => ({
            notifications,
            unreadCount,
            isLoading: isLoggedIn ? isLoading : false,
            isError,
            error,
            markAsRead,
            markAllAsRead,
            isMarkingAsRead,
            isMarkingAllAsRead,
        }),
        [
            notifications,
            unreadCount,
            isLoggedIn,
            isLoading,
            isError,
            error,
            markAsRead,
            markAllAsRead,
            isMarkingAsRead,
            isMarkingAllAsRead,
        ],
    );

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

NotificationProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};