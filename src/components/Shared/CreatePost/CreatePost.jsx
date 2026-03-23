import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Music, X, Image as ImageIcon, Smile } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getTracks, createPost } from '../../../services/api/index.js';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useToast } from '../../../context/ToastContext.jsx';
import { logger } from '../../../utils/logger.js';
import styles from './CreatePost.module.css';

const COMMON_EMOJIS = ['🔥', '❤️', '😍', '😂', '👍', '🎸', '🎵', '🎹', '🤔', '😢', '😎', '🙌'];

export default function CreatePost({ onPostCreated }) {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [postText, setPostText] = useState('');
    const [attachedTrack, setAttachedTrack] = useState(null);
    const [attachedImage, setAttachedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [showTrackPicker, setShowTrackPicker] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [trackSearchQuery, setTrackSearchQuery] = useState('');

    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);

    const { data: availableTracks = [] } = useQuery({
        queryKey: ['tracks'],
        queryFn: getTracks,
        enabled: showTrackPicker,
        staleTime: 5 * 60 * 1000 // Cache for 5 minutes
    });

    const createPostMutation = useMutation({
        mutationFn: (formData) => createPost(formData),
        onSuccess: (newPostData) => {
            showToast(t('post_created'), 'success');

            if (onPostCreated) {
                onPostCreated(newPostData);
            }

            // Reset Form reliably
            setPostText('');
            setAttachedTrack(null);
            setAttachedImage(null);
            setImagePreview(null);
            setShowEmojiPicker(false);

            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        },
        onError: (error) => {
            logger.error('Failed to create post:', error);
            showToast(t('error_post_create'), 'error');
        }
    });

    const handleTextareaChange = (e) => {
        setPostText(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    };

    const handleImageClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showToast(t('error_file_size'), 'error');
                return;
            }

            setAttachedImage(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setAttachedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleAttachTrack = () => setShowTrackPicker(true);

    const handleSelectTrack = (track) => {
        setAttachedTrack({
            trackId: track.slug,
            title: track.title,
            artist: track.artist?.name || 'Unknown',
            cover: track.coverUrl || '/orrin-logo.svg',
        });
        setShowTrackPicker(false);
        setTrackSearchQuery('');
    };

    const handleRemoveTrack = () => setAttachedTrack(null);

    const handleAddEmoji = (emoji) => {
        setPostText(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    const handleSubmit = () => {
        if (!postText.trim() && !attachedTrack && !attachedImage) return;

        const formData = new FormData();
        formData.append('text', postText);

        if (attachedTrack) {
            formData.append('track_id', attachedTrack.trackId);
        }

        if (attachedImage) {
            formData.append('image', attachedImage);
        }

        createPostMutation.mutate(formData);
    };

    const filteredTracks = availableTracks.filter(track => {
        if (!trackSearchQuery) return true;
        const query = trackSearchQuery.toLowerCase();
        const title = track.title?.toLowerCase() || '';
        const artist = track.artist?.name?.toLowerCase() || '';
        return title.includes(query) || artist.includes(query);
    });

    // Spam click protection via isPending
    const isSubmitDisabled = (!postText.trim() && !attachedTrack && !attachedImage) || createPostMutation.isPending;

    return (
        <>
            <div className={styles.container}>
                <div className={styles.header}>
                    <img
                        src={user?.avatar || '/default-avatar.png'}
                        alt={user?.name || t('you')}
                        className={styles.avatar}
                    />
                    <div className={styles.form}>
                        <textarea
                            ref={textareaRef}
                            className={styles.textarea}
                            placeholder={t('create_post_placeholder')}
                            value={postText}
                            onChange={handleTextareaChange}
                            rows={1}
                            disabled={createPostMutation.isPending}
                        />

                        {imagePreview && (
                            <div className={styles.attachmentPreview}>
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className={styles.imagePreview}
                                />
                                <button
                                    className={styles.removeButton}
                                    onClick={handleRemoveImage}
                                    type="button"
                                    disabled={createPostMutation.isPending}
                                >
                                    <X size={16}/>
                                </button>
                            </div>
                        )}

                        {attachedTrack && (
                            <div className={styles.attachmentPreview}>
                                <img
                                    src={attachedTrack.cover}
                                    alt={attachedTrack.title}
                                    className={styles.trackCover}
                                />
                                <div className={styles.trackInfo}>
                                    <div className={styles.trackTitle}>
                                        {attachedTrack.title}
                                    </div>
                                    <div className={styles.trackArtist}>
                                        {attachedTrack.artist}
                                    </div>
                                </div>
                                <button
                                    className={styles.removeButton}
                                    onClick={handleRemoveTrack}
                                    aria-label={t('remove_track', 'Remove track')}
                                    disabled={createPostMutation.isPending}
                                >
                                    <X size={16}/>
                                </button>
                            </div>
                        )}

                        <div className={styles.actions}>
                            <div className={styles.tools}>
                                <button
                                    className={`${styles.toolButton} ${attachedTrack ? styles.toolButtonActive : ''}`}
                                    onClick={handleAttachTrack}
                                    aria-label={t('attach_music', 'Attach music')}
                                    disabled={!!attachedTrack || createPostMutation.isPending}
                                    type="button"
                                >
                                    <Music size={20}/>
                                </button>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                <button
                                    className={`${styles.toolButton} ${attachedImage ? styles.toolButtonActive : ''}`}
                                    onClick={handleImageClick}
                                    aria-label={t('attach_image', 'Attach image')}
                                    disabled={!!attachedImage || createPostMutation.isPending}
                                    type="button"
                                >
                                    <ImageIcon size={20}/>
                                </button>

                                <div style={{ position: 'relative' }}>
                                    <button
                                        className={`${styles.toolButton} ${showEmojiPicker ? styles.toolButtonActive : ''}`}
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        aria-label={t('add_emoji')}
                                        type="button"
                                        disabled={createPostMutation.isPending}
                                    >
                                        <Smile size={20}/>
                                    </button>

                                    {showEmojiPicker && (
                                        <div className={styles.emojiPicker}>
                                            {COMMON_EMOJIS.map(emoji => (
                                                <button
                                                    key={emoji}
                                                    className={styles.emojiItem}
                                                    onClick={() => handleAddEmoji(emoji)}
                                                    type="button"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                className={styles.submitButton}
                                onClick={handleSubmit}
                                disabled={isSubmitDisabled}
                            >
                                {createPostMutation.isPending ? t('publishing') : t('publish')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showTrackPicker && (
                <div
                    className={styles.modalOverlay}
                    onClick={() => setShowTrackPicker(false)}
                >
                    <div
                        className={styles.modal}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>
                                {t('select_track')}
                            </h3>
                            <button
                                className={styles.modalClose}
                                onClick={() => setShowTrackPicker(false)}
                            >
                                <X size={24}/>
                            </button>
                        </div>

                        <div className={styles.modalSearch}>
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder={t('search_tracks')}
                                value={trackSearchQuery}
                                onChange={(e) => setTrackSearchQuery(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className={styles.trackList}>
                            {filteredTracks.map(track => (
                                <div
                                    key={track.slug}
                                    className={styles.trackItem}
                                    onClick={() => handleSelectTrack(track)}
                                >
                                    <img
                                        src={track.coverUrl || '/orrin-logo.svg'}
                                        alt={track.title}
                                        className={styles.trackItemCover}
                                    />
                                    <div className={styles.trackItemInfo}>
                                        <div className={styles.trackItemTitle}>
                                            {track.title}
                                        </div>
                                        <div className={styles.trackItemArtist}>
                                            {track.artist?.name || 'Unknown'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}