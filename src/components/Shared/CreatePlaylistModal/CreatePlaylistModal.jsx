import { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, ImagePlus, Loader } from 'lucide-react';
import { createPlaylist } from '../../../services/api/index.js';
import { useToast } from '../../../context/ToastContext.jsx';
import Button from '../../UI/Button/Button.jsx';
import styles from './CreatePlaylistModal.module.css';

export default function CreatePlaylistModal({ isOpen, onClose }) {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const modalRef = useRef(null);
    const fileInputRef = useRef(null);
    const nameInputRef = useRef(null);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const mutation = useMutation({
        mutationFn: (formData) => createPlaylist(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userPlaylists'] });
            showToast(t('playlist_created'), 'success');
            handleClose();
        },
        onError: () => {
            showToast(t('error_playlist_create'), 'error');
        },
    });

    const handleClose = useCallback(() => {
        setName('');
        setDescription('');
        setImageFile(null);
        setImagePreview(null);
        onClose();
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e) => {
            if (e.key === 'Escape') handleClose();
        };

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleEscape);

        setTimeout(() => nameInputRef.current?.focus(), 50);

        return () => {
            document.body.style.overflow = originalOverflow;
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, handleClose]);

    useEffect(() => {
        if (!isOpen || !modalRef.current) return;

        const modalElement = modalRef.current;
        const focusableElements = modalElement.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement  = focusableElements[focusableElements.length - 1];

        const handleTabKey = (e) => {
            if (e.key !== 'Tab') return;
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        };

        modalElement.addEventListener('keydown', handleTabKey);
        return () => modalElement.removeEventListener('keydown', handleTabKey);
    }, [isOpen]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showToast(t('error_file_size'), 'error');
            return;
        }

        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        const formData = new FormData();
        formData.append('name', name.trim());
        formData.append('description', description.trim());
        if (imageFile) formData.append('image', imageFile);

        mutation.mutate(formData);
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div
            className={styles.overlay}
            onClick={handleClose}
            role="presentation"
        >
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-playlist-title"
            >
                <div className={styles.header}>
                    <h2 id="create-playlist-title" className={styles.title}>
                        {t('create_playlist')}
                    </h2>
                    <button
                        className={styles.closeBtn}
                        onClick={handleClose}
                        aria-label={t('close')}
                        type="button"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.imageSection}>
                        <button
                            type="button"
                            className={styles.imagePicker}
                            onClick={() => fileInputRef.current?.click()}
                            aria-label={t('upload_cover')}
                        >
                            {imagePreview ? (
                                <img
                                    src={imagePreview}
                                    alt="Cover preview"
                                    className={styles.imagePreview}
                                />
                            ) : (
                                <div className={styles.imagePlaceholder}>
                                    <ImagePlus size={32} className={styles.imagePlaceholderIcon} />
                                    <span className={styles.imagePlaceholderText}>
                                        {t('add_cover')}
                                    </span>
                                </div>
                            )}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                        />
                    </div>

                    <div className={styles.fields}>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label} htmlFor="playlist-name">
                                {t('playlist_name')}
                            </label>
                            <input
                                ref={nameInputRef}
                                id="playlist-name"
                                type="text"
                                className={styles.input}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={t('playlist_name_placeholder')}
                                maxLength={100}
                                required
                                disabled={mutation.isPending}
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label} htmlFor="playlist-desc">
                                {t('description')}
                            </label>
                            <textarea
                                id="playlist-desc"
                                className={styles.textarea}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={t('playlist_desc_placeholder')}
                                maxLength={300}
                                rows={3}
                                disabled={mutation.isPending}
                            />
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleClose}
                            disabled={mutation.isPending}
                        >
                            {t('cancel')}
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={!name.trim() || mutation.isPending}
                        >
                            {mutation.isPending ? (
                                <>
                                    <Loader size={16} className={styles.spinner} />
                                    {t('creating')}
                                </>
                            ) : (
                                t('create')
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}