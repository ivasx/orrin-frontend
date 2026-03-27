import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { PenLine, Link2, X, StickyNote } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext.jsx';
import NoteCard from '../../../../components/Shared/NoteCard/NoteCard.jsx';
import styles from './NotesTab.module.css';

/**
 * @typedef {Object} Note
 * @property {string}      id
 * @property {string}      authorId
 * @property {string}      authorUsername
 * @property {string}      author
 * @property {string}      avatar
 * @property {string}      text
 * @property {'public'|'private'} type
 * @property {string}      timestamp
 * @property {Object|null} trackContext
 * @property {string|null} timecode
 * @property {number}      likesCount
 * @property {boolean}     isLikedByMe
 * @property {Object|null} lyricsLineReference
 */

const NOTE_TAB_CONFIG = [
    { id: 'recommended', translationKey: 'notes_recommended' },
    { id: 'friends',     translationKey: 'notes_friends' },
    { id: 'own',         translationKey: 'notes_own' },
];

/**
 * Notes tab: sub-navigation, input form with optional lyrics-line attachment,
 * and a responsive grid of NoteCard components.
 *
 * @param {Object}               props
 * @param {Record<string,Note[]>} props.initialNotes   - Keyed by tab id
 */
export default function NotesTab({ initialNotes = {} }) {
    const { t } = useTranslation();
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState('recommended');
    const [notesByTab, setNotesByTab] = useState(initialNotes);
    const [draft, setDraft]           = useState('');
    const [editTarget, setEditTarget] = useState(/** @type {Note|null} */ null);

    /**
     * @type {[{text:string}|null, Function]}
     * Holds the lyrics line the user wants to attach to the new note.
     */
    const [attachedLine, setAttachedLine] = useState(null);
    const [showLineInput, setShowLineInput] = useState(false);
    const [lineInputDraft, setLineInputDraft] = useState('');

    const textareaRef = useRef(null);

    /** Update a note list for a specific tab, returning the new state. */
    const updateTab = useCallback((tabId, updater) => {
        setNotesByTab(prev => ({ ...prev, [tabId]: updater(prev[tabId] ?? []) }));
    }, []);

    const handleLike = useCallback((id) => {
        Object.keys(notesByTab).forEach(tabId => {
            updateTab(tabId, notes => notes.map(n => {
                if (n.id !== id) return n;
                const liked = !n.isLikedByMe;
                return { ...n, isLikedByMe: liked, likesCount: n.likesCount + (liked ? 1 : -1) };
            }));
        });
    }, [notesByTab, updateTab]);

    const handleEdit = useCallback((note) => {
        setEditTarget(note);
        setDraft(note.text);
        if (note.lyricsLineReference) {
            setAttachedLine(note.lyricsLineReference);
        }
        textareaRef.current?.focus();
    }, []);

    const handleDelete = useCallback((id) => {
        Object.keys(notesByTab).forEach(tabId => {
            updateTab(tabId, notes => notes.filter(n => n.id !== id));
        });
    }, [notesByTab, updateTab]);

    const handleReport = useCallback((_id) => {}, []);

    const confirmAttachLine = useCallback(() => {
        const trimmed = lineInputDraft.trim();
        if (!trimmed) return;
        setAttachedLine({ text: trimmed, time: null });
        setShowLineInput(false);
        setLineInputDraft('');
    }, [lineInputDraft]);

    const cancelAttachLine = useCallback(() => {
        setShowLineInput(false);
        setLineInputDraft('');
    }, []);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        const trimmed = draft.trim();
        if (!trimmed) return;

        if (editTarget) {
            const updated = { ...editTarget, text: trimmed, lyricsLineReference: attachedLine ?? null };
            Object.keys(notesByTab).forEach(tabId => {
                updateTab(tabId, notes =>
                    notes.map(n => n.id === editTarget.id ? updated : n)
                );
            });
            setEditTarget(null);
        } else {
            /** @type {Note} */
            const newNote = {
                id:                  `note-${Date.now()}`,
                authorId:            user?.id ?? 'user-4',
                authorUsername:      user?.username ?? 'orrin_demo',
                author:              user?.name ?? t('you'),
                avatar:              user?.avatar ?? 'https://i.pravatar.cc/150?img=32',
                text:                trimmed,
                type:                'public',
                timestamp:           t('just_now'),
                trackContext:        null,
                timecode:            null,
                likesCount:          0,
                isLikedByMe:         false,
                lyricsLineReference: attachedLine ?? null,
            };
            updateTab(activeTab, notes => [newNote, ...notes]);
        }

        setDraft('');
        setAttachedLine(null);
    }, [draft, editTarget, attachedLine, user, t, activeTab, notesByTab, updateTab]);

    const cancelEdit = useCallback(() => {
        setEditTarget(null);
        setDraft('');
        setAttachedLine(null);
    }, []);

    const activeNotes = notesByTab[activeTab] ?? [];

    return (
        <div className={styles.root}>
            <nav className={styles.subNav} aria-label={t('aria_notes_subnav')}>
                {NOTE_TAB_CONFIG.map(tab => (
                    <button
                        key={tab.id}
                        className={`${styles.subNavBtn} ${activeTab === tab.id ? styles.subNavBtnActive : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                        aria-selected={activeTab === tab.id}
                        role="tab"
                        type="button"
                    >
                        {t(tab.translationKey)}
                    </button>
                ))}
            </nav>

            {activeTab === 'own' && (
                <form className={styles.form} onSubmit={handleSubmit} noValidate>
                    {editTarget && (
                        <div className={styles.editBanner}>
                            <span>{t('editing_note')}</span>
                            <button type="button" className={styles.cancelEdit} onClick={cancelEdit}>
                                {t('cancel')}
                            </button>
                        </div>
                    )}

                    {attachedLine && (
                        <div className={styles.attachedLine}>
                            <span className={styles.attachedLineText}>
                                &ldquo;{attachedLine.text}&rdquo;
                            </span>
                            <button
                                type="button"
                                className={styles.removeAttachment}
                                onClick={() => setAttachedLine(null)}
                                aria-label={t('remove_attachment')}
                            >
                                <X size={12} />
                            </button>
                        </div>
                    )}

                    {showLineInput && (
                        <div className={styles.lineInputRow}>
                            <input
                                className={styles.lineInput}
                                value={lineInputDraft}
                                onChange={e => setLineInputDraft(e.target.value)}
                                placeholder={t('paste_lyrics_line')}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') { e.preventDefault(); confirmAttachLine(); }
                                    if (e.key === 'Escape') cancelAttachLine();
                                }}
                                autoFocus
                            />
                            <button type="button" className={styles.confirmLine} onClick={confirmAttachLine}>
                                {t('attach')}
                            </button>
                            <button type="button" className={styles.cancelLine} onClick={cancelAttachLine}>
                                <X size={14} />
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
                            placeholder={t('notes_placeholder')}
                            rows={1}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                        />
                        <div className={styles.formActions}>
                            {!attachedLine && (
                                <button
                                    type="button"
                                    className={styles.attachBtn}
                                    onClick={() => setShowLineInput(true)}
                                    title={t('attach_to_line')}
                                    aria-label={t('attach_to_line')}
                                >
                                    <Link2 size={15} />
                                </button>
                            )}
                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={!draft.trim()}
                                aria-label={t('submit_note')}
                            >
                                <PenLine size={15} />
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {activeNotes.length === 0 ? (
                <div className={styles.empty}>
                    <StickyNote size={36} className={styles.emptyIcon} />
                    <p className={styles.emptyTitle}>{t('no_notes_yet')}</p>
                    <p className={styles.emptySubtitle}>{t(`notes_empty_${activeTab}`)}</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {activeNotes.map(note => (
                        <NoteCard
                            key={note.id}
                            note={note}
                            onLike={handleLike}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onReport={handleReport}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}