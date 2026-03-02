import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Button from "../../../UI/Button/Button";
import styles from "../Header.module.css";

export const GuestActions = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <>
            <Button
                variant="ghost"
                className={styles.registerBtn}
                onClick={() => navigate('/register')}
            >
                {t('register')}
            </Button>
            <Button
                variant="primary"
                className={styles.loginBtn}
                onClick={() => navigate('/login')}
            >
                {t('login')}
            </Button>
        </>
    );
};