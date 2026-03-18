import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { API_ENDPOINTS, buildUrl } from '../../constants/apiEndpoints';

const fetchFromApi = async (endpoint) => {
    const token = localStorage.getItem('access_token');
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, { headers });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to fetch data');
    }

    return response.json();
};

export const useTracksQuery = () => {
    return useQuery({
        queryKey: ['tracks'],
        queryFn: () => fetchFromApi(API_ENDPOINTS.TRACKS)
    });
};

export const useArtistsQuery = () => {
    return useQuery({
        queryKey: ['artists'],
        queryFn: () => fetchFromApi(API_ENDPOINTS.ARTISTS)
    });
};

/**
 * Hook for HomePage horizontal "From Friends" section
 */
export const useFriendsActivityQuery = (isLoggedIn) => {
    return useQuery({
        queryKey: ['friendsActivity'],
        queryFn: async () => {
            const result = await fetchFromApi(API_ENDPOINTS.USER_FEED);
            return result.results || result || [];
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
        queryFn: ({ pageParam = 1 }) => {
            const url = buildUrl(API_ENDPOINTS.USER_FEED, {
                type: activeTab,
                sort: filters.sort,
                contentType: filters.contentType,
                page: pageParam
            });
            return fetchFromApi(url);
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage.next) {
                const url = new URL(lastPage.next);
                return url.searchParams.get('page');
            }
            return undefined;
        },
        staleTime: 60000,
    });
};