import { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { useQuery } from '@tanstack/react-query';
import MusicSectionWrapper from '../../components/MusicSectionWrapper/MusicSectionWrapper.jsx';
import FeedFilters from '../../components/FeedFilters/FeedFilters.jsx';
import FeedPost from '../../components/FeedPost/FeedPost.jsx';
import CreatePost from '../../components/CreatePost/CreatePost.jsx';
import SectionSkeleton from '../../components/SectionSkeleton/SectionSkeleton.jsx';
import { getTracks } from '../../services/api';
import { mockPosts } from '../../data/mockData';
import './FeedPage.css';

export default function FeedPage() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('recommended');
    const [filters, setFilters] = useState({
        contentType: null,
        sort: 'newest'
    });
    const [posts, setPosts] = useState([]);
    const [isLoadingPosts, setIsLoadingPosts] = useState(true);

    const handlePostCreated = (newPost) => {
        setPosts([newPost, ...posts]);
    };

    // Завантаження постів (поки що використовуємо моки)
    useEffect(() => {
        setIsLoadingPosts(true);
        // Симулюємо завантаження
        setTimeout(() => {
            let filteredPosts = [...mockPosts];

            // Застосовуємо фільтри
            if (filters.contentType === 'with_music') {
                filteredPosts = filteredPosts.filter(post => post.attachedTrack);
            } else if (filters.contentType === 'text_only') {
                filteredPosts = filteredPosts.filter(post => !post.attachedTrack);
            }

            // Застосовуємо сортування
            if (filters.sort === 'popular') {
                filteredPosts.sort((a, b) => b.likesCount - a.likesCount);
            } else if (filters.sort === 'discussed') {
                filteredPosts.sort((a, b) => b.commentsCount - a.commentsCount);
            }

            setPosts(filteredPosts);
            setIsLoadingPosts(false);
        }, 500);
    }, [activeTab, filters]);

    // Якщо це сторінка "Відстежуються" і користувач не авторизований
    const renderEmptyState = () => {
        if (activeTab === 'following') {
            return (
                <div className="feed-empty-state">
                    <h3>{t('feed_no_following', 'Ви ще не відстежуєте нікого')}</h3>
                    <p>{t('feed_no_following_desc', 'Почніть відстежувати артистів та користувачів, щоб бачити їхні пости тут')}</p>
                </div>
            );
        }

        return (
            <div className="feed-empty-state">
                <h3>{t('feed_no_posts', 'Поки що немає постів')}</h3>
                <p>{t('feed_no_posts_desc', 'Спробуйте змінити фільтри або перейдіть на іншу вкладку')}</p>
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
                    {/* Форма створення поста */}
                    <CreatePost onPostCreated={handlePostCreated} />

                    {isLoadingPosts ? (
                        <>
                            <div className="feed-post-skeleton" />
                            <div className="feed-post-skeleton" />
                            <div className="feed-post-skeleton" />
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