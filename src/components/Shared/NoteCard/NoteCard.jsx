import {Link} from 'react-router-dom';
import {PlayCircle} from 'lucide-react';
import './NoteCard.css';

export default function NoteCard({note}) {
    return (
        <div className={`note-card ${note.type === 'private' ? 'private-note' : ''}`}>
            <img src={note.avatar} alt={note.author} className="note-author-avatar"/>
            <div className="note-content">
                <div className="note-header">
                    <span className="note-author-name">{note.author}</span>
                    <span className="note-timestamp">{note.timestamp}</span>
                </div>
                <p className="note-text">{note.text}</p>
                {note.trackContext && (
                    <Link to={`/track/${note.trackContext.trackId}`} className="note-track-context">
                        <PlayCircle size={16}/>
                        <span className="note-track-title">{note.trackContext.title}</span>
                        {note.timecode && (
                            <span className="note-track-timecode">{note.timecode}</span>
                        )}
                    </Link>
                )}
            </div>
        </div>
    );
}