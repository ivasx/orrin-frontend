import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import MusicSectionWrapper from '../../components/Shared/MusicSectionWrapper/MusicSectionWrapper.jsx';
import FeedFilters from './FeedFilters/FeedFilters.jsx';
import FeedPost from '../../components/Shared/FeedPost/FeedPost.jsx';
import CreatePost from '../../components/Shared/CreatePost/CreatePost.jsx';
import InfoSection from '../../components/Shared/InfoSection/InfoSection.jsx';

import { useInfiniteFeedQuery } from '../../hooks/queries/useMusicQueries';
import { useAuth } from '../../context/AuthContext.jsx';
import styles from './FeedPage.module.css';

export default function FeedPage() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('recommended');
    const [filters, setFilters] = useState({
        contentType: null,
        sort: 'newest'
    });

    const observerRef = useRef(null);

    // Replaced useQuery with useInfiniteQuery for Enterprise-grade performance
    const {
        data,
        isLoading: isLoadingPosts,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage
    } = useInfiniteFeedQuery(activeTab, filters);

    // Flatten pages into a single array for rendering
    const posts = data?.pages.flatMap(page => page) || [];

    // Intersection Observer callback to trigger fetchNextPage
    const handleObserver = useCallback(
        (entries) => {
            const target = entries[0];
            if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        },
        [fetchNextPage, hasNextPage, isFetchingNextPage]
    );

    useEffect(() => {
        const option = { root: null, rootMargin: '200px', threshold: 0 };
        const observer = new IntersectionObserver(handleObserver, option);
        if (observerRef.current) observer.observe(observerRef.current);

        return () => {
            if (observerRef.current) observer.unobserve(observerRef.current);
        };
    }, [handleObserver]);

    const handlePostCreated = () => {
        queryClient.invalidateQueries({ queryKey: ['feed'] });
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
                    {isLoggedIn ? (
                        <CreatePost onPostCreated={handlePostCreated} />
                    ) : (
                        <InfoSection
                            title={t('login_required_create_title')}
                            message={t('login_required_create_desc')}
                            action={{
                                label: t('login'),
                                onClick: () => navigate('/login'),
                                variant: 'primary'
                            }}
                        />
                    )}

                    {isLoadingPosts ? (
                        <div className={styles.skeletonContainer}>
                            {[1, 2, 3].map(i => <div key={i} className={styles.skeleton} />)}
                        </div>
                    ) : posts.length > 0 ? (
                        <>
                            {posts.map(post => (
                                <FeedPost key={post.id} post={post} />
                            ))}
                            <div ref={observerRef} className={styles.loaderContainer}>
                                {isFetchingNextPage && <div className={styles.spinner} />}
                            </div>
                        </>
                    ) : (
                        <div className={styles.emptyState}>
                            <h3>{t('feed_no_posts')}</h3>
                            <p>{t('feed_no_posts_desc')}</p>
                        </div>
                    )}
                </div>
            </MusicSectionWrapper>
        </>
    );
}