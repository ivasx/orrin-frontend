import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {X, Check, Camera, Loader2, Globe, Lock} from 'lucide-react';
import styles from './PlaylistEditModal.module.css';

export default function PlaylistEditModal({playlist, onClose, onSave, isSaving}) {
    const {t} = useTranslation();

    const [name, setName] = useState(playlist.name || '');
    const [description, setDescription] = useState(playlist.description || '');
    const [isPublic, setIsPublic] = useState(playlist.isPublic ?? true);
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(playlist.cover || null);

    const handleCoverChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCoverFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setCoverPreview(reader.result);
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name.trim());
        formData.append('description', description.trim());
        formData.append('is_public', isPublic);
        if (coverFile) formData.append('cover', coverFile);
        onSave(formData);
    };

    return (
        <div
            className={styles.overlay}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2>{t('playlist_edit_details')}</h2>
                    <button
                        type="button"
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label={t('close')}
                    >
                        <X size={20}/>
                    </button>
                </div>

                <form className={styles.body} onSubmit={handleSubmit}>
                    <div className={styles.coverRow}>
                        <div className={styles.coverPreviewWrapper}>
                            {coverPreview ? (
                                <img
                                    src={coverPreview}
                                    alt={t('playlist_cover_preview')}
                                    className={styles.coverPreview}
                                />
                            ) : (
                                <div className={styles.coverFallback}>
                                    <Camera size={24} className={styles.coverFallbackIcon}/>
                                </div>
                            )}
                        </div>
                        <label className={styles.filePickerBtn}>
                            <Camera size={15}/>
                            {t('change_cover')}
                            <input
                                type="file"
                                accept="image/*"
                                className={styles.hiddenInput}
                                onChange={handleCoverChange}
                                disabled={isSaving}
                            />
                        </label>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="playlist-name" className={styles.label}>
                            {t('playlist_name')}
                        </label>
                        <input
                            id="playlist-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={styles.input}
                            required
                            disabled={isSaving}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="playlist-description" className={styles.label}>
                            {t('playlist_description')}
                        </label>
                        <textarea
                            id="playlist-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={styles.textarea}
                            rows={3}
                            placeholder={t('playlist_description_placeholder')}
                            disabled={isSaving}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <span className={styles.label}>{t('playlist_visibility')}</span>
                        <div className={styles.visibilityToggle}>
                            <button
                                type="button"
                                className={`${styles.visibilityOption} ${isPublic ? styles.visibilityOptionActive : ''}`}
                                onClick={() => setIsPublic(true)}
                                disabled={isSaving}
                            >
                                <Globe size={15}/>
                                {t('playlist_public')}
                            </button>
                            <button
                                type="button"
                                className={`${styles.visibilityOption} ${!isPublic ? styles.visibilityOptionActive : ''}`}
                                onClick={() => setIsPublic(false)}
                                disabled={isSaving}
                            >
                                <Lock size={15}/>
                                {t('playlist_private')}
                            </button>
                        </div>
                    </div>

                    <div className={styles.actions}>
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
                            disabled={isSaving || !name.trim()}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 size={16} className={styles.spinIcon}/>
                                    {t('saving')}
                                </>
                            ) : (
                                <>
                                    <Check size={16}/>
                                    {t('save_changes')}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}