import {useQuery} from '@tanstack/react-query';
import {getUserChats} from '../services/api';
import {useAuth} from '../context/AuthContext';

export function useTotalUnreadMessages() {
    const {isLoggedIn} = useAuth();

    const {data: chats = []} = useQuery({
        queryKey: ['userChats'],
        queryFn: getUserChats,
        staleTime: 1000 * 30,
        enabled: isLoggedIn,
    });

    return chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
}