// src/components/ArtistNotesTab/ArtistNotesTab.jsx
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
// Link видалено, оскільки він не використовувався тут
import { Music, Clock, Users, Globe, Lock } from 'lucide-react';
import NoteCard from '../../components/NoteCard/NoteCard.jsx';
import './ArtistNotesTab.css';

export default function ArtistNotesTab({ initialNotes = [], popularTracks = [] }) {
    const { t } = useTranslation();
    const [notes, setNotes] = useState(initialNotes);
    const [newNoteText, setNewNoteText] = useState('');
    const [noteType, setNoteType] = useState('private');
    const [selectedTrackId, setSelectedTrackId] = useState('');
    const [timecode, setTimecode] = useState('');
    const [isAddingNote, setIsAddingNote] = useState(false);

    const handleAddNote = (e) => {
        e.preventDefault();
        if (newNoteText.trim() === '') return;

        const selectedTrack = popularTracks.find(track => track.trackId === selectedTrackId);

        const newNote = {
            id: `note-new-${Date.now()}`,
            author: t('notes_you', 'Ви (Me)'),
            // TODO: Замінити на реальний аватар користувача з системи аутентифікації
            avatar: '/path/to/default/user/avatar.png', // Замінено жорстко закодований URL
            text: newNoteText,
            type: noteType,
            timestamp: t('notes_just_now', 'щойно'),
            trackContext: selectedTrack ? { trackId: selectedTrack.trackId, title: selectedTrack.title } : undefined,
            timecode: selectedTrack && timecode.trim() ? timecode.trim() : undefined
        };

        setNotes([newNote, ...notes]);
        setNewNoteText('');
        setNoteType('private');
        setSelectedTrackId('');
        setTimecode('');
        setIsAddingNote(false);
    };

    const handleCancelAddNote = () => {
        setNewNoteText('');
        setNoteType('private');
        setSelectedTrackId('');
        setTimecode('');
        setIsAddingNote(false);
    };

    // Іконки для типів нотаток
    const noteTypeIcons = {
        private: <Lock size={16} />,
        friends: <Users size={16} />,
        public: <Globe size={16} />
    };

    const { myNotes, publicNotes } = useMemo(() => {
        return notes.reduce((acc, note) => {
            // Перевіряємо, чи автор "Ви (Me)" або тип "private"
            if (note.type === 'private' || note.author === t('notes_you', 'Ви (Me)')) {
                acc.myNotes.push(note);
            } else {
                acc.publicNotes.push(note);
            }
            return acc;
        }, { myNotes: [], publicNotes: [] });
    }, [notes, t]); // Додано t до залежностей useMemo

    return (
        <div className="artist-notes-tab">
            {/* --- Блок додавання нотатки --- */}
            <div className="add-note-section">
                {!isAddingNote ? (
                    <button
                        className="btn-outline-light show-add-note-form-button"
                        onClick={() => setIsAddingNote(true)}
                    >
                        {t('notes_add_yours', 'Додати свою нотатку')}
                    </button>
                ) : (
                    <form className="add-note-form modern" onSubmit={handleAddNote}>
                        <textarea
                            className="note-textarea-modern"
                            value={newNoteText}
                            onChange={(e) => setNewNoteText(e.target.value)}
                            placeholder={t('notes_placeholder', 'Що ви думаєте про цього артиста?')}
                            rows="3"
                            required
                            autoFocus
                        />
                        <div className="note-options-row">
                            <div className="note-options-controls">
                                {/* Вибір типу (з іконкою) */}
                                <div className="form-group-inline">
                                    <label htmlFor="note-type-select" className="visually-hidden">
                                        {t('notes_type_label', 'Тип нотатки:')}
                                    </label>
                                    <div className="select-with-icon">
                                        {noteTypeIcons[noteType]}
                                        <select
                                            id="note-type-select"
                                            className="form-select-modern"
                                            value={noteType}
                                            onChange={(e) => setNoteType(e.target.value)}
                                        >
                                            <option value="private">{t('notes_type_private', 'Приватна')}</option>
                                            <option value="friends">{t('notes_type_friends', 'Для друзів')}</option>
                                            <option value="public">{t('notes_type_public', 'Публічна')}</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Вибір треку (з іконкою) */}
                                <div className="form-group-inline">
                                    <label htmlFor="note-track-select" className="visually-hidden">
                                        {t('notes_track_label', 'Прив\'язати до треку (необов\'язково):')}
                                    </label>
                                    <div className="select-with-icon">
                                        <Music size={16} />
                                        <select
                                            id="note-track-select"
                                            className="form-select-modern"
                                            value={selectedTrackId}
                                            onChange={(e) => setSelectedTrackId(e.target.value)}
                                        >
                                            <option value="">{t('notes_track_select_placeholder', '-- Виберіть трек --')}</option>
                                            {Array.isArray(popularTracks) && popularTracks.map(track => (
                                                <option key={track.trackId} value={track.trackId}>{track.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Тайм-код (з іконкою, якщо трек вибрано) */}
                                {selectedTrackId && (
                                    <div className="form-group-inline timecode-group-inline">
                                        <label htmlFor="note-timecode" className="visually-hidden">
                                            {t('notes_timecode_label', 'Тайм-код (напр., 1:23):')}
                                        </label>
                                        <div className="input-with-icon">
                                            <Clock size={16} />
                                            <input
                                                type="text"
                                                id="note-timecode"
                                                className="form-input-modern timecode-input-modern"
                                                value={timecode}
                                                onChange={(e) => setTimecode(e.target.value)}
                                                placeholder="mm:ss"
                                                pattern="\d{1,2}:\d{2}"
                                                title={t('notes_timecode_format_hint', 'Введіть час у форматі хвилини:секунди')}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* --- Кнопки форми --- */}
                            <div className="add-note-form-actions-modern">
                                <button type="button" className="btn-secondary-modern" onClick={handleCancelAddNote}>
                                    {t('cancel', 'Скасувати')}
                                </button>
                                <button type="submit" className="btn-primary-modern" disabled={!newNoteText.trim()}>
                                    {t('notes_add_button', 'Додати нотатку')}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>

            {/* --- Списки нотаток --- */}
            <div className="notes-divider" />
            {myNotes.length > 0 && (
                <div className="notes-list-section">
                    <h3 className="notes-section-title">{t('notes_my_notes', 'Мої нотатки')}</h3>
                    <div className="notes-list">
                        {myNotes.map(note => <NoteCard key={note.id} note={note} />)}
                    </div>
                </div>
            )}
            {publicNotes.length > 0 && (
                <div className="notes-list-section">
                    <h3 className="notes-section-title">{t('notes_public_notes', 'Публічні нотатки')}</h3>
                    <div className="notes-list">
                        {publicNotes.map(note => <NoteCard key={note.id} note={note} />)}
                    </div>
                </div>
            )}
            {myNotes.length === 0 && publicNotes.length === 0 && !isAddingNote && ( // Додано !isAddingNote, щоб не показувати, коли форма відкрита
                <p className="no-notes-message">{t('notes_empty', 'Поки що немає жодної нотатки.')}</p>
            )}
        </div>
    );
}
