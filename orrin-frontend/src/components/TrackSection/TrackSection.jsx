// src/components/TrackSection/TrackSection.jsx
import './TrackSection.css';
import TrackCard from '../TrackCard/TrackCard.jsx';
import SectionHeader from '../SectionHeader/SectionHeader.jsx';

export default function TrackSection({ title, tracks, onMoreClick }) {
    return (
        <section className="track-section">
            <SectionHeader title={title} onMoreClick={onMoreClick} />
            <div className="track-section-grid">
                {tracks.map((track) => (
                    <TrackCard
                        key={track.trackId}
                        {...track}
                        tracks={tracks}
                    />
                ))}
            </div>
        </section>
    );
}