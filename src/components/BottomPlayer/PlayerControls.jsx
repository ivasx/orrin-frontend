import { SkipBack, SkipForward, Shuffle, Repeat, Repeat1 } from 'lucide-react';

const PlayIcon = () => <div className="play-triangle"></div>;
const PauseIcon = () => <div className="pause-icon"><span></span><span></span></div>;
const LoadingSpinner = () => <div className="loading-spinner"></div>;

export default function PlayerControls({
                                           isPlaying,
                                           isLoading,
                                           isShuffled, // <-- ВИПРАВЛЕНО: isShuffled замість isShuffling
                                           repeatMode,
                                           onPlayPause,
                                           onNext,
                                           onPrevious,
                                           onToggleShuffle,
                                           onToggleRepeat
                                       }) {
    return (
        <div className="player-controls">
            <button
                className={`control-btn ${repeatMode !== 'off' ? 'active' : ''}`}
                onClick={onToggleRepeat}
            >
                {/* ▼▼▼ ОСНОВНЕ ВИПРАВЛЕННЯ ТУТ ▼▼▼ */}
                {repeatMode === 'one' ? <Repeat1 size={20} className="repeat-one-icon" /> : <Repeat size={20} />}
            </button>
            <button className="control-btn" onClick={onPrevious}><SkipBack size={20}/></button>
            <button className="play-pause-btn" onClick={onPlayPause} disabled={isLoading}>
                {isLoading ? <LoadingSpinner /> : isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button className="control-btn" onClick={onNext}><SkipForward size={20}/></button>
            <button
                className={`control-btn ${isShuffled ? 'active' : ''}`} // <-- ВИПРАВЛЕНО: isShuffled
                onClick={onToggleShuffle}
            >
                <Shuffle size={20} />
            </button>
        </div>
    );
}