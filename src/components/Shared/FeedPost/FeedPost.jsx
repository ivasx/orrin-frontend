import { useState, useRef, memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { logger } from '../../../utils/logger.js';
import {
    Heart,
    MessageCircle,
    Repeat2,
    Send,
    MoreHorizontal,
    Music,
    Play,
    CheckCircle
} from 'lucide-react';
import { useAudioCore } from '../../../context/AudioCoreContext.jsx';
import ContextMenu from '../../UI/OptionsMenu/OptionsMenu.jsx';
import './FeedPost.css';

function FeedPost({ post }) {
    const { t } = useTranslation();
    const { playTrack } = useAudioCore();

    const [isLiked, setIsLiked] = useState(post.isLiked || false);
    const [likesCount, setLikesCount] = useState(post.likesCount || 0);
    const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState(post.comments || []);
    const [showMenu, setShowMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

    const menuButtonRef = useRef(null);

    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    };

    const handleComment = () => {
        setShowComments(!showComments);
    };

    const handleRepost = () => {
        // TODO: Implement repost logic
    };

    const handleShare = () => {
        // TODO: Implement share logic
    };

    const handleSubmitComment = (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        const newComment = {
            id: `comment-${Date.now()}`,
            author: {
                name: t('you', 'Ви'),
                avatar: '/path/to/user/avatar.png'
            },
            text: commentText,
            timestamp: t('just_now', 'щойно'),
            likesCount: 0
        };

        setComments([newComment, ...comments]);
        setCommentsCount(commentsCount + 1);
        setCommentText('');
    };

    const handlePlayTrack = () => {
        if (post.attachedTrack) {
            playTrack(post.attachedTrack);
        }
    };

    const handleMenuClick = (e) => {
        e.stopPropagation();
        if (menuButtonRef.current) {
            const rect = menuButtonRef.current.getBoundingClientRect();
            setMenuPosition({ x: rect.left, y: rect.bottom + 5 });
        }
        setShowMenu(!showMenu);
    };

    const menuItems = [
        {
            id: 'save',
            label: t('post_save', 'Зберегти'),
            action: () => {
                // TODO: Implement save post functionality
            }
        },
        {
            id: 'copy-link',
            label: t('post_copy_link', 'Копіювати посилання'),
            action: () => {
                // TODO: Implement copy link functionality
            }
        },
        { type: 'separator' },
        {
            id: 'report',
            label: t('post_report', 'Поскаржитись'),
            variant: 'danger',
            action: () => {
                // TODO: Implement report post functionality
            }
        }
    ];

    const shouldTruncate = post.text && post.text.length > 300;

    return (
        <article className="feed-post">
            <div className="post-header">
                <Link to={`/user/${post.author.id}`}>
                    <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="post-avatar"
                    />
                </Link>

                <div className="post-header-info">
                    <div className="post-author-line">
                        <Link
                            to={`/user/${post.author.id}`}
                            className="post-author-name"
                        >
                            {post.author.name}
                        </Link>
                        {post.author.isVerified && (
                            <CheckCircle
                                size={16}
                                className="post-author-badge"
                                fill="currentColor"
                            />
                        )}
                    </div>
                    <div className="post-meta">
                        <span
                            className="post-timestamp"
                            title={post.fullTimestamp}
                        >
                            {post.timestamp}
                        </span>
                        {post.author.isArtist && (
                            <>
                                <span>•</span>
                                <span>{t('post_artist', 'Музикант')}</span>
                            </>
                        )}
                    </div>
                </div>

                <button
                    ref={menuButtonRef}
                    className="post-menu-button"
                    onClick={handleMenuClick}
                    aria-label={t('post_more_options', 'Більше опцій')}
                >
                    <MoreHorizontal size={20} />
                </button>
            </div>

            <div className="post-content">
                {post.text && (
                    <>
                        <p className={`post-text ${!isExpanded && shouldTruncate ? 'collapsed' : ''}`}>
                            {post.text}
                        </p>
                        {shouldTruncate && (
                            <button
                                className="post-read-more"
                                onClick={() => setIsExpanded(!isExpanded)}
                            >
                                {isExpanded
                                    ? t('show_less', 'Показати менше')
                                    : t('show_more', 'Показати більше')
                                }
                            </button>
                        )}
                    </>
                )}

                {post.attachedTrack && (
                    <div
                        className="post-track-attachment"
                        onClick={handlePlayTrack}
                    >
                        <img
                            src={post.attachedTrack.cover}
                            alt={post.attachedTrack.title}
                            className="post-track-cover"
                        />
                        <div className="post-track-info">
                            <div className="post-track-title">
                                {post.attachedTrack.title}
                            </div>
                            <div className="post-track-artist">
                                {post.attachedTrack.artist}
                            </div>
                        </div>
                        <button
                            className="post-track-play-button"
                            onClick={handlePlayTrack}
                            aria-label={t('play', 'Грати')}
                        >
                            <Play size={20} />
                        </button>
                    </div>
                )}
            </div>

            <div className="post-actions">
                <button
                    className={`post-action-button ${isLiked ? 'liked' : ''}`}
                    onClick={handleLike}
                    aria-label={t('like', 'Вподобати')}
                >
                    <Heart
                        size={20}
                        fill={isLiked ? 'currentColor' : 'none'}
                    />
                    {likesCount > 0 && (
                        <span className="post-action-count">{likesCount}</span>
                    )}
                </button>

                <button
                    className="post-action-button"
                    onClick={handleComment}
                    aria-label={t('comment', 'Коментувати')}
                >
                    <MessageCircle size={20} />
                    {commentsCount > 0 && (
                        <span className="post-action-count">{commentsCount}</span>
                    )}
                </button>

                <button
                    className="post-action-button"
                    onClick={handleRepost}
                    aria-label={t('repost', 'Репост')}
                >
                    <Repeat2 size={20} />
                    {post.repostsCount > 0 && (
                        <span className="post-action-count">{post.repostsCount}</span>
                    )}
                </button>

                <button
                    className="post-action-button"
                    onClick={handleShare}
                    aria-label={t('share', 'Поділитися')}
                >
                    <Send size={20} />
                </button>
            </div>

            {showComments && (
                <div className="post-comments-section">
                    <div className="post-comments-header">
                        <h4 className="post-comments-title">
                            {t('comments', 'Коментарі')} ({commentsCount})
                        </h4>
                    </div>

                    <form
                        className="post-comment-form"
                        onSubmit={handleSubmitComment}
                    >
                        <textarea
                            className="comment-input"
                            placeholder={t('add_comment', 'Додати коментар...')}
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            rows={1}
                            onInput={(e) => {
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                        />
                        <button
                            type="submit"
                            className="comment-submit-button"
                            disabled={!commentText.trim()}
                        >
                            {t('post', 'Опублікувати')}
                        </button>
                    </form>

                    {comments.length > 0 && (
                        <div className="post-comments-list">
                            {comments.slice(0, 3).map(comment => (
                                <div key={comment.id} className="post-comment">
                                    <img
                                        src={comment.author.avatar}
                                        alt={comment.author.name}
                                        className="comment-avatar"
                                    />
                                    <div className="comment-content">
                                        <div className="comment-author">
                                            {comment.author.name}
                                        </div>
                                        <p className="comment-text">
                                            {comment.text}
                                        </p>
                                        <div className="comment-meta">
                                            <span className="comment-timestamp">
                                                {comment.timestamp}
                                            </span>
                                            <span>•</span>
                                            <button className="comment-like-button">
                                                {t('like', 'Вподобати')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {comments.length > 3 && (
                                <button className="show-more-comments">
                                    {t('show_more_comments', 'Показати ще коментарі')}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            <ContextMenu
                isVisible={showMenu}
                position={menuPosition}
                onClose={() => setShowMenu(false)}
                menuItems={menuItems}
            />
        </article>
    );
}

export default memo(FeedPost);