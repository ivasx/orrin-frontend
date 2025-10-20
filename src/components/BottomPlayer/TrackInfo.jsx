import { Link } from 'react-router-dom';
import { useMarquee } from '../../hooks/useMarquee';

export default function TrackInfo({ track }) {
    const { isScrolling: isTitleScrolling, containerRef: titleContainerRef, contentRef: titleContentRef } = useMarquee(track.trackId);
    const { isScrolling: isArtistScrolling, containerRef: artistContainerRef, contentRef: artistContentRef } = useMarquee(track.trackId);

    return (
        <div className="player-left">
            <Link to={`/track/${track.trackId}`}>
                <img src={track.cover} alt={track.title} className="player-cover"/>
            </Link>
            <div className="player-info">
                <div ref={titleContainerRef} className={`player-title ${isTitleScrolling ? 'scrolling' : ''}`}>
                    <Link to={`/track/${track.trackId}`}>
                        <div className="marquee__content" ref={titleContentRef}>
                            <span>{track.title}</span>
                            <span aria-hidden="true">{track.title}</span>
                        </div>
                    </Link>
                </div>
                <div ref={artistContainerRef} className={`player-artist ${isArtistScrolling ? 'scrolling' : ''}`}>
                    <div className="marquee__content" ref={artistContentRef}>
                        <span>{track.artist}</span>
                        <span aria-hidden="true">{track.artist}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}