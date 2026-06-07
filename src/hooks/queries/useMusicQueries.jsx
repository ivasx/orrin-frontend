import {useQuery, useInfiniteQuery} from '@tanstack/react-query';
import {
    getTracks,
    getArtists,
    getFriendsActivity,
    getFeedPosts,
} from '../../services/api/index.js';

export const useTracksQuery = () => {
    return useQuery({
        queryKey: ['tracks'],
        queryFn: getTracks,
    });
};

export const useArtistsQuery = () => {
    return useQuery({
        queryKey: ['artists'],
        queryFn: getArtists,
    });
};

export const useFriendsActivityQuery = (isLoggedIn) => {
    return useQuery({
        queryKey: ['friendsActivity'],
        queryFn: getFriendsActivity,
        enabled: !!isLoggedIn,
    });
};

export const useInfiniteFeedQuery = (activeTab, filters) => {
    return useInfiniteQuery({
        queryKey: ['feed', activeTab, filters],
        queryFn: async ({pageParam = 1}) => {
            const response = await getFeedPosts({
                type: activeTab,
                sort: filters?.sort,
                contentType: filters?.contentType,
                pageParam,
            });

            if (Array.isArray(response)) return response;
            if (response && Array.isArray(response.results)) return response.results;
            return [];
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            const PAGE_SIZE = 4;
            if (lastPage && lastPage.length >= PAGE_SIZE) {
                return lastPageParam + 1;
            }
            return undefined;
        },
        staleTime: 60000,
    });
};