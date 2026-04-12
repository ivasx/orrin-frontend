import { useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Spinner from '../../../../components/UI/Spinner/Spinner';
import MessageBubble from './MessageBubble';
import styles from './MessageList.module.css';

function groupMessagesByDate(messages) {
    const groups = [];
    let currentDate = null;

    for (const message of messages) {
        const date = new Date(message.timestamp);
        const dateKey = date.toDateString();

        if (dateKey !== currentDate) {
            currentDate = dateKey;
            groups.push({ type: 'date', key: dateKey, date });
        }

        groups.push({ type: 'message', key: message.id, message });
    }

    return groups;
}

function formatDateLabel(date, t) {
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t('chat_date_today');
    if (diffDays === 1) return t('chat_date_yesterday');

    return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: diffDays > 300 ? 'numeric' : undefined });
}

export default function MessageList({ messages, isLoading, currentUserId }) {
    const { t } = useTranslation();
    const bottomRef = useRef(null);
    const containerRef = useRef(null);

    const grouped = useMemo(() => groupMessagesByDate(messages), [messages]);

    useEffect(() => {
        if (!isLoading && bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    if (isLoading) {
        return (
            <div className={styles.centered}>
                <Spinner />
            </div>
        );
    }

    if (!isLoading && messages.length === 0) {
        return (
            <div className={styles.centered}>
                <span className={styles.emptyText}>{t('chat_no_messages_yet')}</span>
            </div>
        );
    }

    return (
        <div className={styles.list} ref={containerRef} role="log" aria-live="polite" aria-label={t('chat_messages_region')}>
            <div className={styles.inner}>
                {grouped.map((item) => {
                    if (item.type === 'date') {
                        return (
                            <div key={item.key} className={styles.dateDivider}>
                                <span className={styles.dateLabel}>
                                    {formatDateLabel(item.date, t)}
                                </span>
                            </div>
                        );
                    }

                    const { message } = item;
                    const isMine = message.senderId === currentUserId;

                    return (
                        <MessageBubble
                            key={message.id}
                            message={message}
                            isMine={isMine}
                        />
                    );
                })}
                <div ref={bottomRef} aria-hidden="true" />
            </div>
        </div>
    );
}