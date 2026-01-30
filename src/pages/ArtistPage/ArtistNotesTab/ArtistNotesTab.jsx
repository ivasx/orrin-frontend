import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Music, Clock, Users, Lock, Globe } from 'lucide-react';
import NoteCard from '../../../components/Shared/NoteCard/NoteCard.jsx';
import styles from './ArtistNotesTab.module.css';

const NoteForm = ({
                      onSubmit,
                      onCancel,
                      popularTracks,
                      t
                  }) => {
    const [text, setText] = useState('');
    const [type, setType] = useState('private');
    const [trackId, setTrackId] = useState('');
    const [timecode, setTimecode] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSubmit({ text, type, trackId, timecode });
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
            />

            <div className={styles.formFooter}>
                <div className={styles.options}>
                    {/* Privacy Selector */}
                    <div className={styles.selectWrapper}>
                        <div className={styles.selectIcon}>
                            {type === 'private' ? <Lock size={16} /> : <Globe size={16} />}
                        </div>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className={styles.select}
                        >
                            <option value="private">{t('notes_private')}</option>
                            <option value="public">{t('notes_public')}</option>
                        </select>
                    </div>

                    {/* Track Selector */}
                    {popularTracks.length > 0 && (
                        <div className={styles.selectWrapper}>
                            <Music size={16} className={styles.selectIcon} />
                            <select
                                value={trackId}
                                onChange={(e) => setTrackId(e.target.value)}
                                className={styles.select}
                            >
                                <option value="">{t('notes_select_track')}</option>
                                {popularTracks.map(track => (
                                    <option key={track.trackId} value={track.trackId}>
                                        {track.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Timecode Input (shown only if track selected) */}
                    {trackId && (
                        <div className={styles.selectWrapper}>
                            <Clock size={16} className={styles.selectIcon} />
                            <input
                                type="text"
                                placeholder="0:00"
                                value={timecode}
                                onChange={(e) => setTimecode(e.target.value)}
                                className={styles.input}
                                style={{ width: '80px', paddingLeft: '36px' }}
                            />
                        </div>
                    )}
                </div>

                <div className={styles.actions}>
                    <button type="button" className={styles.cancelButton} onClick={onCancel}>
                        {t('cancel', 'Cancel')}
                    </button>
                    <button type="submit" className={styles.submitButton} disabled={!text.trim()}>
                        {t('notes_add_button', 'Add Note')}
                    </button>
                </div>
            </div>
        </form>
    );
};


export default function ArtistNotesTab({ initialNotes = [], popularTracks = [] }) {
    const { t } = useTranslation();
    const [notes, setNotes] = useState(initialNotes);
    const [isAddingNote, setIsAddingNote] = useState(false);

    const handleAddNote = (noteData) => {
        const selectedTrack = popularTracks.find(t => t.trackId === noteData.trackId);

        const newNote = {
            id: `note-new-${Date.now()}`,
            author: t('notes_you', 'You'),
            // TODO: Replace with real user avatar from AuthContext
            avatar: '/orrin-logo.svg',
            text: noteData.text,
            type: noteData.type,
            timestamp: t('notes_just_now'),
            relatedTrack: selectedTrack ? {
                id: selectedTrack.trackId,
                title: selectedTrack.title,
                timecode: noteData.timecode
            } : null
        };

        setNotes([newNote, ...notes]);
        setIsAddingNote(false);
    };

    const myNotes = useMemo(() => notes.filter(n => n.type === 'private' || n.author === t('notes_you', 'You')), [notes, t]);
    const publicNotes = useMemo(() => notes.filter(n => n.type === 'public' && n.author !== t('notes_you', 'You')), [notes, t]);

    return (
        <div className={styles.container}>
            {!isAddingNote ? (
                <button
                    className={styles.toggleButton}
                    onClick={() => setIsAddingNote(true)}
                >
                    + {t('notes_add_button')}
                </button>
            ) : (
                <NoteForm
                    onSubmit={handleAddNote}
                    onCancel={() => setIsAddingNote(false)}
                    popularTracks={popularTracks}
                    t={t}
                />
            )}

            <div className={styles.divider} />

            {myNotes.length > 0 && (
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                        <Lock size={18} /> {t('notes_my_notes')}
                    </h3>
                    <div className={styles.list}>
                        {myNotes.map(note => <NoteCard key={note.id} note={note} />)}
                    </div>
                </div>
            )}

            {publicNotes.length > 0 && (
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                        <Users size={18} /> {t('notes_public_notes')}
                    </h3>
                    <div className={styles.list}>
                        {publicNotes.map(note => <NoteCard key={note.id} note={note} />)}
                    </div>
                </div>
            )}

            {myNotes.length === 0 && publicNotes.length === 0 && !isAddingNote && (
                <p className={styles.emptyMessage}>
                    {t('notes_empty')}
                </p>
            )}
        </div>
    );
}