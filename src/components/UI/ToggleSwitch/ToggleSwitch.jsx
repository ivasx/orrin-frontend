import styles from './ToggleSwitch.module.css';

export default function ToggleSwitch({ checked, onChange, disabled = false, ariaLabel }) {
    return (
        <label className={`${styles.track} ${checked ? styles.on : ''} ${disabled ? styles.disabled : ''}`}>
            <input
                type="checkbox"
                className={styles.input}
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                aria-label={ariaLabel}
            />
            <span className={styles.thumb} />
        </label>
    );
}