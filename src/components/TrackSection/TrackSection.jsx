import './TrackSection.css';
import TrackCard from '../TrackCard/TrackCard.jsx';
import SectionHeader from '../SectionHeader/SectionHeader.jsx';
import {normalizeTrackData} from '../../constants/fallbacks.js';

export default function TrackSection({title, tracks, onMoreClick}) {
    const validTracks = tracks
        .map(track => normalizeTrackData(track))
        .filter(track => track !== null);

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