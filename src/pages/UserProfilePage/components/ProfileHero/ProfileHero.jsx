import {useTranslation} from 'react-i18next';
import {Edit3, Share2, Settings, Flag, UserX, Loader2} from 'lucide-react';
import {FaUserPlus, FaUserCheck} from 'react-icons/fa';
import PageHero from '../../../../components/Shared/PageHero/PageHero.jsx';
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
    const {t} = useTranslation();

    const displayName =
        [profile.first_name, profile.last_name].filter(Boolean).join(' ') ||
        profile.username;

    const stats = [
        {label: t('profile_stats_followers'), value: profile.followers_count ?? 0},
        {label: t('profile_stats_following'), value: profile.following_count ?? 0},
    ];

    const meta = profile.first_name ? (
        <span className={styles.handle}>@{profile.username}</span>
    ) : null;

    const ownMenuItems = [
        {
            id: 'share',
            label: t('menu_share'),
            icon: <Share2 size={14}/>,
            action: () => {
            },
        },
        {type: 'separator'},
        {
            id: 'settings',
            label: t('menu_account_settings'),
            icon: <Settings size={14}/>,
            action: () => {
            },
        },
    ];

    const otherMenuItems = [
        {
            id: 'share',
            label: t('menu_share'),
            icon: <Share2 size={14}/>,
            action: () => {
            },
        },
        {type: 'separator'},
        {
            id: 'report',
            label: t('menu_report_user'),
            icon: <Flag size={14}/>,
            variant: 'danger',
            action: () => {
            },
        },
        {
            id: 'block',
            label: t('menu_block_user'),
            icon: <UserX size={14}/>,
            variant: 'danger',
            action: () => {
            },
        },
    ];

    const actions = isOwnProfile ? (
        <Button variant="ghost" className={styles.editBtn} onClick={onEditClick}>
            <Edit3 size={15}/>
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
                <Loader2 size={16} className={styles.spinIcon}/>
            ) : profile.is_following ? (
                <><FaUserCheck size={15}/>{t('profile_action_unfollow')}</>
            ) : (
                <><FaUserPlus size={15}/>{t('profile_action_follow')}</>
            )}
        </Button>
    );

    const badge = profile.is_verified ? (
        <span title={t('verified')}>✓</span>
    ) : null;

    return (
        <PageHero
            backgroundImage={profile.cover_photo || null}
            avatar={profile.avatar || '/default-avatar.png'}
            avatarAlt={displayName}
            avatarShape="circle"
            badge={badge}
            title={displayName}
            meta={meta}
            stats={stats}
            actions={actions}
            menuItems={isOwnProfile ? ownMenuItems : otherMenuItems}
        >
            {profile.bio && (
                <p className={styles.bio}>{profile.bio}</p>
            )}
        </PageHero>
    );
};