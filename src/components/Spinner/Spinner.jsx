import styles from './Spinner.module.css';

export default function Spinner({ size = 'medium' /* small, medium, large */ }) {
    // In future we can add more sizes
    return <div className={styles.spinner} role="status" aria-live="polite"></div>;
}