import { useTranslation } from 'react-i18next';
import { FaUserEdit, FaUserPlus } from 'react-icons/fa';
import styles from './ProfileHero.module.css';

export const ProfileHero = ({ profile, isOwnProfile }) => {
    const { t } = useTranslation();

    const bannerStyle = profile.bannerUrl
        ? { backgroundImage: `url(${profile.bannerUrl})` }
        : { backgroundColor: 'var(--bg-color-tertiary, #282828)' };

    return (
        <div className={styles.hero} style={bannerStyle}>
            <div className={styles.overlay}></div>
            <div className={styles.content}>
                <img
                    src={profile.avatarUrl || '/default-avatar.png'}
                    alt={profile.username}
                    className={styles.avatar}
                />
                <div className={styles.info}>
                    <span className={styles.badge}>{t('profile_badge_user')}</span>
                    <h1 className={styles.username}>{profile.username}</h1>

                    <div className={styles.stats}>
                        <span><strong>{profile.stats?.postsCount || 0}</strong> {t('profile_stats_posts')}</span>
                        <span><strong>{profile.stats?.friendsCount || 0}</strong> {t('profile_stats_friends')}</span>
                    </div>

                    <div className={styles.actions}>
                        {isOwnProfile ? (
                            <button className={styles.actionBtn}>
                                <FaUserEdit size={16} />
                                {t('profile_action_edit')}
                            </button>
                        ) : (
                            <button className={styles.actionBtnPrimary}>
                                <FaUserPlus size={16} />
                                {t('profile_action_add_friend')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};