import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Music2 } from 'lucide-react';
import Button from '../../../components/UI/Button/Button.jsx';
import styles from '../LibraryPage.module.css';

export default function GuestPrompt() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className={styles.guestPrompt}>
            <Music2 size={48} className={styles.guestIcon} />
            <h2 className={styles.guestTitle}>{t('library_auth_title')}</h2>
            <p className={styles.guestText}>
                {t('library_auth_desc')}
            </p>
            <Button variant="primary" onClick={() => navigate('/login')}>
                {t('login')}
            </Button>
        </div>
    );
}