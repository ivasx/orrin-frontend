import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/api/index.js';
import { logger } from '../utils/logger';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const { token, isLoggedIn } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchInitialNotifications = useCallback(async () => {
        try {
            const data = await getNotifications();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (error) {
            logger.error('Failed to fetch notifications', error);
        }
    }, []);

    useEffect(() => {
        if (!isLoggedIn) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        fetchInitialNotifications();

        // Skip WebSocket entirely in mock mode
        const isMockMode = import.meta.env.VITE_USE_MOCK_DATA === 'true';
        if (isMockMode) return;

        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = import.meta.env.VITE_WS_BASE_URL || window.location.host;
        let ws;

        const connectWebSocket = () => {
            ws = new WebSocket(`${wsProtocol}//${wsHost}/ws/notifications/?token=${token}`);

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'notification') {
                    setNotifications(prev => [data.payload, ...prev]);
                    setUnreadCount(prev => prev + 1);
                }
            };

            ws.onclose = () => {
                setTimeout(connectWebSocket, 5000);
            };
        };

        connectWebSocket();

        return () => {
            if (ws) ws.close();
        };
    }, [isLoggedIn, token, fetchInitialNotifications]);

    const readNotification = async (id) => {
        try {
            await markNotificationAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            logger.error('Failed to mark notification as read', error);
        }
    };

    const readAll = async () => {
        try {
            await markAllNotificationsAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            logger.error('Failed to mark all as read', error);
        }
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, readNotification, readAll }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};