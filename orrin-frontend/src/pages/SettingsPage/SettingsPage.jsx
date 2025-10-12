import MusicSectionWrapper from '../../components/MusicSectionWrapper/MusicSectionWrapper.jsx';
import { useSettings } from '../../context/SettingsContext'; // <-- 1. Імпортуй хук
import './SettingsPage.css';

export default function SettingsPage() {

  const { playMusicOn404, setPlayMusicOn404 } = useSettings();

  const handleCheckboxChange = () => {
    setPlayMusicOn404(prevValue => !prevValue);
  };

  return (
    <MusicSectionWrapper spacing="top-only">
      <div className="settings-container">
        <h1>Налаштування</h1>

        <div className="settings-section">
          <h2>Експериментальні функції</h2>
          <label className="setting-toggle">
            <input
              type="checkbox"
              checked={playMusicOn404}
              onChange={handleCheckboxChange}
            />
            <span className="slider"></span>
            <span className="label-text">Відтворювати музику на сторінці 404</span>
          </label>
        </div>

      </div>
    </MusicSectionWrapper>
  );
}