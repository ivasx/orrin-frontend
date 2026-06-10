import styles from './MusicSectionWrapper.module.css';

const SPACING_MAP = {
    default: styles.default,
    tight: styles.tight,
    'top-only': styles.topOnly,
    none: styles.none,
};

export default function MusicSectionWrapper({children, spacing = 'default'}) {
    const spacingClass = SPACING_MAP[spacing] ?? styles.default;

    return (
        <div className={`${styles.wrapper} ${spacingClass}`}>
            {children}
        </div>
    );
}