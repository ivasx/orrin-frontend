import { useTranslation } from 'react-i18next';
import { BadgeCheck } from 'lucide-react';
import styles from './ChatHeader.module.css';

export default function ChatHeader({ chat, isTyping }) {
    const { t } = useTranslation();

    const participant = chat?.participant ?? {};

    return (
        <header className={styles.header}>
            {participant.avatar ? (
                <div className={styles.avatarWrapper}>
                    <img
                        src={participant.avatar}
                        alt={participant.name ?? participant.username}
                        className={styles.avatar}
                        draggable={false}
                    />
                    {participant.is_verified && (
                        <span className={styles.verifiedBadge} aria-label={t('verified')}>
                            <BadgeCheck size={12} />
                        </span>
                    )}
                </div>
            ) : (
                <div className={styles.avatarPlaceholder} />
            )}

            <div className={styles.info}>
                <span className={styles.name}>
                    {participant.name ?? participant.username ?? t('chat_unknown_user')}
                </span>
                <div className={styles.statusRow} aria-live="polite" aria-atomic="true">
                    {isTyping ? (
                        <span className={styles.typingIndicator}>
                            {t('chat_is_typing')}
                            <span className={styles.typingDots} aria-hidden="true">
                                <span className={styles.dot} />
                                <span className={styles.dot} />
                                <span className={styles.dot} />
                            </span>
                        </span>
                    ) : (
                        participant.username && (
                            <span className={styles.username}>@{participant.username}</span>
                        )
                    )}
                </div>
            </div>
        </header>
    );
}