import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../../../../context/NotificationContext';
import { NotificationDropdown } from './NotificationDropdown';
import styles from './NotificationBell.module.css';

export const NotificationBell = () => {
    const { t } = useTranslation();
    const { unreadCount } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={styles.wrapper} ref={wrapperRef}>
            <button
                className={`${styles.bellButton} ${isOpen ? styles.active : ''}`}
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label={t('notifications.title')}
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <Bell size={20} strokeWidth={1.8} />
                {unreadCount > 0 && (
                    <span className={styles.badge} aria-label={t('notifications.unread_count', { count: unreadCount })}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && <NotificationDropdown onClose={() => setIsOpen(false)} />}
        </div>
    );
};