import './TrackSection.css';
import TrackCard from '../TrackCard/TrackCard.jsx';
import SectionHeader from '../SectionHeader/SectionHeader.jsx';

export default function TrackSection({title, tracks, onMoreClick}) {
    const validTracks = Array.isArray(tracks) ? tracks : [];

    return (
        <section className="track-section">
            <SectionHeader title={title} onMoreClick={onMoreClick}/>
            <div className="track-section-grid">
                {validTracks.map((track) => (
                    <TrackCard
                        key={track.trackId}
                        {...track}
                        tracks={validTracks}
                    />
                ))}
            </div>
        </section>
    );
}