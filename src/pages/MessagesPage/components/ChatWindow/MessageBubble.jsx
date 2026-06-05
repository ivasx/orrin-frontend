import {useMemo} from 'react';
import {useQuery} from '@tanstack/react-query';
import {Play, Music} from 'lucide-react';
import {useAudioCore} from '../../../../context/AudioCoreContext';
import {getTrackBySlug} from '../../../../services/api/index.js';
import styles from './MessageBubble.module.css';

function formatTime(timestamp) {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
}

async function fetchTrackById(trackId) {
    return getTrackBySlug(String(trackId));
}

function TrackAttachment({trackId, isMine}) {
    const {playTrack, isTrackPlaying} = useAudioCore();

    const {data: track, isLoading} = useQuery({
        queryKey: ['track-in-chat', String(trackId)],
        queryFn: () => fetchTrackById(trackId),
        enabled: !!trackId,
        staleTime: 1000 * 60 * 10,
        retry: 1,
    });

    const playing = isTrackPlaying(track?.trackId ?? trackId);

    const handlePlay = () => {
        if (track) playTrack(track);
    };

    if (isLoading) {
        return (
            <div className={`${styles.trackCard} ${isMine ? styles.trackCardMine : styles.trackCardTheirs}`}>
                <div className={styles.trackCardLoading}>
                    <Music size={14}/>
                </div>
            </div>
        );
    }

    if (!track) return null;

    return (
        <div
            className={`${styles.trackCard} ${isMine ? styles.trackCardMine : styles.trackCardTheirs}`}
            onClick={handlePlay}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handlePlay()}
        >
            <div className={styles.trackCoverWrapper}>
                {track.cover || track.coverUrl ? (
                    <img
                        src={track.cover || track.coverUrl}
                        alt={track.title}
                        className={styles.trackCover}
                    />
                ) : (
                    <div className={styles.trackCoverFallback}>
                        <Music size={16}/>
                    </div>
                )}
                <div className={`${styles.trackPlayOverlay} ${playing ? styles.playing : ''}`}>
                    <Play size={12} fill="currentColor"/>
                </div>
            </div>
            <div className={styles.trackInfo}>
                <span className={styles.trackTitle}>{track.title}</span>
                <span className={styles.trackArtist}>
                    {track.artist?.name || track.artistName || ''}
                </span>
            </div>
        </div>
    );
}

export default function MessageBubble({message, isMine}) {
    const time = useMemo(() => formatTime(message.timestamp), [message.timestamp]);
    const hasTrack = Boolean(message.trackId);
    const hasText = Boolean(message.text?.trim());

    return (
        <div className={`${styles.wrapper} ${isMine ? styles.mine : styles.theirs}`}>
            <div
                className={`${styles.bubble} ${isMine ? styles.bubbleMine : styles.bubbleTheirs} ${message.isOptimistic ? styles.optimistic : ''}`}
            >
                {hasTrack && (
                    <TrackAttachment trackId={message.trackId} isMine={isMine}/>
                )}
                {hasText && (
                    <p className={styles.text}>{message.text}</p>
                )}
                <span className={styles.time}>{time}</span>
            </div>
        </div>
    );
}