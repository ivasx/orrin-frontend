import {useState, useRef} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {useArtistMutations} from '../../../hooks/useArtistMutations.jsx';
import styles from '../ArtistDashboardPage.module.css';

export default function UploadTrackView({artistSlug}) {
    const {t} = useTranslation();
    const {uploadTrackMutation} = useArtistMutations(artistSlug);

    const [title, setTitle] = useState('');
    const [isExplicit, setIsExplicit] = useState(false);
    const [audioFile, setAudioFile] = useState(null);

    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('audio/')) {
            setAudioFile(file);
        } else {
            setAudioFile(null);
            uploadTrackMutation.reset();
        }
    };

    const handleUploadSubmit = (event) => {
        event.preventDefault();

        if (!audioFile || !title.trim()) return;

        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('artist', artistSlug);
        formData.append('is_explicit', isExplicit);
        formData.append('audio_file', audioFile);

        uploadTrackMutation.mutate(formData, {
            onSuccess: () => {
                setTitle('');
                setIsExplicit(false);
                setAudioFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    const isUploading = uploadTrackMutation.isPending;

    return (
        <div className={styles.viewContainer}>
            <h2 className={styles.viewTitle}>{t('artistDashboard.upload.title')}</h2>

            <form className={styles.dashboardForm} onSubmit={handleUploadSubmit}>
                <div className={styles.formGroup}>
                    <label htmlFor="trackTitle">{t('artistDashboard.upload.trackTitle')}</label>
                    <input
                        type="text"
                        id="trackTitle"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={t('artistDashboard.upload.trackTitlePlaceholder')}
                        disabled={isUploading}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="audioFile">{t('artistDashboard.upload.audioFile')}</label>
                    <input
                        type="file"
                        id="audioFile"
                        accept="audio/*"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        disabled={isUploading}
                        required
                    />
                    {audioFile && (
                        <span className={styles.fileHint}>{audioFile.name}</span>
                    )}
                </div>

                <div className={styles.checkboxGroup}>
                    <input
                        type="checkbox"
                        id="isExplicit"
                        checked={isExplicit}
                        onChange={(e) => setIsExplicit(e.target.checked)}
                        disabled={isUploading}
                    />
                    <label htmlFor="isExplicit">
                        {t('artistDashboard.upload.explicitContent')}
                    </label>
                </div>

                {uploadTrackMutation.isError && (
                    <div className={`${styles.statusMessage} ${styles.error}`}>
                        {uploadTrackMutation.error?.message || t('artistDashboard.upload.errorGeneric')}
                    </div>
                )}

                {uploadTrackMutation.isSuccess && (
                    <div className={`${styles.statusMessage} ${styles.success}`}>
                        {t('artistDashboard.upload.successMessage')}
                    </div>
                )}

                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isUploading || !audioFile || !title.trim()}
                >
                    {isUploading
                        ? t('artistDashboard.upload.uploadingBtn')
                        : t('artistDashboard.upload.publishBtn')}
                </button>
            </form>
        </div>
    );
}

UploadTrackView.propTypes = {
    artistSlug: PropTypes.string.isRequired,
};