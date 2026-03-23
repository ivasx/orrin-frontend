import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
    getTracks,
    getArtists,
    getFriendsActivity,
    getFeedPosts,
} from '../../services/api/index.js';

const isMockMode = import.meta.env.VITE_USE_MOCK_DATA === 'true';
const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

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

/**
 * Hook for FeedPage infinite scrolling.
 * Works with both:
 *  - Array responses (legacy mock returning plain arrays)
 *  - Paginated responses: { results: Post[], next: string | null }
 */
export const useInfiniteFeedQuery = (activeTab, filters) => {
    return useInfiniteQuery({
        queryKey: ['feed', activeTab, filters],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await getFeedPosts({
                type: activeTab,
                sort: filters?.sort,
                contentType: filters?.contentType,
                pageParam,
            });

            // Normalise to always return a flat array for the pages structure
            if (Array.isArray(response)) {
                // Legacy: plain array (old mock)
                return response;
            }

            if (response && Array.isArray(response.results)) {
                // Paginated: { results, next }
                return response.results;
            }

            return [];
        },
        initialPageParam: 1,
        getNextPageParam: async (lastPage, allPages, lastPageParam) => {
            // For paginated mock: re-query to see if there's a next page
            if (lastPage && lastPage.length > 0) {
                // Try fetching next page to check if it's non-empty
                // Use a simple heuristic: if this page was full (4 items), assume there's a next
                const PAGE_SIZE = 4;
                if (lastPage.length >= PAGE_SIZE) {
                    return lastPageParam + 1;
                }
            }
            return undefined;
        },
        staleTime: 60000,
    });
};