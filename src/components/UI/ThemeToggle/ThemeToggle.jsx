import {Sun, Moon} from 'lucide-react';
import {useSettings} from '../../../context/SettingsContext';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle({size = 'md'}) {
    const {theme, toggleTheme} = useSettings();
    const isLight = theme === 'light';

    return (
        <button
            type="button"
            className={`${styles.toggle} ${styles[size]}`}
            onClick={toggleTheme}
            aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
            title={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
        >
            <span className={styles.track}>
                <span className={`${styles.thumb} ${isLight ? styles.thumbLight : ''}`}>
                    <Sun size={size === 'sm' ? 10 : 12} className={styles.iconSun} aria-hidden/>
                    <Moon size={size === 'sm' ? 10 : 12} className={styles.iconMoon} aria-hidden/>
                </span>
            </span>
        </button>
    );
}