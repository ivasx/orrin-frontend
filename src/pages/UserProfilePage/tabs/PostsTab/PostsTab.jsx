import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import InfoSection from '../../../../components/Shared/InfoSection/InfoSection.jsx';
import FeedPost from '../../../../components/Shared/FeedPost/FeedPost.jsx';
import CreatePost from '../../../../components/Shared/CreatePost/CreatePost.jsx';
import { getUserPosts } from '../../../../services/api.js';

export const PostsTab = ({ userId, isOwnProfile }) => {
    const { t } = useTranslation();

    const { data: posts, isLoading, isError } = useQuery({
        queryKey: ['userPosts', userId],
        queryFn: () => getUserPosts(userId),
        enabled: !!userId,
    });

    if (isLoading) return <InfoSection isLoading />;
    if (isError) return <InfoSection message={t('profile_error_posts', 'Could not load posts.')} />;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '800px', margin: '0 auto' }}>
            {isOwnProfile && <CreatePost />}

            {posts?.length > 0 ? (
                posts.map(post => <FeedPost key={post.id} post={post} />)
            ) : (
                <InfoSection message={t('profile_no_posts', 'No posts available.')} />
            )}
        </div>
    );
};