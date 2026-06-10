import {memo} from 'react';
import {useTranslation} from 'react-i18next';
import {SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Play, Pause} from 'lucide-react';
import Spinner from '../../../../UI/Spinner/Spinner.jsx';
import styles from './PlayerControls.module.css';

const PlayerControls = ({
                            isPlaying,
                            isLoading,
                            isShuffled,
                            repeatMode,
                            onPlayPause,
                            onNext,
                            onPrevious,
                            onToggleShuffle,
                            onToggleRepeat,
                        }) => {
    const {t} = useTranslation();

    return (
        <div className={styles.container}>
            <button
                className={`${styles.button} ${repeatMode !== 'off' ? styles.active : ''}`}
                onClick={onToggleRepeat}
                aria-label={t('player_repeat_aria')}
            >
                {repeatMode === 'one' ? <Repeat1 size={20}/> : <Repeat size={20}/>}
            </button>

            <button
                className={styles.button}
                onClick={onPrevious}
                aria-label={t('player_previous_aria')}
            >
                <SkipBack size={20}/>
            </button>

            <button
                className={styles.playPauseButton}
                onClick={onPlayPause}
                disabled={isLoading}
                aria-label={isPlaying ? t('pause') : t('play')}
            >
                {isLoading ? (
                    <Spinner size="small"/>
                ) : isPlaying ? (
                    <Pause size={20} fill="currentColor"/>
                ) : (
                    <Play size={20} fill="currentColor" className={styles.playIcon}/>
                )}
            </button>

            <button
                className={styles.button}
                onClick={onNext}
                aria-label={t('player_next_aria')}
            >
                <SkipForward size={20}/>
            </button>

            <button
                className={`${styles.button} ${isShuffled ? styles.active : ''}`}
                onClick={onToggleShuffle}
                aria-label={t('player_shuffle_aria')}
            >
                <Shuffle size={20}/>
            </button>
        </div>
    );
};

export default memo(PlayerControls);