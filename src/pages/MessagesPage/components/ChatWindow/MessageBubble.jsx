import { useMemo } from 'react';
import styles from './MessageBubble.module.css';

function formatTime(timestamp) {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function MessageBubble({ message, isMine }) {
    const time = useMemo(() => formatTime(message.timestamp), [message.timestamp]);

    return (
        <div className={`${styles.wrapper} ${isMine ? styles.mine : styles.theirs}`}>
            <div
                className={`${styles.bubble} ${isMine ? styles.bubbleMine : styles.bubbleTheirs} ${message.isOptimistic ? styles.optimistic : ''}`}
            >
                <p className={styles.text}>{message.text}</p>
                <span className={styles.time}>{time}</span>
            </div>
        </div>
    );
}