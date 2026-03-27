import { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, Heart, MoreHorizontal, Quote } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext.jsx';
import ContextMenu from '../../UI/OptionsMenu/OptionsMenu.jsx';
import './NoteCard.css';

/**
 * @typedef {Object} Note
 * @property {string}       id
 * @property {string}       authorId
 * @property {string}       authorUsername
 * @property {string}       author
 * @property {string}       avatar
 * @property {string}       text
 * @property {'public'|'private'} type
 * @property {string}       timestamp
 * @property {Object|null}  trackContext
 * @property {string|null}  timecode
 * @property {number}       likesCount
 * @property {boolean}      isLikedByMe
 * @property {Object|null}  lyricsLineReference
 * @property {string}       lyricsLineReference.text
 * @property {number|null}  lyricsLineReference.time
 */

/**
 * @param {Object}   props
 * @param {Note}     props.note
 * @param {Function} [props.onLike]   - (id: string) => void
 * @param {Function} [props.onEdit]   - (note: Note) => void
 * @param {Function} [props.onDelete] - (id: string) => void
 * @param {Function} [props.onReport] - (id: string) => void
 */
export default function NoteCard({ note, onLike, onEdit, onDelete, onReport }) {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const dotsRef = useRef(null);

    const currentUserId = user?.id ?? 'user-4';
    const isOwn = currentUserId === note.authorId;

    const handleDotsClick = useCallback((e) => {
        e.stopPropagation();
        if (!dotsRef.current) return;
        const rect = dotsRef.current.getBoundingClientRect();
        setMenuPosition({ x: rect.right, y: rect.bottom + 4 });
        setMenuVisible(prev => !prev);
    }, []);

    const menuItems = isOwn
        ? [
            { id: 'edit',   label: t('menu_edit'),   action: () => onEdit?.(note) },
            { id: 'delete', label: t('menu_delete'),  action: () => onDelete?.(note.id), isDanger: true },
        ]
        : [
            { id: 'share',  label: t('menu_share_to_chat'), action: () => {} },
            { id: 'report', label: t('menu_report'),        action: () => onReport?.(note.id), isDanger: true },
        ];

    const handleLike = useCallback(() => onLike?.(note.id), [note.id, onLike]);

    return (
        <div className={`note-card ${note.type === 'private' ? 'private-note' : ''}`}>
            <Link to={`/user/${note.authorUsername}`} className="note-avatar-link">
                <img src={note.avatar} alt={note.author} className="note-author-avatar" />
            </Link>

            <div className="note-content">
                <div className="note-header">
                    <Link to={`/user/${note.authorUsername}`} className="note-author-name note-author-link">
                        {note.author}
                    </Link>
                    <div className="note-header-actions">
                        <span className="note-timestamp">{note.timestamp}</span>
                        <button
                            ref={dotsRef}
                            className="note-dots-btn"
                            onClick={handleDotsClick}
                            aria-label={t('aria_note_options')}
                        >
                            <MoreHorizontal size={15} />
                        </button>
                    </div>
                </div>

                {note.lyricsLineReference && (
                    <div className="note-lyrics-quote">
                        <Quote size={12} className="note-lyrics-quote-icon" />
                        <span className="note-lyrics-quote-text">{note.lyricsLineReference.text}</span>
                    </div>
                )}

                <p className="note-text">{note.text}</p>

                <div className="note-footer">
                    {note.trackContext && (
                        <Link to={`/track/${note.trackContext.trackId}`} className="note-track-context">
                            <PlayCircle size={14} />
                            <span className="note-track-title">{note.trackContext.title}</span>
                            {note.timecode && (
                                <span className="note-track-timecode">{note.timecode}</span>
                            )}
                        </Link>
                    )}

                    <button
                        className={`note-like-btn ${note.isLikedByMe ? 'liked' : ''}`}
                        onClick={handleLike}
                        aria-label={t('aria_like_note')}
                        aria-pressed={note.isLikedByMe}
                    >
                        <Heart size={13} />
                        {note.likesCount > 0 && (
                            <span className="note-like-count">{note.likesCount}</span>
                        )}
                    </button>
                </div>
            </div>

            <ContextMenu
                isVisible={menuVisible}
                position={menuPosition}
                onClose={() => setMenuVisible(false)}
                menuItems={menuItems}
            />
        </div>
    );
}