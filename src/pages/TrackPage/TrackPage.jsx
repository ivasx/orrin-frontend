import { useParams } from 'react-router-dom';
import { ways } from '../../data';
import './TrackPage.css';

export default function TrackPage() {
    const { trackId } = useParams();
    const track = ways.find((t) => t.trackId === trackId);

    if (!track) {
        return <div>Track not found</div>;
    }

    return (
        <div className="track-page">
            <div className="track-page-header">
                <img src={track.cover} alt={track.title} className="track-page-cover" />
                <div className="track-page-info">
                    <h1>{track.title}</h1>
                    <p>{track.artist}</p>
                    <span>{track.duration}</span>
                </div>
            </div>
            {/* Add more track details here */}
        </div>
    );
}