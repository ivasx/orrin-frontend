import { useState, useRef, memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
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
import { useToast } from '../../../context/ToastContext.jsx';
import {
    toggleLikePost,
    repostPost,
    addComment,
    toggleSavePost,
    reportPost
} from '../../../services/api.js';
import { logger } from '../../../utils/logger.js';
import styles from './FeedPost.module.css';

function FeedPost({ post }) {
    const { t } = useTranslation();
    const { playTrack } = useAudioCore();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [isLiked, setIsLiked] = useState(post.isLiked || false);
    const [likesCount, setLikesCount] = useState(post.likesCount || 0);
    const [isReposted, setIsReposted] = useState(post.isReposted || false);
    const [repostsCount, setRepostsCount] = useState(post.repostsCount || 0);
    const [isSaved, setIsSaved] = useState(post.isSaved || false); // Added state
    const [comments, setComments] = useState(post.comments || []);
    const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [shareFeedback, setShareFeedback] = useState(false);

    const menuButtonRef = useRef(null);


    const likeMutation = useMutation({
        mutationFn: () => toggleLikePost(post.id),
        onError: (error) => {
            logger.error(`Failed to like post ${post.id}:`, error);
            setIsLiked(!isLiked);
            setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
            showToast(t('error_like'), 'error');
        }
    });

    const repostMutation = useMutation({
        mutationFn: () => repostPost(post.id),
        onError: (error) => {
            logger.error(`Failed to repost post ${post.id}:`, error);
            setIsReposted(!isReposted);
            setRepostsCount(prev => isReposted ? prev + 1 : prev - 1);
            showToast(t('error_repost'), 'error');
        }
    });

    const saveMutation = useMutation({
        mutationFn: () => toggleSavePost(post.id),
        onSuccess: () => {
            const msg = !isSaved
                ? t('post_saved_success')
                : t('post_unsaved_success');
            showToast(msg, 'success');
        },
        onError: (error) => {
            logger.error(`Failed to save post ${post.id}:`, error);
            setIsSaved(!isSaved);
            showToast(t('error_save'), 'error');
        }
    });

    const reportMutation = useMutation({
        mutationFn: () => reportPost(post.id, 'inappropriate'),
        onSuccess: () => {
            showToast(t('report_sent'), 'success');
        },
        onError: (error) => {
            logger.error(`Failed to report post ${post.id}:`, error);
            showToast(t('error_report'), 'error');
        }
    });

    const commentMutation = useMutation({
        mutationFn: (text) => addComment(post.id, text),
        onSuccess: () => {
            showToast(t('comment_added'), 'success');
        },
        onError: (error, variables, context) => {
            logger.error('Failed to add comment:', error);
            const tempId = context?.tempId;
            if (tempId) {
                setComments(prev => prev.filter(c => c.id !== tempId));
                setCommentsCount(prev => prev - 1);
            }
            showToast(t('error_comment'), 'error');
        },
        onMutate: async () => {
            const tempId = `temp-${Date.now()}`;
            return { tempId };
        }
    });

    const handleLike = () => {
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);
        likeMutation.mutate();
    };

    const handleRepost = () => {
        const newIsReposted = !isReposted;
        setIsReposted(newIsReposted);
        setRepostsCount(prev => newIsReposted ? prev + 1 : prev - 1);
        repostMutation.mutate();
    };

    const handleSavePost = () => {
        // Optimistic update
        setIsSaved(!isSaved);
        saveMutation.mutate();
        setShowMenu(false);
    };

    const handleReportPost = () => {
        if (window.confirm(t('confirm_report'))) {
            reportMutation.mutate();
        }
        setShowMenu(false);
    };

    const handleCommentToggle = () => {
        setShowComments(!showComments);
    };

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
        if (!commentText.trim()) return;

        const tempId = `temp-${Date.now()}`;
        const newComment = {
            id: tempId,
            author: {
                name: user?.name || t('you'),
                avatar: user?.avatar || '/default-avatar.png'
            },
            text: commentText,
            timestamp: t('just_now'),
        };

        setComments([newComment, ...comments]);
        setCommentsCount(prev => prev + 1);
        setCommentText('');

        commentMutation.mutate(newComment.text, { tempId });
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
            label: isSaved ? t('post_unsave') : t('post_save'),
            action: handleSavePost
        },
        { type: 'separator' },
        {
            id: 'report',
            label: t('post_report'),
            variant: 'danger',
            action: handleReportPost
        }
    ], [isSaved, t]);

    const shouldTruncate = post.text && post.text.length > 300;

    return (
        <article className={styles.feedPost}>
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
                                {isExpanded
                                    ? t('show_less')
                                    : t('show_more')
                                }
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
                    className={`${styles.actionButton} ${isLiked ? styles.actionButtonLiked : ''}`}
                    onClick={handleLike}
                    aria-label={t('like')}
                >
                    <Heart
                        size={20}
                        fill={isLiked ? 'currentColor' : 'none'}
                    />
                    {likesCount > 0 && (
                        <span className={styles.actionCount}>{likesCount}</span>
                    )}
                </button>

                <button
                    className={styles.actionButton}
                    onClick={handleCommentToggle}
                    aria-label={t('comment')}
                >
                    <MessageCircle size={20} />
                    {commentsCount > 0 && (
                        <span className={styles.actionCount}>{commentsCount}</span>
                    )}
                </button>

                <button
                    className={`${styles.actionButton} ${isReposted ? styles.actionButtonReposted : ''}`}
                    onClick={handleRepost}
                    aria-label={t('repost')}
                >
                    <Repeat2 size={20} />
                    {repostsCount > 0 && (
                        <span className={styles.actionCount}>{repostsCount}</span>
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
                            {t('comments')} ({commentsCount})
                        </h4>
                    </div>

                    <form
                        className={styles.commentForm}
                        onSubmit={handleSubmitComment}
                    >
                        <textarea
                            className={styles.commentInput}
                            placeholder={t('add_comment')}
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
                            className={styles.commentSubmitButton}
                            disabled={!commentText.trim()}
                        >
                            {t('post')}
                        </button>
                    </form>

                    {comments.length > 0 && (
                        <div className={styles.commentsList}>
                            {comments.slice(0, 5).map(comment => (
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
                            {commentsCount > 5 && (
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