import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import MusicSectionWrapper from '../../components/Shared/MusicSectionWrapper/MusicSectionWrapper.jsx';
import FeedFilters from './FeedFilters/FeedFilters.jsx';
import FeedPost from '../../components/Shared/FeedPost/FeedPost.jsx';
import CreatePost from '../../components/Shared/CreatePost/CreatePost.jsx';
import {getFeedPosts} from '../../services/api.js';
import styles from './FeedPage.module.css';

export default function FeedPage() {
    const {t} = useTranslation();
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState('recommended');
    const [filters, setFilters] = useState({
        contentType: null,
        sort: 'newest'
    });

    // Fetch posts using React Query with updated professional parameters
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
        keepPreviousData: true,
        staleTime: 60000, // 1 minute stale time for better performance
    });

    const handlePostCreated = () => {
        // Invalidate queries to trigger a refetch after posting
        queryClient.invalidateQueries({queryKey: ['feed']});
    };

    const renderEmptyState = () => {
        if (activeTab === 'following') {
            return (
                <div className={styles.emptyState}>
                    <h3>{t('feed_no_following')}</h3>
                    <p>{t('feed_no_following_desc')}</p>
                </div>
            );
        }

        return (
            <div className={styles.emptyState}>
                <h3>{t('feed_no_posts')}</h3>
                <p>{t('feed_no_posts_desc')}</p>
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
                <div className={styles.container}>
                    <CreatePost onPostCreated={handlePostCreated}/>

                    {isLoadingPosts ? (
                        <>
                            <div className={styles.skeleton}/>
                            <div className={styles.skeleton}/>
                            <div className={styles.skeleton}/>
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