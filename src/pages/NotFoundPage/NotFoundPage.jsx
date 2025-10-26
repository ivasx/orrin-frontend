import {useEffect} from 'react';
import './NotFoundPage.css';
import {Link} from 'react-router-dom';
import sadCat from '../../assets/orrin-404.png';
import song404 from '../../assets/song404.mp3';
import {useSettings} from '../../context/SettingsContext.jsx';
import {useAudioCore} from '../../context/AudioCoreContext.jsx';
import {useTranslation} from 'react-i18next';

export default function NotFoundPage() {
    const {t} = useTranslation();
    const {playMusicOn404} = useSettings();
    const {playTrack, stopTrack} = useAudioCore();

    useEffect(() => {
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';

        if (playMusicOn404) {
            playTrack({
                trackId: 'song-404',
                title: 'Page Not Found',
                artist: 'Orrin',
                audio: song404,
                loop: true
            });
        }

        return () => {
            document.documentElement.style.overflow = 'auto';
            document.body.style.overflow = 'auto';
            stopTrack();
        };
    }, [playMusicOn404, playTrack, stopTrack]);

    return (
        <div className="not-found-container">
            <div className="not-found-content">
                <p className="not-found-subtitle">{t('not_found_subtitle')}</p>
                <h1 className="not-found-title">
                    4
                    <img src={sadCat} alt={t('not_found_alt_cat')} className="not-found-cat"/>
                    4
                </h1>
                <p className="not-found-text">{t('not_found_text')}</p>
                <Link to="/" className="not-found-button">
                    {t('not_found_button')}
                </Link>
            </div>
        </div>
    );
}