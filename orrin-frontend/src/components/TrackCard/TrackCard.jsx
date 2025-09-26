import "./TrackCard.css";
import {useRef, useState} from "react";

export default function TrackCard({title, artist, duration, cover, audio}) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isIconHovered, setIsIconHovered] = useState(false);
    const [durationHovered, setDurationHovered] = useState(false);

    function handlePlayPause() {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }

        setIsPlaying(!isPlaying);
    }

    return (
        <div className="card-track">
            <div
                className="track-cover-wrapper"
                onClick={handlePlayPause}
                onMouseEnter={() => setIsIconHovered(true)}
                onMouseLeave={() => setIsIconHovered(false)}
            >
                <img src={cover} alt={title} className="track-cover"/>

                {/* Play / Pause */}
                <div className="play-icon">
                    {!isPlaying ? (
                        <div className="triangle"></div>
                    ) : (
                        <div className={`pause ${isIconHovered ? "hovered" : ""}`}>
                            <span></span>
                            <span></span>
                        </div>
                    )}
                </div>

                {/* Bars */}
                {isPlaying && !isIconHovered && (
                    <div className="bars">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                )}
            </div>

            <div className="track-info">
                <div className="track-title">{title}</div>
                <div className="track-artist">{artist}</div>
                <div
                    className="track-duration"
                    onMouseEnter={() => setDurationHovered(true)}
                    onMouseLeave={() => setDurationHovered(false)}
                >
                    {!durationHovered ? (
                        <span className="duration-text">{duration}</span>
                    ) : (
                        <span className="duration-dots">...</span>
                    )}
                </div>
            </div>

            <audio ref={audioRef} src={audio}></audio>
        </div>
    );
}