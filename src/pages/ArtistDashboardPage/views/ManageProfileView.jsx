import { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import styles from '../ArtistDashboardPage.module.css';

export default function ManageProfileView({ artistData }) {
    const { t } = useTranslation();

    const [name, setName] = useState(artistData?.name || '');
    const [bio, setBio] = useState(artistData?.bio || '');
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState({ type: '', message: '' });

    const handleSaveProfile = async (event) => {
        event.preventDefault();
        setIsSaving(true);
        setSaveStatus({ type: '', message: '' });

        try {
            const response = await fetch(`/api/artists/${artistData.id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify({ name, bio })
            });

            if (!response.ok) {
                throw new Error(t('artistDashboard.manage.errorUpdateFailed'));
            }

            setSaveStatus({ type: 'success', message: t('artistDashboard.manage.successMessage') });
        } catch (error) {
            setSaveStatus({ type: 'error', message: error.message });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.viewContainer}>
            <h2 className={styles.viewTitle}>{t('artistDashboard.manage.title')}</h2>

            <form className={styles.dashboardForm} onSubmit={handleSaveProfile}>
                <div className={styles.formGroup}>
                    <label htmlFor="artistName">{t('artistDashboard.manage.artistName')}</label>
                    <input
                        type="text"
                        id="artistName"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t('artistDashboard.manage.artistNamePlaceholder')}
                        disabled={isSaving}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="artistBio">{t('artistDashboard.manage.bio')}</label>
                    <textarea
                        id="artistBio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder={t('artistDashboard.manage.bioPlaceholder')}
                        rows={6}
                        disabled={isSaving}
                    />
                </div>

                {saveStatus.message && (
                    <div className={`${styles.statusMessage} ${styles[saveStatus.type]}`}>
                        {saveStatus.message}
                    </div>
                )}

                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isSaving || (name === artistData?.name && bio === artistData?.bio)}
                >
                    {isSaving ? t('artistDashboard.manage.savingBtn') : t('artistDashboard.manage.saveBtn')}
                </button>
            </form>
        </div>
    );
}

ManageProfileView.propTypes = {
    artistData: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
        bio: PropTypes.string
    }).isRequired
};