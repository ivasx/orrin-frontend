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
    if (isError)   return <InfoSection message={t('profile_error_followers')} />;

    if (!followers?.length) {
        return <InfoSection message={t('profile_no_followers')} />;
    }

    return (
        <div className={styles.grid}>
            {followers.map((user) => (
                <a
                    key={user.id}
                    href={`/user/${user.username || user.id}`}
                    className={styles.card}
                >
                    <img
                        src={user.avatar || '/default-avatar.png'}
                        alt={user.username}
                        className={styles.avatar}
                    />
                    <div className={styles.info}>
                        <span className={styles.name}>
                            {user.first_name || user.username}
                        </span>
                        {user.first_name && (
                            <span className={styles.handle}>@{user.username}</span>
                        )}
                    </div>
                </a>
            ))}
        </div>
    );
};