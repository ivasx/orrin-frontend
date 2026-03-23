import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import InfoSection from '../../../../components/Shared/InfoSection/InfoSection.jsx';
import { getUserFollowers } from '../../../../services/api/index.js';
import styles from './FollowersTab.module.css';

export const FollowersTab = ({ username }) => {
    const { t } = useTranslation();

    const { data: followers, isLoading, isError } = useQuery({
        queryKey: ['userFollowers', username],
        queryFn: () => getUserFollowers(username),
        enabled: !!username,
    });

    if (isLoading) return <InfoSection isLoading />;
    if (isError) return <InfoSection message={t('profile_error_followers', 'Could not load network data.')} />;

    return (
        <div className={styles.container}>
            {followers?.length > 0 ? (
                <div className={styles.grid}>
                    {followers.map(user => (
                        <div key={user.id} className={styles.card}>
                            <img
                                src={user.avatar || '/default-avatar.png'}
                                alt={user.username}
                                className={styles.avatar}
                            />
                            <div className={styles.info}>
                                <span className={styles.username}>
                                    {user.first_name || user.username}
                                </span>
                                {user.first_name && (
                                    <span className={styles.handle}>@{user.username}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <InfoSection message={t('profile_no_followers', 'No followers yet.')} />
            )}
        </div>
    );
};