import styles from './Spinner.module.css';

const SIZE_MAP = {
    small: 16,
    medium: 20,
    large: 32,
};

export default function Spinner({size = 'medium'}) {
    const px = SIZE_MAP[size] ?? SIZE_MAP.medium;

    return (
        <div
            className={styles.spinner}
            style={{width: px, height: px}}
            role="status"
            aria-live="polite"
        />
    );
}