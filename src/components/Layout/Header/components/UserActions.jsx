import { useTranslation } from "react-i18next";
import Button from "../../../UI/Button/Button";
import styles from "../Header.module.css";
import { useAuth } from "../../../../context/AuthContext";

export const UserActions = () => {
    const { t } = useTranslation();
    const { user, logout } = useAuth();

    return (
        <>
            <span className={styles.username}>{user?.username}</span>
            <Button
                variant="outline"
                className={styles.logoutBtn}
                onClick={logout}
            >
                {t('logout')}
            </Button>
        </>
    );
};