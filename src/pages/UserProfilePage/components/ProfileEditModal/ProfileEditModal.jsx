import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Check, Camera, Loader2 } from 'lucide-react';
import styles from './ProfileEditModal.module.css';

export const ProfileEditModal = ({ profile, onClose, onSave, isSaving }) => {
    const { t } = useTranslation();
    const [firstName, setFirstName]         = useState(profile.first_name || '');
    const [lastName, setLastName]           = useState(profile.last_name  || '');
    const [bio, setBio]                     = useState(profile.bio        || '');
    const [location, setLocation]           = useState(profile.location   || '');
    const [website, setWebsite]             = useState(profile.website    || '');
    const [avatarFile, setAvatarFile]       = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(profile.avatar || '/default-avatar.png');

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setAvatarPreview(reader.result);
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('first_name', firstName.trim());
        formData.append('last_name',  lastName.trim());
        formData.append('bio',        bio.trim());
        formData.append('location',   location.trim());
        formData.append('website',    website.trim());
        if (avatarFile) formData.append('avatar', avatarFile);
        onSave(formData);
    };

    return (
        <div
            className={styles.modalOverlay}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className={styles.editModal}>
                <div className={styles.editModalHeader}>
                    <h2>{t('edit_profile')}</h2>
                    <button
                        type="button"
                        className={styles.editModalClose}
                        onClick={onClose}
                        aria-label={t('close')}
                    >
                        <X size={20} />
                    </button>
                </div>

                <form className={styles.editModalBody} onSubmit={handleSubmit}>
                    <div className={styles.editAvatarRow}>
                        <img
                            src={avatarPreview}
                            alt={t('avatar_preview')}
                            className={styles.editAvatarPreview}
                        />
                        <label className={styles.filePickerBtn}>
                            <Camera size={15} />
                            {t('change_avatar')}
                            <input
                                type="file"
                                accept="image/*"
                                className={styles.hiddenInput}
                                onChange={handleAvatarChange}
                            />
                        </label>
                    </div>

                    <div className={styles.editRow}>
                        <div className={styles.editFormGroup}>
                            <label htmlFor="first-name" className={styles.editFormLabel}>
                                {t('first_name_label')}
                            </label>
                            <input
                                id="first-name"
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className={styles.editFormInput}
                                disabled={isSaving}
                            />
                        </div>
                        <div className={styles.editFormGroup}>
                            <label htmlFor="last-name" className={styles.editFormLabel}>
                                {t('last_name_label')}
                            </label>
                            <input
                                id="last-name"
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className={styles.editFormInput}
                                disabled={isSaving}
                            />
                        </div>
                    </div>

                    <div className={styles.editFormGroup}>
                        <label htmlFor="bio" className={styles.editFormLabel}>
                            {t('profile_bio_title')}
                        </label>
                        <textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className={styles.editFormTextarea}
                            rows={4}
                            placeholder={t('bio_placeholder')}
                            disabled={isSaving}
                        />
                    </div>

                    <div className={styles.editFormGroup}>
                        <label htmlFor="location" className={styles.editFormLabel}>
                            {t('profile_location_title')}
                        </label>
                        <input
                            id="location"
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className={styles.editFormInput}
                            placeholder={t('location_placeholder')}
                            disabled={isSaving}
                        />
                    </div>

                    <div className={styles.editFormGroup}>
                        <label htmlFor="website" className={styles.editFormLabel}>
                            {t('profile_website_title')}
                        </label>
                        <input
                            id="website"
                            type="url"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            className={styles.editFormInput}
                            placeholder="https://"
                            disabled={isSaving}
                        />
                    </div>

                    <div className={styles.editModalActions}>
                        <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={onClose}
                            disabled={isSaving}
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            className={styles.saveBtn}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 size={16} className={styles.spinIcon} />
                                    {t('saving')}
                                </>
                            ) : (
                                <>
                                    <Check size={16} />
                                    {t('save_changes')}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};