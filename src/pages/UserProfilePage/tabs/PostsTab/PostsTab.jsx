import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import InfoSection from '../../../../components/Shared/InfoSection/InfoSection.jsx';
import FeedPost from '../../../../components/Shared/FeedPost/FeedPost.jsx';
import CreatePost from '../../../../components/Shared/CreatePost/CreatePost.jsx';
import { getUserPosts } from '../../../../services/api/api.real.js';
import styles from './PostsTab.module.css';

export const PostsTab = ({ username, isOwnProfile }) => {
    const { t } = useTranslation();

    const { data: posts, isLoading, isError } = useQuery({
        queryKey: ['userPosts', username],
        queryFn: () => getUserPosts(username),
        enabled: !!username,
    });

    if (isLoading) return <InfoSection isLoading />;
    if (isError) return <InfoSection message={t('profile_error_posts', 'Could not load posts.')} />;

    return (
        <div className={styles.container}>
            {isOwnProfile && <CreatePost />}

            {posts?.length > 0 ? (
                posts.map(post => <FeedPost key={post.id} post={post} />)
            ) : (
                <InfoSection message={t('profile_no_posts', 'No posts available.')} />
            )}
        </div>
    );
};