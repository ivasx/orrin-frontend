import { useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from '../services/api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { socketService } from '../services/socket/socket.service.js';
import { logger } from '../utils/logger.js';

export const NOTIFICATIONS_QUERY_KEY = ['notifications'];

export const useNotifications = () => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const { isLoggedIn } = useAuth();

    const {
        data: notifications = [],
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: NOTIFICATIONS_QUERY_KEY,
        queryFn: getNotifications,
        staleTime: 1000 * 60 * 2,
        enabled: !!isLoggedIn,
    });

    useEffect(() => {
        const handleNewNotification = (notification) => {
            logger.log('[Notifications] socket new_notification received', notification);
            queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, (prev = []) => [
                notification,
                ...prev,
            ]);
        };

        socketService.on('new_notification', handleNewNotification);

        return () => {
            socketService.off('new_notification');
        };
    }, [queryClient]);

    const unreadCount = useMemo(
        () => notifications.filter((n) => !n.isRead && !n.is_read).length,
        [notifications],
    );

    const markAsRead = useMutation({
        mutationFn: (id) => markNotificationAsRead(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
            const previous = queryClient.getQueryData(NOTIFICATIONS_QUERY_KEY);
            queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, (prev = []) =>
                prev.map((n) =>
                    n.id === id ? { ...n, isRead: true, is_read: true } : n,
                ),
            );
            return { previous };
        },
        onError: (err, _id, context) => {
            logger.error(t('notifications.errors.mark_read_failed'), err);
            if (context?.previous) {
                queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, context.previous);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
        },
    });

    const markAllAsRead = useMutation({
        mutationFn: markAllNotificationsAsRead,
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
            const previous = queryClient.getQueryData(NOTIFICATIONS_QUERY_KEY);
            queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, (prev = []) =>
                prev.map((n) => ({ ...n, isRead: true, is_read: true })),
            );
            return { previous };
        },
        onError: (err, _vars, context) => {
            logger.error(t('notifications.errors.mark_all_read_failed'), err);
            if (context?.previous) {
                queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, context.previous);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
        },
    });

    return {
        notifications,
        unreadCount,
        isLoading,
        isError,
        error,
        markAsRead: markAsRead.mutate,
        markAllAsRead: markAllAsRead.mutate,
        isMarkingAsRead: markAsRead.isPending,
        isMarkingAllAsRead: markAllAsRead.isPending,
    };
};