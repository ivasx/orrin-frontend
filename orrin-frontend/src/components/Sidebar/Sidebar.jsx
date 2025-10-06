import { Home, NewspaperIcon, Library, Music, Heart, Clock, TrendingUp, Settings, Disc } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar({ isOpen, onClose }) {
  const menuItems = [
    { icon: Home, label: 'Головна', path: '/' },
    { icon: NewspaperIcon, label: 'Стрічка', path: '/feed' },
    { icon: Library, label: 'Бібліотека', path: '/library' }
  ];

  const libraryItems = [
    { icon: Music, label: 'Плейлісти', path: '/playlists' },
    { icon: Heart, label: 'Улюблене', path: '/favorites' },
    { icon: Clock, label: 'Історія', path: '/history' },
    { icon: TrendingUp, label: 'Топ треки', path: '/top' },
    { icon: Disc, label: 'Радіо', path: '/radio' }
  ];

  const settingsItems = [
    { icon: Settings, label: 'Налаштування', path: '/settings' }
  ];

  // Функція для закриття сайдбару тільки на мобільних
  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
    {/* Backdrop для мобільних */}
    {isOpen && (
      <div
        className="sidebar-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
    )}

      <aside className={`sidebar ${isOpen ? 'sidebar--open' : 'sidebar--collapsed'}`}>
        <nav className="sidebar__nav">
          {/* Основне меню */}
          <ul className="sidebar__menu">
            {menuItems.map((item, index) => (
              <li key={index} className="sidebar__item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                  }
                  onClick={handleLinkClick}
                >
                  <item.icon className="sidebar__icon" />
                  <span className="sidebar__label">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Розділювач */}
          <div className="sidebar__divider" />

          {/* Бібліотека */}
          <div className="sidebar__section">
            <h3 className="sidebar__section-title">Моя музика</h3>
            <ul className="sidebar__menu">
              {libraryItems.map((item, index) => (
                <li key={index} className="sidebar__item">
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                    }
                    onClick={handleLinkClick}
                  >
                    <item.icon className="sidebar__icon" />
                    <span className="sidebar__label">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Налаштування внизу */}
        <div className="sidebar__footer">
          <ul className="sidebar__menu">
            {settingsItems.map((item, index) => (
              <li key={index} className="sidebar__item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                  }
                  onClick={handleLinkClick}
                >
                  <item.icon className="sidebar__icon" />
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