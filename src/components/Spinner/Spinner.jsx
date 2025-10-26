import styles from './Spinner.module.css';

export default function Spinner({ size = 'medium' /* small, medium, large */ }) {
    // В майбутньому можна додати класи для різних розмірів
    return <div className={styles.spinner} role="status" aria-live="polite"></div>;
}