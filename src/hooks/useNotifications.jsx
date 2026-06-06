import {useEffect, useMemo} from 'react';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useTranslation} from 'react-i18next';
import {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from '../services/api/index.js';
import {useAuth} from '../context/AuthContext.jsx';
import {socketService} from '../services/socket/socket.service.js';
import {logger} from '../utils/logger.js';

export const NOTIFICATIONS_QUERY_KEY = ['notifications'];

/**
 * Normalises a single notification into a unified shape.
 * Handles both the old snake_case mock format and the new
 * camelCase backend format from NotificationSerializer.
 */
const normalizeNotification = (raw) => {
    if (!raw) return null;

    const actor = raw.actor ?? {};

    return {
        id: raw.id,
        // New backend: `type`; old mock: `notification_type`
        type: raw.type || raw.notification_type,
        notification_type: raw.type || raw.notification_type,
        // New backend: `isRead`; old mock: `is_read`
        isRead: raw.isRead ?? raw.is_read ?? false,
        is_read: raw.isRead ?? raw.is_read ?? false,
        // New backend: `timestamp`; old mock: `created_at`
        timestamp: raw.timestamp || raw.created_at,
        created_at: raw.timestamp || raw.created_at,

        actor: {
            id: actor.id,
            name: actor.name || actor.username || '',
            username: actor.username || '',
            // New backend: `avatarUrl`; old mock: `avatarUrl` (already camel)
            avatarUrl: actor.avatarUrl || actor.avatar_url || actor.avatar || null,
        },

        // New backend: `entity { id, title, coverUrl }`; old mock: null
        entity: raw.entity
            ? {
                id: raw.entity.id,
                title: raw.entity.title,
                coverUrl: raw.entity.coverUrl || raw.entity.cover_url || null,
            }
            : null,

        // Keep raw text for old mock notifications
        text: raw.text || '',
    };
};

export const useNotifications = () => {
    const {t} = useTranslation();
    const queryClient = useQueryClient();
    const {isLoggedIn} = useAuth();

    const {
        data: rawNotifications = [],
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: NOTIFICATIONS_QUERY_KEY,
        queryFn: getNotifications,
        staleTime: 1000 * 60 * 2,
        enabled: !!isLoggedIn,
        select: (data) => data.map(normalizeNotification).filter(Boolean),
    });

    // WebSocket: push new notification into cache
    useEffect(() => {
        const handleNewNotification = (raw) => {
            logger.log('[Notifications] socket new_notification received', raw);
            const normalized = normalizeNotification(raw);
            if (!normalized) return;
            queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, (prev = []) => [
                normalized,
                ...prev,
            ]);
        };

        socketService.on('new_notification', handleNewNotification);
        return () => socketService.off('new_notification', handleNewNotification);
    }, [queryClient]);

    const unreadCount = useMemo(
        () => rawNotifications.filter((n) => !n.isRead).length,
        [rawNotifications],
    );

    // ── mark single as read ───────────────────────────────────────────────────
    const markAsRead = useMutation({
        mutationFn: (id) => markNotificationAsRead(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({queryKey: NOTIFICATIONS_QUERY_KEY});
            const previous = queryClient.getQueryData(NOTIFICATIONS_QUERY_KEY);
            queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, (prev = []) =>
                prev.map((n) =>
                    n.id === id ? {...n, isRead: true, is_read: true} : n,
                ),
            );
            return {previous};
        },
        onError: (err, _id, context) => {
            logger.error(t('notifications.errors.mark_read_failed'), err);
            if (context?.previous) {
                queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, context.previous);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({queryKey: NOTIFICATIONS_QUERY_KEY});
        },
    });

    // ── mark all as read ──────────────────────────────────────────────────────
    const markAllAsRead = useMutation({
        mutationFn: markAllNotificationsAsRead,
        onMutate: async () => {
            await queryClient.cancelQueries({queryKey: NOTIFICATIONS_QUERY_KEY});
            const previous = queryClient.getQueryData(NOTIFICATIONS_QUERY_KEY);
            queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, (prev = []) =>
                prev.map((n) => ({...n, isRead: true, is_read: true})),
            );
            return {previous};
        },
        onError: (err, _vars, context) => {
            logger.error(t('notifications.errors.mark_all_read_failed'), err);
            if (context?.previous) {
                queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, context.previous);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({queryKey: NOTIFICATIONS_QUERY_KEY});
        },
    });

    return {
        notifications: rawNotifications,
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
