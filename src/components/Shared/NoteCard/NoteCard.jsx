import {useState, useCallback, useRef} from 'react';
import {Link} from 'react-router-dom';
import {PlayCircle, Heart, MoreHorizontal, Quote} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {useAuth} from '../../../context/AuthContext.jsx';
import ContextMenu from '../../UI/OptionsMenu/OptionsMenu.jsx';
import styles from './NoteCard.module.css';

export default function NoteCard({note, onLike, onEdit, onDelete, onReport}) {
    const {t} = useTranslation();
    const {user} = useAuth();
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({x: 0, y: 0});
    const dotsRef = useRef(null);

    const isOwn = user?.id != null && user.id === note.authorId;

    const handleDotsClick = useCallback((e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!dotsRef.current) return;
        const rect = dotsRef.current.getBoundingClientRect();
        setMenuPosition({x: rect.left, y: rect.bottom + 4});
        setMenuVisible((prev) => !prev);
    }, []);

    const handleMenuClose = useCallback(() => setMenuVisible(false), []);

    const menuItems = isOwn
        ? [
            {id: 'edit', label: t('menu_edit'), action: () => onEdit?.(note)},
            {id: 'delete', label: t('menu_delete'), action: () => onDelete?.(note.id), variant: 'danger'},
        ]
        : [
            {
                id: 'share', label: t('menu_share_to_chat'), action: () => {
                }
            },
            {id: 'report', label: t('menu_report'), action: () => onReport?.(note.id), variant: 'danger'},
        ];

    const handleLike = useCallback(() => onLike?.(note.id), [note.id, onLike]);

    return (
        <div className={`${styles.card} ${note.type === 'private' ? styles.cardPrivate : ''}`}>
            <Link to={`/user/${note.authorUsername}`} className={styles.avatarLink}>
                <img src={note.avatar} alt={note.author} className={styles.authorAvatar}/>
            </Link>

            <div className={styles.content}>
                <div className={styles.header}>
                    <Link to={`/user/${note.authorUsername}`} className={styles.authorLink}>
                        <span className={styles.authorName}>{note.author}</span>
                    </Link>
                    <div className={styles.headerActions}>
                        <span className={styles.timestamp}>{note.timestamp}</span>

                        <div className={styles.menuWrapper} onClick={(e) => e.stopPropagation()}>
                            <button
                                ref={dotsRef}
                                className={`${styles.dotsBtn} ${menuVisible ? styles.dotsBtnOpen : ''}`}
                                onClick={handleDotsClick}
                                aria-label={t('aria_note_options')}
                                aria-expanded={menuVisible}
                                aria-haspopup="menu"
                            >
                                <MoreHorizontal size={15}/>
                            </button>

                            <ContextMenu
                                isVisible={menuVisible}
                                position={menuPosition}
                                onClose={handleMenuClose}
                                menuItems={menuItems}
                            />
                        </div>
                    </div>
                </div>

                {note.lyricsLineReference && (
                    <div className={styles.lyricsQuote}>
                        <Quote size={12} className={styles.lyricsQuoteIcon}/>
                        <span className={styles.lyricsQuoteText}>{note.lyricsLineReference.text}</span>
                    </div>
                )}

                <p className={styles.text}>{note.text}</p>

                <div className={styles.footer}>
                    {note.trackContext && (
                        <Link to={`/track/${note.trackContext.trackId}`} className={styles.trackContext}>
                            <PlayCircle size={14}/>
                            <span className={styles.trackTitle}>{note.trackContext.title}</span>
                            {note.timecode && (
                                <span className={styles.trackTimecode}>{note.timecode}</span>
                            )}
                        </Link>
                    )}

                    <button
                        className={`${styles.likeBtn} ${note.isLikedByMe ? styles.likeBtnLiked : ''}`}
                        onClick={handleLike}
                        aria-label={t('aria_like_note')}
                        aria-pressed={note.isLikedByMe}
                    >
                        <Heart size={13}/>
                        {note.likesCount > 0 && (
                            <span className={styles.likeCount}>{note.likesCount}</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}