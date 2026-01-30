import {SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Play, Pause} from 'lucide-react';
import Spinner from '../../../../UI/Spinner/Spinner.jsx';
import styles from './PlayerControls.module.css';

export default function PlayerControls({
                                           isPlaying, isLoading, isShuffled, repeatMode,
                                           onPlayPause, onNext, onPrevious, onToggleShuffle, onToggleRepeat
                                       }) {
    return (
        <div className={styles.container}>
            <button
                className={`${styles.button} ${repeatMode !== 'off' ? styles.active : ''}`}
                onClick={onToggleRepeat}
                aria-label="Repeat"
            >
                {repeatMode === 'one' ? <Repeat1 size={20}/> : <Repeat size={20}/>}
            </button>

            <button className={styles.button} onClick={onPrevious} aria-label="Previous">
                <SkipBack size={20}/>
            </button>

            <button
                className={styles.playPauseButton}
                onClick={onPlayPause}
                disabled={isLoading}
                aria-label={isPlaying ? "Pause" : "Play"}
            >
                {isLoading ? <Spinner size="small" dark/> : (
                    isPlaying ? <Pause size={20} fill="currentColor"/> :
                        <Play size={20} fill="currentColor" className={styles.playIcon}/>
                )}
            </button>

            <button className={styles.button} onClick={onNext} aria-label="Next">
                <SkipForward size={20}/>
            </button>

            <button
                className={`${styles.button} ${isShuffled ? styles.active : ''}`}
                onClick={onToggleShuffle}
                aria-label="Shuffle"
            >
                <Shuffle size={20}/>
            </button>
        </div>
    );
}