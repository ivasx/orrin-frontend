import { useState, useRef, memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Heart,
    MessageCircle,
    Repeat2,
    Send,
    MoreHorizontal,
    Play,
    CheckCircle,
    Check
} from 'lucide-react';
import { useAudioCore } from '../../../context/AudioCoreContext.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import ContextMenu from '../../UI/OptionsMenu/OptionsMenu.jsx';
import AuthPromptModal from '../AuthPromptModal/AuthPromptModal.jsx';
import { usePostMutations } from '../../../hooks/usePostMutations.js';
import { logger } from '../../../utils/logger.js';
import styles from './FeedPost.module.css';

function FeedPost({ post }) {
    const { t } = useTranslation();
    const { playTrack } = useAudioCore();
    const { user, isLoggedIn } = useAuth();

    // Custom Hook handling all mutations optimistically
    const {
        likeMutation,
        repostMutation,
        saveMutation,
        commentMutation,
        reportMutation
    } = usePostMutations(post, user);

    // UI States (non-data states)
    const [isExpanded, setIsExpanded] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [shareFeedback, setShareFeedback] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const menuButtonRef = useRef(null);

    // Helper to protect actions
    const handleAuthAction = (action) => {
        if (!isLoggedIn) {
            setShowAuthModal(true);
            setShowMenu(false);
            return;
        }
        action();
    };

    const handleLike = () => {
        handleAuthAction(() => likeMutation.mutate());
    };

    const handleRepost = () => {
        handleAuthAction(() => repostMutation.mutate());
    };

    const handleSavePost = () => {
        handleAuthAction(() => {
            saveMutation.mutate();
            setShowMenu(false);
        });
    };

    const handleReportPost = () => {
        handleAuthAction(() => {
            if (window.confirm(t('confirm_report'))) {
                reportMutation.mutate();
            }
            setShowMenu(false);
        });
    };

    const handleCommentToggle = () => setShowComments(!showComments);

    const handleShare = async () => {
        const shareData = {
            title: 'Orrin',
            text: post.text,
            url: `${window.location.origin}/post/${post.id}`,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                logger.log('Shared via native API');
            } else {
                await navigator.clipboard.writeText(shareData.url);
                setShareFeedback(true);
                setTimeout(() => setShareFeedback(false), 2000);
                logger.log('Link copied to clipboard');
            }
        } catch (err) {
            logger.error('Share failed:', err);
        }
    };

    const handleSubmitComment = (e) => {
        e.preventDefault();
        handleAuthAction(() => {
            if (!commentText.trim()) return;
            commentMutation.mutate(commentText);
            setCommentText(''); // Clear input immediately
        });
    };

    const handlePlayTrack = (e) => {
        e.stopPropagation();
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

    const handleCopyLink = () => {
        const url = `${window.location.origin}/post/${post.id}`;
        navigator.clipboard.writeText(url)
            .then(() => {
                setShowMenu(false);
                setShareFeedback(true);
                setTimeout(() => setShareFeedback(false), 2000);
            })
            .catch(err => logger.error('Copy link failed:', err));
    };

    const menuItems = useMemo(() => [
        {
            id: 'copy-link',
            label: t('post_copy_link'),
            action: handleCopyLink
        },
        {
            id: 'save',
            label: post.isSaved ? t('post_unsave') : t('post_save'),
            action: handleSavePost
        },
        { type: 'separator' },
        {
            id: 'report',
            label: t('post_report'),
            variant: 'danger',
            action: handleReportPost
        }
    ], [post.isSaved, t, isLoggedIn]);

    const shouldTruncate = post.text && post.text.length > 300;
    const postComments = post.comments || [];

    return (
        <article className={styles.feedPost}>
            <AuthPromptModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
            />

            <div className={styles.header}>
                <Link to={`/user/${post.author.id}`}>
                    <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className={styles.avatar}
                    />
                </Link>

                <div className={styles.headerInfo}>
                    <div className={styles.authorLine}>
                        <Link
                            to={`/user/${post.author.id}`}
                            className={styles.authorName}
                        >
                            {post.author.name}
                        </Link>
                        {post.author.isVerified && (
                            <CheckCircle
                                size={16}
                                className={styles.authorBadge}
                                fill="currentColor"
                            />
                        )}
                    </div>
                    <div className={styles.meta}>
                        <span
                            className={styles.timestamp}
                            title={post.fullTimestamp}
                        >
                            {post.timestamp}
                        </span>
                        {post.author.isArtist && (
                            <>
                                <span>•</span>
                                <span>{t('post_artist')}</span>
                            </>
                        )}
                    </div>
                </div>

                <button
                    ref={menuButtonRef}
                    className={styles.menuButton}
                    onClick={handleMenuClick}
                    aria-label={t('post_more_options')}
                >
                    <MoreHorizontal size={20} />
                </button>
            </div>

            <div className={styles.content}>
                {post.text && (
                    <>
                        <p className={`${styles.text} ${!isExpanded && shouldTruncate ? styles.textCollapsed : ''}`}>
                            {post.text}
                        </p>
                        {shouldTruncate && (
                            <button
                                className={styles.readMore}
                                onClick={() => setIsExpanded(!isExpanded)}
                            >
                                {isExpanded ? t('show_less') : t('show_more')}
                            </button>
                        )}
                    </>
                )}

                {post.attachedTrack && (
                    <div
                        className={styles.trackAttachment}
                        onClick={handlePlayTrack}
                    >
                        <img
                            src={post.attachedTrack.cover}
                            alt={post.attachedTrack.title}
                            className={styles.trackCover}
                        />
                        <div className={styles.trackInfo}>
                            <div className={styles.trackTitle}>
                                {post.attachedTrack.title}
                            </div>
                            <div className={styles.trackArtist}>
                                {post.attachedTrack.artist}
                            </div>
                        </div>
                        <button
                            className={styles.trackPlayButton}
                            onClick={handlePlayTrack}
                            aria-label={t('play')}
                        >
                            <Play size={20} />
                        </button>
                    </div>
                )}
            </div>

            <div className={styles.actions}>
                <button
                    className={`${styles.actionButton} ${post.isLiked ? styles.actionButtonLiked : ''}`}
                    onClick={handleLike}
                    aria-label={t('like')}
                    disabled={likeMutation.isPending}
                >
                    <Heart
                        size={20}
                        fill={post.isLiked ? 'currentColor' : 'none'}
                    />
                    {post.likesCount > 0 && (
                        <span className={styles.actionCount}>{post.likesCount}</span>
                    )}
                </button>

                <button
                    className={styles.actionButton}
                    onClick={handleCommentToggle}
                    aria-label={t('comment')}
                >
                    <MessageCircle size={20} />
                    {post.commentsCount > 0 && (
                        <span className={styles.actionCount}>{post.commentsCount}</span>
                    )}
                </button>

                <button
                    className={`${styles.actionButton} ${post.isReposted ? styles.actionButtonReposted : ''}`}
                    onClick={handleRepost}
                    aria-label={t('repost')}
                    disabled={repostMutation.isPending}
                >
                    <Repeat2 size={20} />
                    {post.repostsCount > 0 && (
                        <span className={styles.actionCount}>{post.repostsCount}</span>
                    )}
                </button>

                <button
                    className={`${styles.actionButton} ${shareFeedback ? styles.actionButtonShared : ''}`}
                    onClick={handleShare}
                    aria-label={t('share')}
                >
                    {shareFeedback ? <Check size={20} /> : <Send size={20} />}
                </button>
            </div>

            {showComments && (
                <div className={styles.commentsSection}>
                    <div className={styles.commentsHeader}>
                        <h4 className={styles.commentsTitle}>
                            {t('comments')} ({post.commentsCount || 0})
                        </h4>
                    </div>

                    <form
                        className={styles.commentForm}
                        onSubmit={handleSubmitComment}
                    >
                        <textarea
                            className={styles.commentInput}
                            placeholder={isLoggedIn ? t('add_comment') : t('login_to_comment')}
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            rows={1}
                            onInput={(e) => {
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                            readOnly={!isLoggedIn || commentMutation.isPending}
                            onClick={(e) => {
                                if (!isLoggedIn) {
                                    e.preventDefault();
                                    handleAuthAction(() => {});
                                }
                            }}
                        />
                        <button
                            type="submit"
                            className={styles.commentSubmitButton}
                            disabled={!commentText.trim() || !isLoggedIn || commentMutation.isPending}
                        >
                            {t('post')}
                        </button>
                    </form>

                    {postComments.length > 0 && (
                        <div className={styles.commentsList}>
                            {postComments.slice(0, 5).map(comment => (
                                <div key={comment.id} className={styles.comment}>
                                    <img
                                        src={comment.author.avatar}
                                        alt={comment.author.name}
                                        className={styles.commentAvatar}
                                    />
                                    <div className={styles.commentContent}>
                                        <div className={styles.commentAuthor}>
                                            {comment.author.name}
                                        </div>
                                        <p className={styles.commentText}>
                                            {comment.text}
                                        </p>
                                        <div className={styles.commentMeta}>
                                            <span className={styles.commentTimestamp}>
                                                {comment.timestamp}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {post.commentsCount > 5 && (
                                <button className={styles.showMoreComments}>
                                    {t('show_more_comments')}
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