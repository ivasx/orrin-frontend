import { useTranslation } from 'react-i18next';
import InfoSection from '../../../../components/Shared/InfoSection/InfoSection.jsx';
import styles from './AboutTab.module.css';

export const AboutTab = ({ profile }) => {
    const { t } = useTranslation();

    if (!profile.bio && !profile.location && !profile.website) {
        return <InfoSection message={t('profile_no_about_info', 'This user has not provided any details yet.')} />;
    }

    return (
        <div className={styles.container}>
            {profile.bio && (
                <div className={styles.section}>
                    <h3 className={styles.title}>{t('profile_bio_title', 'Biography')}</h3>
                    <p className={styles.text}>{profile.bio}</p>
                </div>
            )}

            {profile.location && (
                <div className={styles.section}>
                    <h3 className={styles.title}>{t('profile_location_title', 'Location')}</h3>
                    <p className={styles.text}>{profile.location}</p>
                </div>
            )}

            {profile.website && (
                <div className={styles.section}>
                    <h3 className={styles.title}>{t('profile_website_title', 'Website')}</h3>
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className={styles.link}>
                        {profile.website}
                    </a>
                </div>
            )}
        </div>
    );
};