import {useTranslation} from 'react-i18next';
import {Bell, Heart, UserPlus, Music, ListPlus, X} from 'lucide-react';
import {useNotifications} from '../../../../context/NotificationContext';
import styles from './NotificationDropdown.module.css';

const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return '<1m';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return new Date(dateString).toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
};

const TYPE_META = {
    NEW_FOLLOWER: {Icon: UserPlus, colorVar: '--color-info', bgVar: 'rgba(56, 189, 248, 0.12)'},
    LIKE_TRACK: {Icon: Heart, colorVar: '--color-error', bgVar: 'rgba(229, 62, 62, 0.12)'},
    NEW_RELEASE: {Icon: Music, colorVar: '--color-success', bgVar: 'rgba(16, 185, 129, 0.12)'},
    PLAYLIST_ADD: {Icon: ListPlus, colorVar: '--color-primary', bgVar: 'rgba(175, 148, 126, 0.14)'},
};

const getTypeMeta = (type) =>
    TYPE_META[type] || {Icon: Bell, colorVar: '--color-text-muted', bgVar: 'rgba(255,255,255,0.06)'};

const buildText = (notification, t) => {
    const actorName = notification.actor?.name || t('notifications.someone');
    const entityTitle = notification.entity?.title;

    switch (notification.type) {
        case 'NEW_FOLLOWER':
            return t('notifications.text.new_follower', {name: actorName});
        case 'LIKE_TRACK':
            return t('notifications.text.like_track', {name: actorName, track: entityTitle});
        case 'NEW_RELEASE':
            return t('notifications.text.new_release', {artist: actorName, release: entityTitle});
        case 'PLAYLIST_ADD':
            return t('notifications.text.playlist_add', {name: actorName, playlist: entityTitle});
        default:
            return notification.text || actorName;
    }
};

const NotificationItem = ({notification, onMarkAsRead}) => {
    const {t} = useTranslation();
    const {Icon, colorVar, bgVar} = getTypeMeta(notification.type);
    const isUnread = !notification.isRead && !notification.is_read;

    const avatarSrc = notification.actor?.avatarUrl
        || notification.actor?.avatar
        || notification.actor_avatar
        || null;

    const coverSrc = notification.entity?.coverUrl
        || notification.entity?.cover
        || null;

    const displayImage = avatarSrc || coverSrc;

    const timestamp = notification.timestamp
        || notification.created_at
        || notification.createdAt
        || null;

    const handleClick = () => {
        if (isUnread) onMarkAsRead(notification.id);
    };

    return (
        <div
            className={`${styles.item} ${isUnread ? styles.unread : ''}`}
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        >
            {isUnread && <span className={styles.unreadDot} aria-hidden="true"/>}

            <div className={styles.iconContainer} style={{background: bgVar}}>
                {displayImage ? (
                    <img src={displayImage} alt="" className={styles.avatarImg}/>
                ) : (
                    <Icon size={16} style={{color: `var(${colorVar})`}} strokeWidth={2}/>
                )}
                <span
                    className={styles.typeIcon}
                    style={{background: bgVar, border: '1.5px solid var(--color-bg-base)'}}
                >
                    <Icon size={9} style={{color: `var(${colorVar})`}} strokeWidth={2.5}/>
                </span>
            </div>

            <div className={styles.content}>
                <p className={styles.text}>{buildText(notification, t)}</p>
                <span className={styles.time}>{formatTimeAgo(timestamp)}</span>
            </div>
        </div>
    );
};

export const NotificationDropdown = ({onClose}) => {
    const {t} = useTranslation();
    const {notifications, unreadCount, markAsRead, markAllAsRead, isLoading} = useNotifications();

    return (
        <div className={styles.dropdown} role="dialog" aria-label={t('notifications.title')}>
            <div className={styles.header}>
                <span className={styles.title}>{t('notifications.title')}</span>
                <div className={styles.headerActions}>
                    {unreadCount > 0 && (
                        <button className={styles.markAllBtn} onClick={() => markAllAsRead()}>
                            {t('notifications.mark_all_read')}
                        </button>
                    )}
                    <button
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label={t('notifications.close')}
                    >
                        <X size={16}/>
                    </button>
                </div>
            </div>

            <div className={styles.body}>
                {isLoading ? (
                    <div className={styles.emptyState}>
                        <div className={styles.skeletonList}>
                            {[1, 2, 3].map((i) => (
                                <div key={i} className={styles.skeletonItem}>
                                    <div className={styles.skeletonAvatar}/>
                                    <div className={styles.skeletonLines}>
                                        <div className={styles.skeletonLine} style={{width: '75%'}}/>
                                        <div className={styles.skeletonLine} style={{width: '40%'}}/>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                            <Bell size={28} strokeWidth={1.2}/>
                        </div>
                        <p className={styles.emptyTitle}>{t('notifications.empty_title')}</p>
                        <p className={styles.emptySubtitle}>{t('notifications.empty_subtitle')}</p>
                    </div>
                ) : (
                    <div className={styles.list}>
                        {notifications.map((notif) => (
                            <NotificationItem
                                key={notif.id}
                                notification={notif}
                                onMarkAsRead={markAsRead}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};