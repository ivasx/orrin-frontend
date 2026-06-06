import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext.jsx';
import { getUserChats } from '../services/api/index.js';

/**
 * Returns the total number of unread messages across all chats.
 * Derives the count from the existing getUserChats response
 * so no additional backend endpoint is needed.
 */
export function useUnreadMessages() {
    const { isLoggedIn } = useAuth();

    const { data: count = 0 } = useQuery({
        queryKey: ['unreadMessagesCount'],
        queryFn: async () => {
            const chats = await getUserChats();
            return Array.isArray(chats)
                ? chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
                : 0;
        },
        enabled: !!isLoggedIn,
        staleTime: 1000 * 30,
        // Refetch every minute in background
        refetchInterval: 1000 * 60,
    });

    return { unreadCount: count };
}
