import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import MusicSectionWrapper from '../../components/Shared/MusicSectionWrapper/MusicSectionWrapper.jsx';
import FeedFilters from './FeedFilters/FeedFilters.jsx';
import FeedPost from '../../components/Shared/FeedPost/FeedPost.jsx';
import CreatePost from '../../components/Shared/CreatePost/CreatePost.jsx';
import InfoSection from '../../components/Shared/InfoSection/InfoSection.jsx'; // Ваш компонент

import { getFeedPosts } from '../../services/api.js';
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
        staleTime: 60000,
    });

    const handlePostCreated = () => {
        queryClient.invalidateQueries({ queryKey: ['feed'] });
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
                    {isLoggedIn ? (
                        <CreatePost onPostCreated={handlePostCreated} />
                    ) : (
                        /* Тут використовуємо InfoSection, бо це заклик до дії (Login) */
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
                        <>
                            <div className={styles.skeleton} />
                            <div className={styles.skeleton} />
                            <div className={styles.skeleton} />
                        </>
                    ) : posts.length > 0 ? (
                        posts.map(post => (
                            <FeedPost key={post.id} post={post} />
                        ))
                    ) : (
                        renderEmptyState()
                    )}
                </div>
            </MusicSectionWrapper>
        </>
    );
}