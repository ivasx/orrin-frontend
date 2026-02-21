import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, NewspaperIcon, Library, Heart, Clock, Settings } from 'lucide-react';

import { useAuth } from '../../../context/AuthContext.jsx';
import AuthPromptModal from '../../Shared/AuthPromptModal/AuthPromptModal.jsx';
import SidebarItem from './SidebarItem/SidebarItem.jsx';
import styles from './Sidebar.module.css';

const PROTECTED_PATHS = ['/library', '/favorites', '/history'];

export default function Sidebar({ isOpen, onClose, isPlayerVisible }) {
    const { t } = useTranslation();
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const menuItems = useMemo(() => [
        { icon: Home, label: t('sidebar_main'), path: '/' },
        { icon: NewspaperIcon, label: t('sidebar_feed'), path: '/feed' },
        { icon: Library, label: t('sidebar_library'), path: '/library' }
    ], [t]);

    const libraryItems = useMemo(() => [
        { icon: Heart, label: t('sidebar_favorites'), path: '/favorites' },
        { icon: Clock, label: t('sidebar_history'), path: '/history' },
    ], [t]);

    const settingsItems = useMemo(() => [
        { icon: Settings, label: t('sidebar_settings'), path: '/settings' }
    ], [t]);


    const handleNavigation = (path, e) => {
        if (e) e.preventDefault();

        if (PROTECTED_PATHS.includes(path) && !isLoggedIn) {
            setIsAuthModalOpen(true);
            return;
        }

        navigate(path);

        if (window.innerWidth < 768) {
            onClose();
        }
    };

    const sidebarClasses = `${styles.container} ${isOpen ? styles.open : styles.collapsed}`;
    const footerClasses = `${styles.footer} ${isPlayerVisible ? styles.footerWithPlayer : ''}`;
    const isCollapsed = !isOpen;

    return (
        <>
            {isOpen && (
                <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
            )}

            <aside className={sidebarClasses}>
                <nav className={styles.nav}>
                    <ul className={styles.menu}>
                        {menuItems.map((item) => (
                            <SidebarItem
                                key={item.path}
                                {...item}
                                onClick={(e) => handleNavigation(item.path, e)}
                                isCollapsed={isCollapsed}
                                isActive={location.pathname === item.path}
                            />
                        ))}
                    </ul>

                    <div className={styles.divider} />

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>{t('sidebar_my_music')}</h3>
                        <ul className={styles.menu}>
                            {libraryItems.map((item) => (
                                <SidebarItem
                                    key={item.path}
                                    {...item}
                                    onClick={(e) => handleNavigation(item.path, e)}
                                    isCollapsed={isCollapsed}
                                    isActive={location.pathname === item.path}
                                />
                            ))}
                        </ul>
                    </div>
                </nav>

                <div className={footerClasses}>
                    <ul className={styles.menu}>
                        {settingsItems.map((item) => (
                            <SidebarItem
                                key={item.path}
                                {...item}
                                onClick={(e) => handleNavigation(item.path, e)}
                                isCollapsed={isCollapsed}
                                isActive={location.pathname === item.path}
                            />
                        ))}
                    </ul>
                </div>
            </aside>

            <AuthPromptModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </>
    );
}