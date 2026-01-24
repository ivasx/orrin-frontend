import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {
    Home,
    NewspaperIcon,
    Library,
    Music,
    Heart,
    Clock,
    TrendingUp,
    Settings,
    Disc
} from 'lucide-react';
import SidebarItem from './SidebarItem/SidebarItem.jsx';
import styles from './Sidebar.module.css';

export default function Sidebar({isOpen, onClose, isPlayerVisible}) {
    const {t} = useTranslation();

    // Memoize menu items
    const menuItems = useMemo(() => [
        {icon: Home, label: t('sidebar_main'), path: '/'},
        {icon: NewspaperIcon, label: t('sidebar_feed'), path: '/feed'},
        {icon: Library, label: t('sidebar_library'), path: '/library'}
    ], [t]);

    const libraryItems = useMemo(() => [
        // TODO: [Playlists Feature] Temporarily disabled.
        // {icon: Music, label: t('sidebar_playlists'), path: '/playlists'},

        {icon: Heart, label: t('sidebar_favorites'), path: '/favorites'},
        {icon: Clock, label: t('sidebar_history'), path: '/history'},

        // TODO: [TopTracks Feature] Temporarily disabled.
        // {icon: TrendingUp, label: t('sidebar_top_tracks'), path: '/top'},

        // TODO: [Radio Feature] Temporarily disabled.
        // { icon: Disc, label: t('sidebar_radio'), path: '/radio' }
    ], [t]);

    const settingsItems = useMemo(() => [
        {icon: Settings, label: t('sidebar_settings'), path: '/settings'}
    ], [t]);

    const handleLinkClick = () => {
        if (window.innerWidth < 768) {
            onClose();
        }
    };

    const sidebarClasses = `${styles.container} ${isOpen ? styles.open : styles.collapsed}`;
    const footerClasses = `${styles.footer} ${isPlayerVisible ? styles.footerWithPlayer : ''}`;

    // Determine collapsed state for child components
    const isCollapsed = !isOpen;

    return (
        <>
            {isOpen && (
                <div
                    className={styles.backdrop}
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            <aside className={sidebarClasses}>
                <nav className={styles.nav}>
                    <ul className={styles.menu}>
                        {menuItems.map((item) => (
                            <SidebarItem
                                key={item.path}
                                {...item}
                                onClick={handleLinkClick}
                                isCollapsed={isCollapsed}
                            />
                        ))}
                    </ul>

                    <div className={styles.divider}/>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>{t('sidebar_my_music')}</h3>
                        <ul className={styles.menu}>
                            {libraryItems.map((item) => (
                                <SidebarItem
                                    key={item.path}
                                    {...item}
                                    onClick={handleLinkClick}
                                    isCollapsed={isCollapsed}
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
                                onClick={handleLinkClick}
                                isCollapsed={isCollapsed}
                            />
                        ))}
                    </ul>
                </div>
            </aside>
        </>
    );
}