import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FaUserEdit, FaUserPlus, FaUserCheck } from 'react-icons/fa';
import { toggleFollowUser } from '../../../../services/api';
import styles from './ProfileHero.module.css';

export const ProfileHero = ({ profile, isOwnProfile }) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const bannerStyle = profile.cover_photo
        ? { backgroundImage: `url(${profile.cover_photo})` }
        : { backgroundColor: 'var(--bg-color-tertiary, #282828)' };

    const followMutation = useMutation({
        mutationFn: () => toggleFollowUser(profile.username),
        onSuccess: () => {
            queryClient.invalidateQueries(['userProfile', profile.username]);
        }
    });

    return (
        <div className={styles.hero} style={bannerStyle}>
            <div className={styles.overlay}></div>
            <div className={styles.content}>
                <img
                    src={profile.avatar || '/default-avatar.png'}
                    alt={profile.username}
                    className={styles.avatar}
                />
                <div className={styles.info}>
                    <h1 className={styles.username}>
                        {profile.first_name || profile.username} {profile.last_name || ''}
                    </h1>
                    {profile.first_name && (
                        <span className={styles.tag}>@{profile.username}</span>
                    )}

                    <div className={styles.stats}>
                        <span><strong>{profile.followers_count || 0}</strong> {t('profile_stats_followers', 'Followers')}</span>
                        <span><strong>{profile.following_count || 0}</strong> {t('profile_stats_following', 'Following')}</span>
                    </div>

                    <div className={styles.actions}>
                        {isOwnProfile ? (
                            <button className={styles.actionBtn}>
                                <FaUserEdit size={16} />
                                {t('profile_action_edit', 'Edit Profile')}
                            </button>
                        ) : (
                            <button
                                className={profile.is_following ? styles.actionBtn : styles.actionBtnPrimary}
                                onClick={() => followMutation.mutate()}
                                disabled={followMutation.isLoading}
                            >
                                {profile.is_following ? <FaUserCheck size={16} /> : <FaUserPlus size={16} />}
                                {profile.is_following ? t('profile_action_unfollow', 'Unfollow') : t('profile_action_follow', 'Follow')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};