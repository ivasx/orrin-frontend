import {useQuery} from '@tanstack/react-query';
import {useAuth} from '../context/AuthContext.jsx';
import {getUnreadMessagesCount} from '../services/api/index.js';

export function useUnreadMessages() {
    const {isLoggedIn} = useAuth();

    const {data = 0} = useQuery({
        queryKey: ['unreadMessages'],
        queryFn: getUnreadMessagesCount,
        enabled: isLoggedIn,
        refetchInterval: 30_000,
        staleTime: 15_000,
        placeholderData: 0,
    });

    return data;
}