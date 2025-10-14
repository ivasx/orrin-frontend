import MusicSectionWrapper from '../../components/MusicSectionWrapper/MusicSectionWrapper.jsx';
import {useSettings} from '../../context/SettingsContext';
import {useAudioPlayer} from '../../context/AudioPlayerContext.jsx';
import './SettingsPage.css';
import {useTranslation} from 'react-i18next';
import {useEffect} from "react";

export default function SettingsPage() {
    const {i18n} = useTranslation();
    const {playMusicOn404, setPlayMusicOn404} = useSettings();
    const {audioRef} = useAudioPlayer();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };


    const handleCheckboxChange = () => {
        const willBeEnabled = !playMusicOn404;
        setPlayMusicOn404(prevValue => !prevValue);

        if (willBeEnabled && audioRef.current && audioRef.current.paused) {
            const audio = audioRef.current;
            const originalVolume = audio.volume;
            audio.volume = 0;

            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    audio.pause();
                    audio.volume = originalVolume;
                    console.log('Autoplay permission granted!');
                }).catch(error => {
                    console.error('Could not unlock autoplay:', error);
                    audio.volume = originalVolume;
                });
            }
        }
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
                    <button onClick={() => changeLanguage('uk')}>UK</button>
                    <button onClick={() => changeLanguage('en')}>EN</button>
                </div>

            </div>
        </MusicSectionWrapper>
    );
}