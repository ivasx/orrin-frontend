import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import styles from '../ArtistDashboardPage.module.css';

export default function UploadTrackView({ artistId }) {
    const { t } = useTranslation();

    const [title, setTitle] = useState('');
    const [isExplicit, setIsExplicit] = useState(false);
    const [audioFile, setAudioFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' });

    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('audio/')) {
            setAudioFile(file);
            setUploadStatus({ type: '', message: '' });
        } else {
            setAudioFile(null);
            setUploadStatus({ type: 'error', message: t('artistDashboard.upload.errorInvalidFile') });
        }
    };

    const handleUploadSubmit = async (event) => {
        event.preventDefault();

        if (!audioFile || !title.trim()) {
            setUploadStatus({ type: 'error', message: t('artistDashboard.upload.errorMissingFields') });
            return;
        }

        setIsUploading(true);
        setUploadStatus({ type: '', message: '' });

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('artist', artistId);
            formData.append('is_explicit', isExplicit);
            formData.append('audio_file', audioFile);

            const response = await fetch('/api/tracks/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to upload track.');
            }

            setUploadStatus({ type: 'success', message: t('artistDashboard.upload.successMessage') });

            setTitle('');
            setIsExplicit(false);
            setAudioFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

        } catch (error) {
            setUploadStatus({ type: 'error', message: error.message });
        } finally {
            setIsUploading(false);
        }
    };

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
                    {audioFile && <span className={styles.fileHint}>{audioFile.name}</span>}
                </div>

                <div className={styles.checkboxGroup}>
                    <input
                        type="checkbox"
                        id="isExplicit"
                        checked={isExplicit}
                        onChange={(e) => setIsExplicit(e.target.checked)}
                        disabled={isUploading}
                    />
                    <label htmlFor="isExplicit">{t('artistDashboard.upload.explicitContent')}</label>
                </div>

                {uploadStatus.message && (
                    <div className={`${styles.statusMessage} ${styles[uploadStatus.type]}`}>
                        {uploadStatus.message}
                    </div>
                )}

                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isUploading}
                >
                    {isUploading ? t('artistDashboard.upload.uploadingBtn') : t('artistDashboard.upload.publishBtn')}
                </button>
            </form>
        </div>
    );
}

UploadTrackView.propTypes = {
    artistId: PropTypes.string.isRequired
};