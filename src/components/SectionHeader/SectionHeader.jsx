import styles from './SectionHeader.module.css';
import { useTranslation } from 'react-i18next';

export default function SectionHeader({title, onMoreClick}) {
    const {t} = useTranslation();

    return (
        <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>{title}</h3>
            {onMoreClick && (
                <button className={styles.sectionMore} onClick={onMoreClick}>
                    {t('more')}
                </button>
            )}
        </div>
    );
}