import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import InfoSection from '../../../../components/Shared/InfoSection/InfoSection.jsx';
import FeedPost from '../../../../components/Shared/FeedPost/FeedPost.jsx';
import CreatePost from '../../../../components/Shared/CreatePost/CreatePost.jsx';
import { getArtistPosts } from '../../../../services/api/index.js';
import styles from './ArtistPostsTab.module.css';

export default function ArtistPostsTab({ artistSlug, canPost }) {
    const { t } = useTranslation();
    const { data: posts, isLoading, isError } = useQuery({
        queryKey: ['artistPosts', artistSlug],
        queryFn: () => getArtistPosts(artistSlug),
        enabled: !!artistSlug,
    });

    if (isLoading) return <InfoSection isLoading />;
    if (isError) return <InfoSection message={t('error_loading_posts')} />;

    return (
        <div className={styles.postsTab}>
            {canPost && (
                <div className={styles.createPostWrapper}>
                    <CreatePost />
                </div>
            )}
            {posts?.length > 0 ? (
                posts.map((post) => <FeedPost key={post.id} post={post} />)
            ) : (
                <InfoSection message={t('no_artist_posts')} />
            )}
        </div>
    );
}