import { useTranslation } from 'react-i18next';
import InfoSection from '../../../../components/Shared/InfoSection/InfoSection.jsx';

export const AboutTab = ({ profile }) => {
    const { t } = useTranslation();

    if (!profile.bio && !profile.location) {
        return <InfoSection message={t('profile_no_about_info', 'This user has not provided any details yet.')} />;
    }

    return (
        <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto', color: 'var(--text-color-primary, #fff)' }}>
            {profile.bio && (
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{t('profile_bio_title', 'Biography')}</h3>
                    <p style={{ color: 'var(--text-color-secondary, #b3b3b3)', lineHeight: '1.6' }}>{profile.bio}</p>
                </div>
            )}

            {profile.location && (
                <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{t('profile_location_title', 'Location')}</h3>
                    <p style={{ color: 'var(--text-color-secondary, #b3b3b3)' }}>{profile.location}</p>
                </div>
            )}
        </div>
    );
};