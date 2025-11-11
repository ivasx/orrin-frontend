import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import MusicSectionWrapper from '../../components/MusicSectionWrapper/MusicSectionWrapper.jsx';
import TrackSection from '../../components/TrackSection/TrackSection.jsx';
import LoginPromptSection from '../../components/LoginPromptSection/LoginPromptSection.jsx';
import { ways } from '../../data.js';


export default function LibraryPage() {
    const [tracks, setTracks] = useState([]);
    // Тимчасовий стан для демо. У реальному додатку це має приходити з глобального контексту AuthContext
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { t } = useTranslation();
    const navigate = useNavigate();

    useEffect(() => {
        setTracks(ways);
        // Майбутній API-запит: fetch('/api/library')...
    }, []);

    // Якщо користувач не ввійшов, показуємо промпт
    if (!isLoggedIn) {
        return (
            <MusicSectionWrapper spacing="top-only">
                <LoginPromptSection
                    title={t('your_library')}
                    promptText="Щоб почати користуватись бібліотекою увійдіть"
                    buttonText={t('login')}
                    onLoginClick={() => navigate('/login')}
                />
            </MusicSectionWrapper>
        );
    }

    // Якщо користувач ввійшов, показуємо контент бібліотеки
    return (
        <MusicSectionWrapper spacing="top-only">
            <TrackSection
                title={t('your_library')}
                tracks={ways}
                onMoreClick={() => console.log(t('more_pressed'))}
            />
        </MusicSectionWrapper>
    );
}