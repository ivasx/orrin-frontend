import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
    getTracks,
    getArtists,
    getFriendsActivity,
    getFeedPosts
} from '../../services/api/api.real.js';
import { ways, popularArtists } from '../../data';
import { mockPosts } from '../../data/mockData';

// Check environment variable for mock data mode
const isMockMode = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Utility to simulate network latency (default 400ms)
const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

export const useTracksQuery = () => {
    return useQuery({
        queryKey: ['tracks'],
        queryFn: async () => {
            if (isMockMode) {
                await delay();
                return ways;
            }
            return getTracks();
        }
    });
};

export const useArtistsQuery = () => {
    return useQuery({
        queryKey: ['artists'],
        queryFn: async () => {
            if (isMockMode) {
                await delay();
                return popularArtists;
            }
            return getArtists();
        }
    });
};

/**
 * Hook for HomePage horizontal "From Friends" section
 */
export const useFriendsActivityQuery = (isLoggedIn) => {
    return useQuery({
        queryKey: ['friendsActivity'],
        queryFn: async () => {
            if (isMockMode) {
                await delay();
                return ways;
            }
            return getFriendsActivity();
        },
        enabled: !!isLoggedIn
    });
};

/**
 * Hook for FeedPage infinite scrolling
 */
export const useInfiniteFeedQuery = (activeTab, filters) => {
    return useInfiniteQuery({
        queryKey: ['feed', activeTab, filters],
        queryFn: async ({ pageParam = 1 }) => {
            if (isMockMode) {
                await delay();
                // Return mock posts only for the first page to simulate end of feed
                return {
                    results: pageParam === 1 ? mockPosts : [],
                    next: pageParam === 1 ? 'http://mock.api/feed?page=2' : null
                };
            }

            return getFeedPosts({
                type: activeTab,
                sort: filters?.sort,
                contentType: filters?.contentType,
                pageParam
            });
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            if (lastPage && lastPage.next) {
                try {
                    const url = new URL(lastPage.next);
                    const nextPage = url.searchParams.get('page');
                    return nextPage ? Number(nextPage) : undefined;
                } catch (e) {
                    return undefined;
                }
            }

            if (Array.isArray(lastPage) && lastPage.length > 0) {
                return lastPageParam + 1;
            }

            // End of pagination
            return undefined;
        },
        staleTime: 60000,
    });
};