import { useTranslation } from 'react-i18next';
import { MapPin, Globe, Calendar } from 'lucide-react';
import InfoSection from '../../../../components/Shared/InfoSection/InfoSection.jsx';
import styles from './AboutTab.module.css';

export const AboutTab = ({ profile }) => {
    const { t } = useTranslation();

    if (!profile.bio && !profile.location && !profile.website) {
        return <InfoSection message={t('profile_no_about_info')} />;
    }

    return (
        <div className={styles.container}>
            {profile.bio && (
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>{t('profile_bio_title')}</h3>
                    <p className={styles.sectionText}>{profile.bio}</p>
                </div>
            )}

            <div className={styles.metaList}>
                {profile.location && (
                    <div className={styles.metaItem}>
                        <MapPin size={16} className={styles.metaIcon} />
                        <span>{profile.location}</span>
                    </div>
                )}
                {profile.website && (
                    <div className={styles.metaItem}>
                        <Globe size={16} className={styles.metaIcon} />
                        <a
                            href={profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.metaLink}
                        >
                            {profile.website.replace(/^https?:\/\//, '')}
                        </a>
                    </div>
                )}
                {profile.date_joined && (
                    <div className={styles.metaItem}>
                        <Calendar size={16} className={styles.metaIcon} />
                        <span>
                            {t('joined_date')}{' '}
                            {new Date(profile.date_joined).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                            })}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};