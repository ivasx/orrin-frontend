import { useEffect, useRef } from 'react';
import './MusicLyrics.css';


export default function MusicLyrics({ lyricsData, currentTime, onLineClick}) {

    if (!lyricsData || lyricsData.type === 'none') {
        return (
            <div className="music-lyrics-container flex-center">
                <p className="lyrics-placeholder">Lyrics not available</p>
            </div>
        );
    }

    if (lyricsData.type === 'static') {
        return (
            <div className="music-lyrics-container">
                <div className="lyrics-text">
                    {lyricsData.content}
                </div>
            </div>
        );
    }

    if (lyricsData.type === 'synced') {
        return (
            <div className="music-lyrics-container">
                <div className="lyrics-synced-list">
                    {lyricsData.content.map((line, index) => {
                        const isActive =
                            currentTime >= line.time &&
                            (!lyricsData.content[index + 1] || currentTime < lyricsData.content[index + 1].time);

                        return (
                            <p
                                key={index}
                                className={`synced-line ${isActive ? 'active' : ''}`}
                                onClick={() => onLineClick(line.time)}
                            >
                                {line.text}
                            </p>
                        );
                    })}
                </div>
            </div>
        );
    }

    return null;
}