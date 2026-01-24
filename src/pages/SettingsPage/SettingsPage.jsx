import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import MusicSectionWrapper from '../../components/Shared/MusicSectionWrapper/MusicSectionWrapper.jsx';
import styles from './SettingsPage.module.css';

export default function SettingsPage() {
    const { t, i18n } = useTranslation();

    const [notifications, setNotifications] = useState(false);

    const handleLanguageChange = (event) => {
        i18n.changeLanguage(event.target.value);
    };

    return (
        <MusicSectionWrapper spacing="top-only">
            <div className={styles.container}>
                <h1 className={styles.title}>{t('settings_title')}</h1>

                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>General</h2>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.labelGroup}>
                            <span className={styles.label}>{t('settings_language')}</span>
                            <span className={styles.description}>
                                Choose your preferred language.
                            </span>
                        </div>
                        <div className={styles.control}>
                            <select
                                className={styles.select}
                                value={i18n.language}
                                onChange={handleLanguageChange}
                            >
                                <option value="uk">Українська</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Privacy & Notifications</h2>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.labelGroup}>
                            <span className={styles.label}>Push Notifications</span>
                            <span className={styles.description}>
                                Receive updates about new releases and friends.
                            </span>
                        </div>
                        <div className={styles.control}>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={notifications}
                                    onChange={() => setNotifications(!notifications)}
                                />
                                <span className={styles.slider}></span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>About Orrin</h2>
                    </div>

                    <div className={styles.row}>
                        <span className={styles.label}>Version</span>
                        <span className={styles.version}>1.0.0 (Beta)</span>
                    </div>

                    <div className={styles.row}>
                        <span className={styles.label}>Terms of Service</span>
                        <a href="#" className={styles.link} onClick={(e) => e.preventDefault()}>Read</a>
                    </div>

                    <div className={styles.row}>
                        <span className={styles.label}>Privacy Policy</span>
                        <a href="#" className={styles.link} onClick={(e) => e.preventDefault()}>Read</a>
                    </div>
                </div>

            </div>
        </MusicSectionWrapper>
    );
}