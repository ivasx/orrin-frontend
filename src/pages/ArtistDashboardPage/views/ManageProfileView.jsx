import { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useArtistMutations } from '../../../hooks/useArtistMutations.jsx';
import styles from '../ArtistDashboardPage.module.css';

export default function ManageProfileView({ artistData, artistSlug }) {
    const { t } = useTranslation();
    const { updateProfileMutation } = useArtistMutations(artistSlug);

    const [name, setName] = useState(artistData?.name || '');
    const [bio, setBio] = useState(artistData?.description || artistData?.bio || '');

    const isSaving = updateProfileMutation.isPending;
    const isUnchanged = name === (artistData?.name || '') && bio === (artistData?.description || artistData?.bio || '');

    const handleSaveProfile = (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('name', name.trim());
        formData.append('description', bio.trim());

        updateProfileMutation.mutate(formData);
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

                {updateProfileMutation.isError && (
                    <div className={`${styles.statusMessage} ${styles.error}`}>
                        {t('artistDashboard.manage.errorUpdateFailed')}
                    </div>
                )}

                {updateProfileMutation.isSuccess && (
                    <div className={`${styles.statusMessage} ${styles.success}`}>
                        {t('artistDashboard.manage.successMessage')}
                    </div>
                )}

                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isSaving || isUnchanged || !name.trim()}
                >
                    {isSaving
                        ? t('artistDashboard.manage.savingBtn')
                        : t('artistDashboard.manage.saveBtn')}
                </button>
            </form>
        </div>
    );
}

ManageProfileView.propTypes = {
    artistData: PropTypes.shape({
        name: PropTypes.string,
        bio: PropTypes.string,
        description: PropTypes.string,
    }).isRequired,
    artistSlug: PropTypes.string.isRequired,
};