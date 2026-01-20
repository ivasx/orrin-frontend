import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import MusicSectionWrapper from '../../components/MusicSectionWrapper/MusicSectionWrapper.jsx';
import FeedFilters from '../../components/FeedFilters/FeedFilters.jsx';
import FeedPost from '../../components/FeedPost/FeedPost.jsx';
import CreatePost from '../../components/CreatePost/CreatePost.jsx';
import {getFeedPosts} from '../../services/api';
import './FeedPage.css';

export default function FeedPage() {
    const {t} = useTranslation();
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState('recommended');
    const [filters, setFilters] = useState({
        contentType: null,
        sort: 'newest'
    });

    // Fetch posts using React Query.
    // The query key includes filters, so it auto-refetches when filters change.
    const {
        data: posts = [],
        isLoading: isLoadingPosts
    } = useQuery({
        queryKey: ['feed', activeTab, filters],
        queryFn: () => getFeedPosts({
            type: activeTab,
            sort: filters.sort,
            contentType: filters.contentType
        }),
        // This keeps the old list visible while the new filter is loading
        // to prevent UI flickering.
        keepPreviousData: true,
    });

    const handlePostCreated = () => {
        // Invalidate the feed query to trigger a background refetch
        // so the new post appears immediately.
        queryClient.invalidateQueries({queryKey: ['feed']});
    };

    const renderEmptyState = () => {
        if (activeTab === 'following') {
            return (
                <div className="feed-empty-state">
                    <h3>{t('feed_no_following', 'You are not following anyone yet')}</h3>
                    <p>{t('feed_no_following_desc', 'Start following artists and users to see their posts here')}</p>
                </div>
            );
        }

        return (
            <div className="feed-empty-state">
                <h3>{t('feed_no_posts', 'No posts yet')}</h3>
                <p>{t('feed_no_posts_desc', 'Try changing filters or switch to another tab')}</p>
            </div>
        );
    };

    return (
        <>
            <FeedFilters
                filters={filters}
                onFiltersChange={setFilters}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <MusicSectionWrapper spacing="default">
                <div className="feed-posts-container">
                    <CreatePost onPostCreated={handlePostCreated}/>

                    {isLoadingPosts ? (
                        <>
                            {/* Simple skeleton loading state */}
                            <div className="feed-post-skeleton"/>
                            <div className="feed-post-skeleton"/>
                            <div className="feed-post-skeleton"/>
                        </>
                    ) : posts.length > 0 ? (
                        posts.map(post => (
                            <FeedPost key={post.id} post={post}/>
                        ))
                    ) : (
                        renderEmptyState()
                    )}
                </div>
            </MusicSectionWrapper>
        </>
    );
}