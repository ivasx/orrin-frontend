import { useEffect } from 'react';
import './NotFoundPage.css';
import { Link } from 'react-router-dom';
import sadCat from '../../assets/orrin-404.png';
import song404 from '../../assets/song404.mp3';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useAudioPlayer } from '../../context/AudioPlayerContext.jsx';

export default function NotFoundPage() {
    const { playMusicOn404 } = useSettings();
    const { playTrack, stopTrack } = useAudioPlayer();

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
                <p className="not-found-subtitle">Ой! Сторінку не знайдено</p>
                <h1 className="not-found-title">
                    4
                    <img src={sadCat} alt="Crying Cat" className="not-found-cat"/>
                    4
                </h1>
                <p className="not-found-text">На жаль, Orrin не зміг знайти те, що ви шукали.</p>
                <Link to="/" className="not-found-button">
                    Повернутись на головну
                </Link>
            </div>
        </div>
    );
}