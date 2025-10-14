import {useState, useEffect} from 'react';
import TrackSection from '../../components/TrackSection/TrackSection.jsx';
import ArtistSection from '../../components/ArtistSection/ArtistSection.jsx'; // 👈 1. Імпортуємо правильний компонент
import MusicSectionWrapper from "../../components/MusicSectionWrapper/MusicSectionWrapper.jsx";
import {ways, popularArtists as popularArtistsData} from '../../data.js'; // 👈 2. Перейменовуємо дані, щоб уникнути конфлікту імен

import LoginPromptSection from '../../components/LoginPromptSection/LoginPromptSection.jsx';
import EmptyStateSection from '../../components/EmptyStateSection/EmptyStateSection.jsx';
import SectionSkeleton from '../../components/SectionSkeleton/SectionSkeleton.jsx';
import {useTranslation} from "react-i18next";

const mockRecommendations = ways.slice(0, 4);

export default function HomePage() {
    const [listenNowTracks, setListenNowTracks] = useState([]);
    const [popularArtists, setPopularArtists] = useState([]); // 👈 3. Виправляємо ім'я стану
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Чи увійшов користувач?
    const [friendsRecommendations, setFriendsRecommendations] = useState([]); // Список рекомендацій
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        if (isLoggedIn) {
            setIsLoading(true);
            // Симулюємо запит до сервера (2 секунди)
            setTimeout(() => {
                // Встановлюємо дані
                setFriendsRecommendations(mockRecommendations);

                // Щоб протестувати випадок без рекомендацій, розкоментуйте рядок нижче:
                // setFriendsRecommendations([]);

                setIsLoading(false);
            }, 2000);
        } else {
            // Якщо користувач виходить, очищуємо дані
            setFriendsRecommendations([]);
        }
    }, [isLoggedIn]);

    useEffect(() => {
        // Імітуємо завантаження даних
        setListenNowTracks(ways);
        setPopularArtists(popularArtistsData.slice(0, 5));

    }, []);

    return (
        <>
            {/*<div style={{ textAlign: 'center', margin: '20px' }}>*/}
            {/*    <button onClick={() => setIsLoggedIn(!isLoggedIn)}>*/}
            {/*        {isLoggedIn ? 'Вийти' : 'Увійти (для тесту)'}*/}
            {/*    </button>*/}
            {/*</div>*/}

            <MusicSectionWrapper spacing="top-only">
                <TrackSection
                    title={t('listen_now')}
                    tracks={listenNowTracks}
                    onMoreClick={() => console.log('Більше натиснуто')}
                />
            </MusicSectionWrapper>

            <MusicSectionWrapper spacing="default">
                <ArtistSection
                    title={t('popular_artists')}
                    artists={popularArtists}
                    onMoreClick={() => console.log('Більше натиснуто')}
                />
            </MusicSectionWrapper>

            <MusicSectionWrapper spacing="default">
                {!isLoggedIn ? (
                    <LoginPromptSection
                        title={t('from_friends')}
                        promptText="Увійдіть щоб отримувати рекомендації від друзів"
                        buttonText="Увійти"
                        onLoginClick={() => setIsLoggedIn(true)}
                        onMoreClick={() => console.log('Більше від друзів')}
                    />
                ) : isLoading ? (
                    <SectionSkeleton title={t('from_friends')} />
                ) : friendsRecommendations.length > 0 ? (
                    <TrackSection
                        title={t('from_friends')}
                        tracks={friendsRecommendations}
                        onMoreClick={() => console.log('Більше від друзів')}
                    />
                ) : (
                    <EmptyStateSection
                        title={t('from_friends')}
                        message="Жоден друг ще нічого не порекомендував"
                        onMoreClick={() => console.log('Більше від друзів')}
                    />
                )}
            </MusicSectionWrapper>

            <MusicSectionWrapper spacing="default">
                <TrackSection
                    title={t('listen_now')}
                    tracks={listenNowTracks}
                    onMoreClick={() => console.log('Більше натиснуто')}
                />
            </MusicSectionWrapper>

            <MusicSectionWrapper spacing="default">
                <TrackSection
                    title={t('listen_now')}
                    tracks={listenNowTracks}
                    onMoreClick={() => console.log('Більше натиснуто')}
                />
            </MusicSectionWrapper>


        </>
    );
}