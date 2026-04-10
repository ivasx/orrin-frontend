import { useTranslation } from 'react-i18next';
import styles from './LanguageSelector.module.css';

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'uk', label: 'Українська' },
];

export default function LanguageSelector() {
    const { i18n } = useTranslation();
    const current = i18n.language;

    return (
        <div className={styles.group} role="group">
            {LANGUAGES.map((lang) => (
                <button
                    key={lang.code}
                    type="button"
                    className={`${styles.option} ${current === lang.code ? styles.active : ''}`}
                    onClick={() => i18n.changeLanguage(lang.code)}
                    aria-pressed={current === lang.code}
                >
                    {lang.label}
                </button>
            ))}
        </div>
    );
}