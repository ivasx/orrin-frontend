import TrackCard from "../TrackCard/TrackCard.jsx";

export default function TrackSection({ title, tracks, onMoreClick }) {
    return (
        <section className="track-row">
            <div className="track-row-header">
                <h3 className="track-row-title">{title}</h3>
                <button className="track-row-more" onClick={onMoreClick}>
                    Більше
                </button>
            </div>

            <div className="track-row-grid">
                {tracks.map((track, index) => (
                    <TrackCard key={index} {...track} />
                ))}
            </div>
        </section>
    );
}