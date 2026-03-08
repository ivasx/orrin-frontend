import { useState, useRef, useEffect } from 'react';
import { FaBell, FaHeart, FaUserPlus, FaMusic, FaComment } from 'react-icons/fa';
import { useNotifications } from '../../../../context/NotificationContext';
import styles from './NotificationBell.module.css';

const getIconForType = (type) => {
    switch (type) {
        case 'like_post':
        case 'like_comment':
            return <FaHeart className={styles.iconHeart} />;
        case 'follow':
            return <FaUserPlus className={styles.iconUser} />;
        case 'new_track':
            return <FaMusic className={styles.iconMusic} />;
        case 'reply':
        case 'new_post':
            return <FaComment className={styles.iconComment} />;
        default:
            return <FaBell className={styles.iconDefault} />;
    }
};

export const NotificationBell = () => {
    const { notifications, unreadCount, readNotification, readAll } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = (notification) => {
        if (!notification.is_read) {
            readNotification(notification.id);
        }
        setIsOpen(false);
    };

    return (
        <div className={styles.bellWrapper} ref={dropdownRef}>
            <button className={styles.bellButton} onClick={() => setIsOpen(!isOpen)}>
                <FaBell size={20} />
                {unreadCount > 0 && (
                    <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.header}>
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={readAll} className={styles.markAllRead}>
                                Mark all as read
                            </button>
                        )}
                    </div>
                    <div className={styles.list}>
                        {notifications.length === 0 ? (
                            <div className={styles.emptyState}>No notifications yet.</div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    className={`${styles.item} ${!notif.is_read ? styles.unread : ''}`}
                                    onClick={() => handleNotificationClick(notif)}
                                >
                                    <div className={styles.iconWrapper}>
                                        {getIconForType(notif.notification_type)}
                                    </div>
                                    <div className={styles.content}>
                                        <p>{notif.text}</p>
                                        <span className={styles.time}>
                                            {new Date(notif.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};