import {useState, useEffect} from 'react';
import TrackSection from '../../components/TrackSection/TrackSection.jsx';
import ArtistSection from '../../components/ArtistSection/ArtistSection.jsx'; // 👈 1. Імпортуємо правильний компонент
import MusicSectionWrapper from "../../components/MusicSectionWrapper/MusicSectionWrapper.jsx";
import {ways, popularArtists as popularArtistsData} from '../../data.js'; // 👈 2. Перейменовуємо дані, щоб уникнути конфлікту імен

import LoginPromptSection from '../../components/LoginPromptSection/LoginPromptSection.jsx';
import EmptyStateSection from '../../components/EmptyStateSection/EmptyStateSection.jsx';
import SectionSkeleton from '../../components/SectionSkeleton/SectionSkeleton.jsx';

const mockRecommendations = ways.slice(0, 4);

export default function HomePage() {
    const [listenNowTracks, setListenNowTracks] = useState([]);
    const [popularArtists, setPopularArtists] = useState([]); // 👈 3. Виправляємо ім'я стану
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Чи увійшов користувач?
    const [friendsRecommendations, setFriendsRecommendations] = useState([]); // Список рекомендацій
    const [isLoading, setIsLoading] = useState(false);

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
            <div style={{ textAlign: 'center', margin: '20px' }}>
                <button onClick={() => setIsLoggedIn(!isLoggedIn)}>
                    {isLoggedIn ? 'Вийти' : 'Увійти (для тесту)'}
                </button>
            </div>

            <MusicSectionWrapper spacing="top-only">
                <TrackSection
                    title="Слухати зараз"
                    tracks={listenNowTracks}
                    onMoreClick={() => console.log('Більше натиснуто')}
                />
            </MusicSectionWrapper>

            <MusicSectionWrapper spacing="default">
                <ArtistSection
                    title="Популярні виконавці"
                    artists={popularArtists}
                    onMoreClick={() => console.log('Більше натиснуто')}
                />
            </MusicSectionWrapper>

            <MusicSectionWrapper spacing="default">
                {!isLoggedIn ? (
                    <LoginPromptSection
                        title="Від друзів"
                        promptText="Увійдіть щоб отримувати рекомендації від друзів"
                        buttonText="Увійти"
                        onLoginClick={() => setIsLoggedIn(true)}
                        onMoreClick={() => console.log('Більше від друзів')}
                    />
                ) : isLoading ? (
                    // 👇 Замість тексту тепер використовуємо скелет
                    <SectionSkeleton title="Від друзів" />
                ) : friendsRecommendations.length > 0 ? (
                    <TrackSection
                        title="Від друзів"
                        tracks={friendsRecommendations}
                        onMoreClick={() => console.log('Більше від друзів')}
                    />
                ) : (
                    <EmptyStateSection
                        title="Від друзів"
                        message="Жоден друг ще нічого не порекомендував"
                        onMoreClick={() => console.log('Більше від друзів')}
                    />
                )}
            </MusicSectionWrapper>

            <MusicSectionWrapper spacing="default">
                <TrackSection
                    title="Слухати зараз"
                    tracks={listenNowTracks}
                    onMoreClick={() => console.log('Більше натиснуто')}
                />
            </MusicSectionWrapper>

            <MusicSectionWrapper spacing="default">
                <TrackSection
                    title="Слухати зараз"
                    tracks={listenNowTracks}
                    onMoreClick={() => console.log('Більше натиснуто')}
                />
            </MusicSectionWrapper>


        </>
    );
}