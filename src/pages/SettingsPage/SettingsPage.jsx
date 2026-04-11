import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import MusicSectionWrapper from '../../components/Shared/MusicSectionWrapper/MusicSectionWrapper.jsx';
import ToggleSwitch from '../../components/UI/ToggleSwitch/ToggleSwitch.jsx';
import SettingsItem from './components/SettingsItem/SettingsItem.jsx';
import LanguageSelector from './components/LanguageSelector/LanguageSelector.jsx';
import styles from './SettingsPage.module.css';

export default function SettingsPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState(false);
    const [saving, setSaving] = useState(false);

    const simulateSave = useCallback((fn) => {
        setSaving(true);
        fn();
        const timer = setTimeout(() => setSaving(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const handleNotificationsChange = useCallback(() => {
        simulateSave(() => setNotifications((prev) => !prev));
    }, [simulateSave]);

    return (
        <MusicSectionWrapper spacing="top-only">
            <div className={styles.container}>
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>{t('settings_title')}</h1>
                    <span className={`${styles.savingIndicator} ${saving ? styles.savingVisible : ''}`}>
                        {t('settings_saving')}
                    </span>
                </div>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>{t('settings_section_general')}</h2>
                    <div className={styles.sectionBody}>
                        <SettingsItem
                            label={t('settings_language')}
                            description={t('settings_language_desc')}
                            control={<LanguageSelector />}
                        />
                    </div>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>{t('settings_section_privacy')}</h2>
                    <div className={styles.sectionBody}>
                        <SettingsItem
                            label={t('settings_notifications')}
                            description={t('settings_notifications_desc')}
                            control={
                                <ToggleSwitch
                                    checked={notifications}
                                    onChange={handleNotificationsChange}
                                    ariaLabel={t('settings_notifications')}
                                />
                            }
                        />
                    </div>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>{t('settings_section_account')}</h2>
                    <div className={styles.sectionBody}>
                        <SettingsItem
                            label={t('settings_terms')}
                            onClick={() => navigate('/terms')}
                        />
                        <SettingsItem
                            label={t('settings_privacy_policy')}
                            onClick={() => navigate('/privacy')}
                        />
                    </div>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>{t('settings_section_about')}</h2>
                    <div className={styles.sectionBody}>
                        <SettingsItem
                            label={t('settings_version')}
                            control={
                                <span className={styles.versionLabel}>1.0.0 (Beta)</span>
                            }
                        />
                    </div>
                </section>
            </div>
        </MusicSectionWrapper>
    );
}