import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import sadCat from '../../../assets/orrin-404.png';
import Button from '../../UI/Button/Button';
import styles from './InlineError.module.css';

export default function InlineError({ error, title }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const errorCode = error?.status || 404;
    const errorMessage = error?.message || t('error_occurred');

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                <div className={styles.content}>
                    <h1 className={styles.mainTitle}>{title || t('error')}</h1>

                    <div className={styles.textDetails}>
                        <h2 className={styles.errorCode}>{errorCode}</h2>
                        <p className={styles.errorMessage}>{errorMessage}</p>
                    </div>

                    <div className={styles.action}>
                        <Button
                            variant="primary"
                            size="large"
                            onClick={() => navigate('/')}
                        >
                            {t('back_to_home')}
                        </Button>
                    </div>
                </div>

                <div className={styles.visual}>
                    <img
                        src={sadCat}
                        alt="Error cat"
                        className={styles.catImage}
                        draggable="false"
                        onContextMenu={(e) => e.preventDefault()}
                    />
                </div>

            </div>
        </div>
    );
}