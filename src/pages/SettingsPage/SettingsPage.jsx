import MusicSectionWrapper from '../../components/Shared/MusicSectionWrapper/MusicSectionWrapper.jsx';
import { useSettings } from '../../context/SettingsContext';
import './SettingsPage.css';
import { useTranslation } from 'react-i18next';

export default function SettingsPage() {
    const { t, i18n } = useTranslation();
    const { playMusicOn404, setPlayMusicOn404 } = useSettings();

    const handleLanguageChange = (event) => {
        i18n.changeLanguage(event.target.value);
    };

    const handleCheckboxChange = () => {
        setPlayMusicOn404(prevValue => !prevValue);
    };

    return (
        <MusicSectionWrapper spacing="top-only">
            <div className="settings-page">
                <h1>{t('settings_title')}</h1>

                {/* --- Секція Мови --- */}
                <div className="settings-section">
                    <div className="setting-row">
                        <label className="setting-label" htmlFor="language-select">
                            {t('settings_language')}
                        </label>
                        <div className="setting-control">
                            <select
                                id="language-select"
                                className="language-select"
                                value={i18n.language}
                                onChange={handleLanguageChange}
                            >
                                <option value="uk">Українська</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* --- Секція Експериментальних функцій --- */}
                <div className="settings-section">
                    <h2>{t('settings_experimental')}</h2>
                    <div className="setting-row">
                        <span className="setting-label">
                            {t('settings_404_music')}
                        </span>
                        <div className="setting-control">
                            <label className="setting-toggle">
                                <input
                                    type="checkbox"
                                    checked={playMusicOn404}
                                    onChange={handleCheckboxChange}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>
                    {/* Можна додати інші налаштування сюди */}
                </div>

            </div>
        </MusicSectionWrapper>
    );
}