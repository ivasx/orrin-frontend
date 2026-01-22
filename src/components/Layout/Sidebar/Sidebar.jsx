import {Home, NewspaperIcon, Library, Music, Heart, Clock, TrendingUp, Settings, Disc} from 'lucide-react';
import {NavLink} from 'react-router-dom';
import './Sidebar.css';
import {useTranslation} from 'react-i18next';

export default function Sidebar({isOpen, onClose, isPlayerVisible}) {
    const {t} = useTranslation();

    const menuItems = [
        {icon: Home, label: t('sidebar_main'), path: '/'},
        {icon: NewspaperIcon, label: t('sidebar_feed'), path: '/feed'},
        {icon: Library, label: t('sidebar_library'), path: '/library'}
    ];

    const libraryItems = [
        {icon: Music, label: t('sidebar_playlists'), path: '/playlists'},
        {icon: Heart, label: t('sidebar_favorites'), path: '/favorites'},
        {icon: Clock, label: t('sidebar_history'), path: '/history'},
        {icon: TrendingUp, label: t('sidebar_top_tracks'), path: '/top'},
        {icon: Disc, label: t('sidebar_radio'), path: '/radio'}
    ];

    const settingsItems = [
        {icon: Settings, label: t('sidebar_settings'), path: '/settings'}
    ];

    const handleLinkClick = () => {
        if (window.innerWidth < 768) {
            onClose();
        }
    };

    return (
        <>
            {isOpen && (
                <div
                    className="sidebar-backdrop"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            <aside className={`sidebar ${isOpen ? 'sidebar--open' : 'sidebar--collapsed'}`}>
                <nav className="sidebar__nav">
                    <ul className="sidebar__menu">
                        {menuItems.map((item, index) => (
                            <li key={index} className="sidebar__item">
                                <NavLink
                                    to={item.path}
                                    className={({isActive}) =>
                                        `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                                    }
                                    onClick={handleLinkClick}
                                >
                                    <item.icon className="sidebar__icon"/>
                                    <span className="sidebar__label">{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>

                    <div className="sidebar__divider"/>

                    <div className="sidebar__section">
                        <h3 className="sidebar__section-title">{t('sidebar_my_music')}</h3>
                        <ul className="sidebar__menu">
                            {libraryItems.map((item, index) => (
                                <li key={index} className="sidebar__item">
                                    <NavLink
                                        to={item.path}
                                        className={({isActive}) =>
                                            `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                                        }
                                        onClick={handleLinkClick}
                                    >
                                        <item.icon className="sidebar__icon"/>
                                        <span className="sidebar__label">{item.label}</span>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                </nav>

                <div className={`sidebar__footer ${isPlayerVisible ? 'sidebar__footer--with-player' : ''}`}>
                    <ul className="sidebar__menu">
                        {settingsItems.map((item, index) => (
                            <li key={index} className="sidebar__item">
                                <NavLink
                                    to={item.path}
                                    className={({isActive}) =>
                                        `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                                    }
                                    onClick={handleLinkClick}
                                >
                                    <item.icon className="sidebar__icon"/>
                                    <span className="sidebar__label">{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>
        </>
    );
}