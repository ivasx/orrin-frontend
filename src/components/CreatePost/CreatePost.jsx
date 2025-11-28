import {useState, useRef} from 'react';
import {useTranslation} from 'react-i18next';
import {Music, X, Image, Smile} from 'lucide-react';
import {useQuery} from '@tanstack/react-query';
import {getTracks} from '../../services/api';
import './CreatePost.css';

export default function CreatePost({onPostCreated}) {
    const {t} = useTranslation();
    const [postText, setPostText] = useState('');
    const [attachedTrack, setAttachedTrack] = useState(null);
    const [showTrackPicker, setShowTrackPicker] = useState(false);
    const [trackSearchQuery, setTrackSearchQuery] = useState('');
    const textareaRef = useRef(null);

    const {data: availableTracks = []} = useQuery({
        queryKey: ['tracks'],
        queryFn: getTracks,
        enabled: showTrackPicker
    });

    const handleTextareaChange = (e) => {
        setPostText(e.target.value);

        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        }
    };

    const handleAttachTrack = () => {
        setShowTrackPicker(true);
    };

    const handleSelectTrack = (track) => {
        setAttachedTrack({
            trackId: track.slug,
            title: track.title,
            artist: track.artist?.name || 'Unknown Artist',
            cover: track.coverUrl || '/orrin-logo.svg',
            audio: track.audioUrl
        });
        setShowTrackPicker(false);
        setTrackSearchQuery('');
    };

    const handleRemoveTrack = () => {
        setAttachedTrack(null);
    };

    const handleSubmit = () => {
        if (!postText.trim() && !attachedTrack) return;

        const newPost = {
            id: `post-${Date.now()}`,
            author: {
                id: 'current-user',
                name: t('you', 'Ви'),
                avatar: '/path/to/user/avatar.png',
                isVerified: false,
                isArtist: false
            },
            text: postText,
            attachedTrack: attachedTrack,
            timestamp: t('just_now', 'щойно'),
            fullTimestamp: new Date().toLocaleString('uk-UA'),
            likesCount: 0,
            commentsCount: 0,
            repostsCount: 0,
            isLiked: false,
            comments: []
        };

        onPostCreated(newPost);

        setPostText('');
        setAttachedTrack(null);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const filteredTracks = availableTracks.filter(track => {
        if (!trackSearchQuery) return true;
        const query = trackSearchQuery.toLowerCase();
        const title = track.title?.toLowerCase() || '';
        const artist = track.artist?.name?.toLowerCase() || '';
        return title.includes(query) || artist.includes(query);
    });

    return (
        <>
            <div className="create-post">
                <div className="create-post-header">
                    <img
                        src="/path/to/user/avatar.png"
                        alt={t('your_avatar', 'Ваш аватар')}
                        className="create-post-avatar"
                    />
                    <div className="create-post-form">
                        <textarea
                            ref={textareaRef}
                            className="create-post-textarea"
                            placeholder={t('create_post_placeholder', 'Що нового?')}
                            value={postText}
                            onChange={handleTextareaChange}
                            rows={1}
                        />

                        {attachedTrack && (
                            <div className="create-post-track-preview">
                                <img
                                    src={attachedTrack.cover}
                                    alt={attachedTrack.title}
                                    className="create-post-track-cover"
                                />
                                <div className="create-post-track-info">
                                    <div className="create-post-track-title">
                                        {attachedTrack.title}
                                    </div>
                                    <div className="create-post-track-artist">
                                        {attachedTrack.artist}
                                    </div>
                                </div>
                                <button
                                    className="create-post-track-remove"
                                    onClick={handleRemoveTrack}
                                    aria-label={t('remove_track', 'Видалити трек')}
                                >
                                    <X size={20}/>
                                </button>
                            </div>
                        )}

                        <div className="create-post-actions">
                            <div className="create-post-tools">
                                <button
                                    className="create-post-tool-button"
                                    onClick={handleAttachTrack}
                                    aria-label={t('attach_music', 'Прикріпити музику')}
                                    disabled={!!attachedTrack}
                                >
                                    <Music size={20}/>
                                </button>
                                <button
                                    className="create-post-tool-button"
                                    disabled
                                    aria-label={t('attach_image', 'Прикріпити зображення')}
                                >
                                    <Image size={20}/>
                                </button>
                                <button
                                    className="create-post-tool-button"
                                    disabled
                                    aria-label={t('add_emoji', 'Додати емодзі')}
                                >
                                    <Smile size={20}/>
                                </button>
                            </div>

                            <button
                                className="create-post-submit"
                                onClick={handleSubmit}
                                disabled={!postText.trim() && !attachedTrack}
                            >
                                {t('publish', 'Опублікувати')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showTrackPicker && (
                <div
                    className="track-picker-modal-overlay"
                    onClick={() => setShowTrackPicker(false)}
                >
                    <div
                        className="track-picker-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="track-picker-header">
                            <h3 className="track-picker-title">
                                {t('select_track', 'Оберіть трек')}
                            </h3>
                            <button
                                className="track-picker-close"
                                onClick={() => setShowTrackPicker(false)}
                            >
                                <X size={24}/>
                            </button>
                        </div>

                        <div className="track-picker-search">
                            <input
                                type="text"
                                className="track-picker-search-input"
                                placeholder={t('search_tracks', 'Шукати треки...')}
                                value={trackSearchQuery}
                                onChange={(e) => setTrackSearchQuery(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="track-picker-list">
                            {filteredTracks.map(track => (
                                <div
                                    key={track.slug}
                                    className="track-picker-item"
                                    onClick={() => handleSelectTrack(track)}
                                >
                                    <img
                                        src={track.coverUrl || '/orrin-logo.svg'}
                                        alt={track.title}
                                        className="track-picker-item-cover"
                                    />
                                    <div className="track-picker-item-info">
                                        <div className="track-picker-item-title">
                                            {track.title}
                                        </div>
                                        <div className="track-picker-item-artist">
                                            {track.artist?.name || 'Unknown Artist'}
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