import {SkipBack, SkipForward, Shuffle, Repeat, Repeat1} from 'lucide-react';
import Spinner from '../../UI/Spinner/Spinner.jsx';

const PlayIcon = () => <div className="play-triangle"></div>;
const PauseIcon = () => <div className="pause-icon"><span></span><span></span></div>;


export default function PlayerControls({
                                           isPlaying,
                                           isLoading,
                                           isShuffled,
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
                {repeatMode === 'one' ? <Repeat1 size={20} className="repeat-one-icon"/> : <Repeat size={20}/>}
            </button>
            <button className="control-btn" onClick={onPrevious}><SkipBack size={20}/></button>
            <button className="play-pause-btn" onClick={onPlayPause} disabled={isLoading}>
                {isLoading ? <Spinner/> : isPlaying ? <PauseIcon/> : <PlayIcon/>}
            </button>
            <button className="control-btn" onClick={onNext}><SkipForward size={20}/></button>
            <button
                className={`control-btn ${isShuffled ? 'active' : ''}`}
                onClick={onToggleShuffle}
            >
                <Shuffle size={20}/>
            </button>
        </div>
    );
}