import styles from './HistoryTab.module.css';

export default function HistoryTab({ artist }) {
    return (
        <div className={styles.container}>
            <p className={styles.text}>{artist.history}</p>
        </div>
    );
}