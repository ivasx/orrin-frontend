import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext.jsx";
import { Bell, Settings, LogOut } from "lucide-react";
import Button from "../../../UI/Button/Button.jsx";
import Dropdown from "../../../UI/Dropdown/Dropdown.jsx";
import styles from "./UserActions.module.css";

export const UserActions = () => {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const firstLetter = user?.username ? user.username.charAt(0).toUpperCase() : '?';

    const AvatarComponent = (
        <div className={styles.avatarTrigger} aria-label={t('user_menu')}>
            {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.username} className={styles.avatarImage} />
            ) : (
                <div className={styles.avatarPlaceholder}>
                    {firstLetter}
                </div>
            )}
        </div>
    );

    const menuItems = [
        {
            type: 'header',
            label: user?.username || t('guest'),
            action: () => navigate(`/user/${user?.username}`),
        },
        { type: 'separator' },
        {
            value: 'settings',
            label: t('edit_profile'),
            icon: <Settings size={16} />,
            action: () => navigate('/settings'),
        },
        { type: 'separator' },
        {
            value: 'logout',
            label: t('logout'),
            icon: <LogOut size={16} />,
            action: logout,
            isDanger: true,
        },
    ];

    return (
        <div className={styles.actionsContainer}>
            <Button
                variant="icon"
                className={styles.notificationBtn}
                aria-label={t('notifications')}
            >
                <Bell size={22} strokeWidth={1.5} />
            </Button>

            <Dropdown
                customTrigger={AvatarComponent}
                items={menuItems}
            />
        </div>
    );
};