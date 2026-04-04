import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit3, Share2, Settings, Flag, UserX, MoreHorizontal, Loader2 } from 'lucide-react';
import { FaUserPlus, FaUserCheck } from 'react-icons/fa';
import ContextMenu from '../../../../components/UI/OptionsMenu/OptionsMenu.jsx';
import Button from '../../../../components/UI/Button/Button.jsx';
import styles from './ProfileHero.module.css';

export const ProfileHero = ({
                                profile,
                                isOwnProfile,
                                onEditClick,
                                onFollow,
                                followLoading,
                                isLoggedIn,
                            }) => {
    const { t } = useTranslation();
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const moreButtonRef = useRef(null);

    const displayName =
        [profile.first_name, profile.last_name].filter(Boolean).join(' ') ||
        profile.username;

    const handleMoreClick = useCallback((e) => {
        e.stopPropagation();
        const rect = moreButtonRef.current?.getBoundingClientRect();
        if (rect) {
            setMenuPosition({ x: rect.left, y: rect.bottom + 6 });
        }
        setMenuVisible((v) => !v);
    }, []);

    const ownMenuItems = [
        {
            id: 'share',
            label: t('menu_share'),
            icon: <Share2 size={14} />,
            action: () => console.log('share'),
        },
        { type: 'separator' },
        {
            id: 'settings',
            label: t('menu_account_settings'),
            icon: <Settings size={14} />,
            action: () => console.log('settings'),
        },
    ];

    const otherMenuItems = [
        {
            id: 'share',
            label: t('menu_share'),
            icon: <Share2 size={14} />,
            action: () => console.log('share'),
        },
        { type: 'separator' },
        {
            id: 'report',
            label: t('menu_report_user'),
            icon: <Flag size={14} />,
            variant: 'danger',
            action: () => console.log('report'),
        },
        {
            id: 'block',
            label: t('menu_block_user'),
            icon: <UserX size={14} />,
            variant: 'danger',
            action: () => console.log('block'),
        },
    ];

    return (
        <div
            className={styles.hero}
            style={
                profile.cover_photo
                    ? { backgroundImage: `url(${profile.cover_photo})` }
                    : {}
            }
        >
            <div className={styles.heroOverlay} />

            <div className={styles.heroContent}>
                <div className={styles.avatarBlock}>
                    <img
                        src={profile.avatar || '/default-avatar.png'}
                        alt={displayName}
                        className={styles.avatar}
                    />
                    {profile.is_verified && (
                        <span className={styles.verifiedBadge} title={t('verified')}>
                            ✓
                        </span>
                    )}
                </div>

                <div className={styles.heroMeta}>
                    <h1 className={styles.displayName}>{displayName}</h1>
                    {profile.first_name && (
                        <span className={styles.handle}>@{profile.username}</span>
                    )}

                    {profile.bio && (
                        <p className={styles.heroBio}>{profile.bio}</p>
                    )}

                    <div className={styles.statsRow}>
                        <div className={styles.stat}>
                            <strong>{profile.followers_count ?? 0}</strong>
                            <span>{t('profile_stats_followers')}</span>
                        </div>
                        <div className={styles.statDivider} />
                        <div className={styles.stat}>
                            <strong>{profile.following_count ?? 0}</strong>
                            <span>{t('profile_stats_following')}</span>
                        </div>
                    </div>

                    <div className={styles.heroActions}>
                        {isOwnProfile ? (
                            <Button
                                variant="ghost"
                                className={styles.editBtn}
                                onClick={onEditClick}
                            >
                                <Edit3 size={15} />
                                {t('profile_action_edit')}
                            </Button>
                        ) : (
                            <Button
                                variant={profile.is_following ? 'ghost' : 'primary'}
                                className={`${styles.followBtn} ${profile.is_following ? styles.followBtnActive : ''}`}
                                onClick={onFollow}
                                disabled={followLoading || !isLoggedIn}
                            >
                                {followLoading ? (
                                    <Loader2 size={16} className={styles.spinIcon} />
                                ) : profile.is_following ? (
                                    <>
                                        <FaUserCheck size={15} />
                                        {t('profile_action_unfollow')}
                                    </>
                                ) : (
                                    <>
                                        <FaUserPlus size={15} />
                                        {t('profile_action_follow')}
                                    </>
                                )}
                            </Button>
                        )}

                        <Button
                            ref={moreButtonRef}
                            variant="ghost"
                            className={styles.moreBtn}
                            onClick={handleMoreClick}
                            aria-label={t('menu_more_options')}
                        >
                            <MoreHorizontal size={18} />
                        </Button>
                    </div>
                </div>
            </div>

            <ContextMenu
                isVisible={menuVisible}
                position={menuPosition}
                onClose={() => setMenuVisible(false)}
                menuItems={isOwnProfile ? ownMenuItems : otherMenuItems}
                openDirection="down"
            />
        </div>
    );
};