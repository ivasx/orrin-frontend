import { useTranslation } from 'react-i18next';
import { BadgeCheck } from 'lucide-react';
import styles from './ChatListItem.module.css';

function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (diffDays === 1) {
        return 'Yesterday';
    }
    if (diffDays < 7) {
        return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function ChatListItem({ chat, isActive, onClick }) {
    const { t } = useTranslation();

    const participant = chat.participant || {};
    const lastMessage = chat.lastMessage || {};
    const unreadCount = chat.unreadCount || 0;

    return (
        <div
            className={`${styles.item} ${isActive ? styles.active : ''}`}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
            aria-label={t('chat_with_user', { name: participant.name || participant.username })}
            aria-current={isActive ? 'true' : 'false'}
        >
            <div className={styles.avatarWrapper}>
                <img
                    src={participant.avatar}
                    alt={participant.name || participant.username}
                    className={styles.avatar}
                    draggable={false}
                />
                {participant.is_verified && (
                    <span className={styles.verifiedBadge} aria-label={t('verified')}>
                        <BadgeCheck size={12} />
                    </span>
                )}
            </div>

            <div className={styles.content}>
                <div className={styles.topRow}>
                    <span className={styles.name}>
                        {participant.name || participant.username}
                    </span>
                    <span className={styles.time}>
                        {formatTime(lastMessage.timestamp || chat.updatedAt)}
                    </span>
                </div>
                <div className={styles.bottomRow}>
                    <span className={`${styles.preview} ${unreadCount > 0 ? styles.previewUnread : ''}`}>
                        {lastMessage.senderId === 'user-4' && (
                            <span className={styles.youLabel}>{t('chat_you_prefix')}</span>
                        )}
                        {lastMessage.text || t('chat_no_messages')}
                    </span>
                    {unreadCount > 0 && (
                        <span className={styles.unreadBadge} aria-label={t('unread_messages_count', { count: unreadCount })}>
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}