import { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, MoreHorizontal, Send, MessageSquare } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext.jsx';
import ContextMenu from '../../../../components/UI/OptionsMenu/OptionsMenu.jsx';
import styles from './CommentsTab.module.css';

/**
 * @typedef {Object} Comment
 * @property {string}  id
 * @property {string}  authorId
 * @property {string}  authorUsername
 * @property {string}  author
 * @property {string}  avatar
 * @property {string}  text
 * @property {string}  timestamp
 * @property {number}  likesCount
 * @property {boolean} isLikedByMe
 */

function CommentItem({ comment, currentUserId, onLike, onEdit, onDelete, onReport }) {
    const { t } = useTranslation();
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const dotsRef = useRef(null);

    const isOwn = currentUserId === comment.authorId;

    const handleDotsClick = useCallback((e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!dotsRef.current) return;
        const rect = dotsRef.current.getBoundingClientRect();
        /*
         * KEY FIX: use rect.left (not rect.right) as the x-anchor.
         * OptionsMenu's useLayoutEffect clamps the menu to the viewport, so
         * starting from the left edge of the button keeps it close to the
         * trigger instead of launching it to the far-right of the screen.
         */
        setMenuPosition({ x: rect.left, y: rect.bottom + 4 });
        setMenuVisible(prev => !prev);
    }, []);

    const handleMenuClose = useCallback(() => setMenuVisible(false), []);

    const menuItems = isOwn
        ? [
            { id: 'edit',   label: t('menu_edit'),   action: () => onEdit(comment) },
            { id: 'delete', label: t('menu_delete'),  action: () => onDelete(comment.id), variant: 'danger' },
        ]
        : [
            { id: 'share',  label: t('menu_share_to_chat'), action: () => {} },
            { id: 'report', label: t('menu_report'),        action: () => onReport(comment.id), variant: 'danger' },
        ];

    return (
        <div className={styles.item}>
            <Link to={`/user/${comment.authorUsername}`} className={styles.avatarLink}>
                <img src={comment.avatar} alt={comment.author} className={styles.avatar} />
            </Link>

            <div className={styles.body}>
                <div className={styles.header}>
                    <Link to={`/user/${comment.authorUsername}`} className={styles.authorLink}>
                        {comment.author}
                    </Link>
                    <span className={styles.timestamp}>{comment.timestamp}</span>

                    {/* stopPropagation wrapper so clicking the menu
                        doesn't bubble up to any parent handlers */}
                    <div
                        className={styles.menuWrapper}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            ref={dotsRef}
                            className={styles.dotsBtn}
                            onClick={handleDotsClick}
                            aria-label={t('aria_comment_options')}
                            aria-expanded={menuVisible}
                            aria-haspopup="menu"
                        >
                            <MoreHorizontal size={16} />
                        </button>

                        <ContextMenu
                            isVisible={menuVisible}
                            position={menuPosition}
                            onClose={handleMenuClose}
                            menuItems={menuItems}
                        />
                    </div>
                </div>

                <p className={styles.text}>{comment.text}</p>

                <div className={styles.actions}>
                    <button
                        className={`${styles.likeBtn} ${comment.isLikedByMe ? styles.liked : ''}`}
                        onClick={() => onLike(comment.id)}
                        aria-label={t('aria_like_comment')}
                        aria-pressed={comment.isLikedByMe}
                    >
                        <Heart size={14} />
                        <span className={styles.likeCount}>{comment.likesCount}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function CommentsTab({ initialComments = [] }) {
    const { t } = useTranslation();
    const { user } = useAuth();

    const [comments, setComments] = useState(initialComments);
    const [draft, setDraft]       = useState('');
    const [editTarget, setEditTarget] = useState(null);
    const textareaRef = useRef(null);

    const handleLike = useCallback((id) => {
        setComments(prev => prev.map(c => {
            if (c.id !== id) return c;
            const liked = !c.isLikedByMe;
            return { ...c, isLikedByMe: liked, likesCount: c.likesCount + (liked ? 1 : -1) };
        }));
    }, []);

    const handleEdit = useCallback((comment) => {
        setEditTarget(comment);
        setDraft(comment.text);
        textareaRef.current?.focus();
    }, []);

    const handleDelete = useCallback((id) => {
        setComments(prev => prev.filter(c => c.id !== id));
    }, []);

    const handleReport = useCallback((_id) => {}, []);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        const trimmed = draft.trim();
        if (!trimmed) return;

        if (editTarget) {
            setComments(prev => prev.map(c =>
                c.id === editTarget.id ? { ...c, text: trimmed } : c
            ));
            setEditTarget(null);
        } else {
            const newComment = {
                id:             `c-${Date.now()}`,
                authorId:       user?.id ?? 'user-4',
                authorUsername: user?.username ?? 'orrin_demo',
                author:         user?.name ?? t('you'),
                avatar:         user?.avatar ?? 'https://i.pravatar.cc/150?img=32',
                text:           trimmed,
                timestamp:      t('just_now'),
                type:           'public',
                likesCount:     0,
                isLikedByMe:    false,
            };
            setComments(prev => [newComment, ...prev]);
        }

        setDraft('');
    }, [draft, editTarget, user, t]);

    const cancelEdit = useCallback(() => {
        setEditTarget(null);
        setDraft('');
    }, []);

    const currentUserId = user?.id ?? 'user-4';

    return (
        <div className={styles.root}>
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
                {editTarget && (
                    <div className={styles.editBanner}>
                        <span>{t('editing_comment')}</span>
                        <button type="button" className={styles.cancelEdit} onClick={cancelEdit}>
                            {t('cancel')}
                        </button>
                    </div>
                )}
                <div className={styles.inputRow}>
                    <img
                        src={user?.avatar ?? 'https://i.pravatar.cc/150?img=32'}
                        alt={user?.name ?? t('you')}
                        className={styles.selfAvatar}
                    />
                    <textarea
                        ref={textareaRef}
                        className={styles.textarea}
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        placeholder={t('comments_placeholder')}
                        rows={1}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={!draft.trim()}
                        aria-label={t('submit_comment')}
                    >
                        <Send size={16} />
                    </button>
                </div>
            </form>

            {comments.length === 0 ? (
                <div className={styles.empty}>
                    <MessageSquare size={36} className={styles.emptyIcon} />
                    <p className={styles.emptyTitle}>{t('no_comments_yet')}</p>
                    <p className={styles.emptySubtitle}>{t('be_first_to_comment')}</p>
                </div>
            ) : (
                <ol className={styles.list} aria-label={t('aria_comments_list')}>
                    {comments.map(comment => (
                        <li key={comment.id}>
                            <CommentItem
                                comment={comment}
                                currentUserId={currentUserId}
                                onLike={handleLike}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onReport={handleReport}
                            />
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
}