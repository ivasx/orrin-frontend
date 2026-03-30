import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X, Camera, Loader2 } from 'lucide-react';
import styles from './ArtistEditModal.module.css'

export default function ArtistEditModal({ artist, onClose, onSave, isSaving }) {
    const { t } = useTranslation();
    const [name, setName] = useState(artist.name || '');
    const [bio, setBio] = useState(artist.description || '');
    const [avatarFile, setAvatarFile] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(artist.imageUrl || '');
    const [bannerPreview, setBannerPreview] = useState(artist.imageUrl || '');

    const handleFileChange = (file, setFile, setPreview) => {
        setFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name.trim());
        formData.append('description', bio.trim());
        if (avatarFile) formData.append('image', avatarFile);
        if (bannerFile) formData.append('banner', bannerFile);
        onSave(formData);
    };

    return (
        <div
            className={styles.modalOverlay}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className={styles.editModal}>
                <div className={styles.editModalHeader}>
                    <h2>{t('edit_artist_profile')}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className={styles.editModalClose}
                        aria-label={t('close')}
                    >
                        <X size={20} />
                    </button>
                </div>

                <form className={styles.editModalBody} onSubmit={handleSubmit}>
                    <div className={styles.editFormGroup}>
                        <label className={styles.editFormLabel}>
                            {t('artist_banner_image')}
                        </label>
                        <div className={styles.bannerEditWrapper}>
                            <img src={bannerPreview} alt="Banner preview" className={styles.bannerEditPreview} />
                            <label className={styles.filePickerBtn}>
                                <Camera size={16} />
                                {t('change_banner')}
                                <input
                                    type="file" accept="image/*" className={styles.hiddenInput}
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) handleFileChange(f, setBannerFile, setBannerPreview);
                                        e.target.value = '';
                                    }}
                                />
                            </label>
                        </div>
                    </div>

                    <div className={styles.editFormGroup}>
                        <label className={styles.editFormLabel}>
                            {t('artist_avatar')}
                        </label>
                        <div className={styles.avatarEditRow}>
                            <img src={avatarPreview} alt="Avatar preview" className={styles.avatarEditPreview} />
                            <label className={styles.filePickerBtn}>
                                <Camera size={16} />
                                {t('change_photo')}
                                <input
                                    type="file" accept="image/*" className={styles.hiddenInput}
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) handleFileChange(f, setAvatarFile, setAvatarPreview);
                                        e.target.value = '';
                                    }}
                                />
                            </label>
                        </div>
                    </div>

                    <div className={styles.editFormGroup}>
                        <label htmlFor="artist-name" className={styles.editFormLabel}>
                            {t('artist_name')}
                        </label>
                        <input
                            id="artist-name" type="text" value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={styles.editFormInput}
                            required disabled={isSaving}
                        />
                    </div>

                    <div className={styles.editFormGroup}>
                        <label htmlFor="artist-bio" className={styles.editFormLabel}>
                            {t('artist_bio')}
                        </label>
                        <textarea
                            id="artist-bio" value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className={styles.editFormTextarea}
                            rows={5} disabled={isSaving}
                        />
                    </div>

                    <div className={styles.editModalActions}>
                        <button
                            type="button" onClick={onClose}
                            className={styles.cancelBtn} disabled={isSaving}
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            className={styles.saveBtn}
                            disabled={isSaving || !name.trim()}
                        >
                            {isSaving ? (
                                <><Loader2 size={16} className={styles.spinIcon} />{t('saving')}</>
                            ) : (
                                <><Check size={16} />{t('save_changes')}</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}