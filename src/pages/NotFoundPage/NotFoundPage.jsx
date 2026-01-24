import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import sadCat from '../../assets/orrin-404.png';
import Button from '../../components/UI/Button/Button';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    useEffect(() => {
    }, []);

    return (
        <div className={styles.container}>
            <h2 className={styles.subtitle}>
                {t('not_found_subtitle')}
            </h2>

            <div className={styles.titleWrapper}>
                <span className={styles.errorCode}>4</span>
                <img
                    src={sadCat}
                    alt={t('not_found_alt_cat')}
                    className={styles.catImage}
                />
                <span className={styles.errorCode}>4</span>
            </div>

            <div className={styles.content}>
                <p className={styles.text}>
                    {t('not_found_text')}
                </p>

                <Button
                    variant="primary"
                    size="large"
                    onClick={() => navigate('/')}
                >
                    {t('not_found_button')}
                </Button>
            </div>
        </div>
    );
}