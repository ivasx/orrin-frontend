import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../../../../context/AuthContext.jsx';
import {User, Settings, LogOut} from 'lucide-react';
import Dropdown from '../../../UI/Dropdown/Dropdown.jsx';
import {NotificationBell} from './NotificationBell.jsx';
import styles from './UserActions.module.css';

export const UserActions = () => {
    const {t} = useTranslation();
    const {user, logout} = useAuth();
    const navigate = useNavigate();

    const avatarSrc = user?.avatar_url ?? user?.avatarUrl ?? user?.avatar ?? null;
    const firstLetter = user?.username ? user.username.charAt(0).toUpperCase() : '?';

    const menuItems = [
        {
            type: 'header',
            label: user?.username || t('guest'),
            action: () => navigate(`/user/${user?.username}`),
        },
        {type: 'separator'},
        {
            value: 'profile',
            label: t('profile'),
            icon: <User size={16}/>,
            action: () => navigate(`/user/${user?.username}`),
        },
        {
            value: 'settings',
            label: t('settings_title'),
            icon: <Settings size={16}/>,
            action: () => navigate('/settings'),
        },
        {type: 'separator'},
        {
            value: 'logout',
            label: t('logout'),
            icon: <LogOut size={16}/>,
            action: logout,
            isDanger: true,
        },
    ];

    const AvatarComponent = (
        <div className={styles.avatarTrigger} aria-label={t('user_menu')}>
            {avatarSrc ? (
                <img src={avatarSrc} alt={user.username} className={styles.avatarImage}/>
            ) : (
                <div className={styles.avatarPlaceholder}>
                    {firstLetter}
                </div>
            )}
        </div>
    );

    return (
        <div className={styles.actionsContainer}>
            <NotificationBell/>
            <Dropdown customTrigger={AvatarComponent} items={menuItems}/>
        </div>
    );
};