import {useState, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {Music, Clock, Users, Lock, Globe, Loader2} from 'lucide-react';
import NoteCard from '../../../../components/Shared/NoteCard/NoteCard.jsx';
import {getArtistNotes, createNote, deleteNote, toggleLikeNote} from '../../../../services/api/index.js';
import {useAuth} from '../../../../context/AuthContext.jsx';
import styles from './ArtistNotesTab.module.css';

function NoteForm({onSubmit, onCancel, popularTracks, t, isSubmitting}) {
    const [text, setText] = useState('');
    const [noteType, setNoteType] = useState('private');
    const [trackSlug, setTrackSlug] = useState('');
    const [timecode, setTimecode] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSubmit({
            text: text.trim(),
            note_type: noteType,
            track_slug: trackSlug || undefined,
            timecode: timecode || undefined,
        });
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <textarea
                className={styles.textarea}
                placeholder={t('notes_placeholder')}
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                autoFocus
                disabled={isSubmitting}
            />

            <div className={styles.formFooter}>
                <div className={styles.options}>
                    <div className={styles.selectWrapper}>
                        <div className={styles.selectIcon}>
                            {noteType === 'private' ? <Lock size={16}/> : <Globe size={16}/>}
                        </div>
                        <select
                            value={noteType}
                            onChange={(e) => setNoteType(e.target.value)}
                            className={styles.select}
                            disabled={isSubmitting}
                        >
                            <option value="private">{t('notes_private')}</option>
                            <option value="public">{t('notes_public')}</option>
                        </select>
                    </div>

                    {popularTracks.length > 0 && (
                        <div className={styles.selectWrapper}>
                            <Music size={16} className={styles.selectIcon}/>
                            <select
                                value={trackSlug}
                                onChange={(e) => setTrackSlug(e.target.value)}
                                className={styles.select}
                                disabled={isSubmitting}
                            >
                                <option value="">{t('notes_select_track')}</option>
                                {popularTracks.map((track) => (
                                    <option
                                        key={track.slug || track.trackId}
                                        value={track.slug || track.trackId}
                                    >
                                        {track.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {trackSlug && (
                        <div className={styles.selectWrapper}>
                            <Clock size={16} className={styles.selectIcon}/>
                            <input
                                type="text"
                                placeholder="0:00"
                                value={timecode}
                                onChange={(e) => setTimecode(e.target.value)}
                                className={styles.input}
                                style={{width: '80px', paddingLeft: '36px'}}
                                disabled={isSubmitting}
                            />
                        </div>
                    )}
                </div>

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        {t('cancel', 'Cancel')}
                    </button>
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={!text.trim() || isSubmitting}
                    >
                        {isSubmitting
                            ? <Loader2 size={14} className={styles.spinIcon}/>
                            : t('notes_add_button', 'Add Note')
                        }
                    </button>
                </div>
            </div>
        </form>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * @param {string} artistSlug
 * @param {Array}  popularTracks - already normalised by normalizeTrackData
 */
export default function ArtistNotesTab({artistSlug, popularTracks = []}) {
    const {t} = useTranslation();
    const {user, isLoggedIn} = useAuth();
    const queryClient = useQueryClient();
    const [isAddingNote, setIsAddingNote] = useState(false);

    const queryKey = ['artistNotes', artistSlug];

    const {data: notes = [], isLoading} = useQuery({
        queryKey,
        queryFn: () => getArtistNotes(artistSlug),
        enabled: !!artistSlug,
    });

    // ── mutations ─────────────────────────────────────────────────────────────

    const createMutation = useMutation({
        mutationFn: (noteData) => createNote({...noteData, artist_slug: artistSlug}),
        onSuccess: (newNote) => {
            queryClient.setQueryData(queryKey, (old = []) => [newNote, ...old]);
            setIsAddingNote(false);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteNote,
        onSuccess: (_, deletedId) => {
            queryClient.setQueryData(queryKey, (old = []) =>
                old.filter((n) => n.id !== deletedId),
            );
        },
    });

    const likeMutation = useMutation({
        mutationFn: toggleLikeNote,
        onMutate: async (noteId) => {
            await queryClient.cancelQueries({queryKey});
            const previous = queryClient.getQueryData(queryKey);
            queryClient.setQueryData(queryKey, (old = []) =>
                old.map((n) =>
                    n.id === noteId
                        ? {
                            ...n,
                            isLikedByMe: !n.isLikedByMe,
                            likesCount: n.isLikedByMe
                                ? Math.max(0, n.likesCount - 1)
                                : n.likesCount + 1,
                        }
                        : n,
                ),
            );
            return {previous};
        },
        onError: (_err, _noteId, context) => {
            if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
        },
    });

    // ── derived data ──────────────────────────────────────────────────────────

    const currentUserId = user?.id ?? user?.pk;

    const myNotes = useMemo(
        () => notes.filter((n) => String(n.author?.id) === String(currentUserId)),
        [notes, currentUserId],
    );

    const publicNotes = useMemo(
        () => notes.filter(
            (n) => n.type === 'public' && String(n.author?.id) !== String(currentUserId),
        ),
        [notes, currentUserId],
    );

    // ── render ────────────────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingRow}>
                    <Loader2 size={20} className={styles.spinIcon}/>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {isLoggedIn && !isAddingNote && (
                <button className={styles.toggleButton} onClick={() => setIsAddingNote(true)}>
                    + {t('notes_add_button')}
                </button>
            )}

            {isAddingNote && (
                <NoteForm
                    onSubmit={(data) => createMutation.mutate(data)}
                    onCancel={() => setIsAddingNote(false)}
                    popularTracks={popularTracks}
                    t={t}
                    isSubmitting={createMutation.isPending}
                />
            )}

            <div className={styles.divider}/>

            {myNotes.length > 0 && (
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                        <Lock size={18}/> {t('notes_my_notes')}
                    </h3>
                    <div className={styles.list}>
                        {myNotes.map((note) => (
                            <NoteCard
                                key={note.id}
                                note={note}
                                onDelete={() => deleteMutation.mutate(note.id)}
                                onLike={() => likeMutation.mutate(note.id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {publicNotes.length > 0 && (
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                        <Users size={18}/> {t('notes_public_notes')}
                    </h3>
                    <div className={styles.list}>
                        {publicNotes.map((note) => (
                            <NoteCard
                                key={note.id}
                                note={note}
                                onLike={isLoggedIn ? () => likeMutation.mutate(note.id) : undefined}
                            />
                        ))}
                    </div>
                </div>
            )}

            {myNotes.length === 0 && publicNotes.length === 0 && !isAddingNote && (
                <p className={styles.emptyMessage}>{t('notes_empty')}</p>
            )}
        </div>
    );
}
