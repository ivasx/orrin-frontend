// src/pages/HomePage/HomePage.jsx

import {useState, useEffect} from 'react'; // Залишаємо для інших станів
import { useQuery } from '@tanstack/react-query';
import TrackSection from '../../components/TrackSection/TrackSection.jsx';
import ArtistSection from '../../components/ArtistSection/ArtistSection.jsx';
import MusicSectionWrapper from "../../components/MusicSectionWrapper/MusicSectionWrapper.jsx";
// import { ways, popularArtists as popularArtistsData } from '../../data.js'; // ways більше не потрібен для listenNowTracks
import {popularArtists as popularArtistsData} from '../../data.js';
import LoginPromptSection from '../../components/LoginPromptSection/LoginPromptSection.jsx';
import EmptyStateSection from '../../components/EmptyStateSection/EmptyStateSection.jsx';
import SectionSkeleton from '../../components/SectionSkeleton/SectionSkeleton.jsx';
import {useTranslation} from "react-i18next";
import {getTracks /*, getArtists */} from '../../services/api';

// const mockRecommendations = ways.slice(0, 4); // Якщо рекомендації теж будуть з API, це можна видалити

export default function HomePage() {

    const [popularArtists, setPopularArtists] = useState(popularArtistsData); // Артисти поки що з data.js
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [friendsRecommendations, setFriendsRecommendations] = useState([]);
    const [isLoadingFriends, setIsLoadingFriends] = useState(false);
    const {t} = useTranslation();


    const {
        data: listenNowTracksData,
        isLoading: isLoadingTracks,
        isFetching: isFetchingTracks,
        isError: isTracksError,
        error: tracksError,
        refetch: refetchTracks,
    } = useQuery({
        queryKey: ['tracks', 'list'],
        queryFn: getTracks,
    });


    useEffect(() => {
        if (isLoggedIn) {
            setIsLoadingFriends(true);
            setTimeout(() => {
                setFriendsRecommendations([]);
                setIsLoadingFriends(false);
            }, 1500);
        } else {
            setFriendsRecommendations([]);
        }
    }, [isLoggedIn]);

    useEffect(() => {
        setPopularArtists(popularArtistsData);
    }, []);


    return (
        <>
            <MusicSectionWrapper spacing="top-only">
                {isLoadingTracks ? (
                    <SectionSkeleton title={t('listen_now')}/>
                ) : isTracksError ? (
                    <div className="error-message">
                        <p>{t('error_loading_tracks', 'Помилка завантаження треків')}:</p>
                        <pre>{tracksError?.message || 'Невідома помилка'}</pre>
                        <button onClick={() => refetchTracks()}>Спробувати ще</button>
                    </div>
                ) : (
                    <TrackSection
                        title={t('listen_now')}
                        // Передаємо дані з useQuery, забезпечуючи порожній масив як fallback
                        tracks={listenNowTracksData || []}
                        onMoreClick={() => console.log(t('more_pressed'))}
                    />
                )}
                {/* Індикатор фонового оновлення */}
                {isFetchingTracks && !isLoadingTracks &&
                    <span style={{marginLeft: '10px', fontSize: '0.8em', color: '#888'}}>🔄 Оновлення...</span>}
            </MusicSectionWrapper>

            {/* --- Секція популярних артистів (поки що статична) --- */}
            <MusicSectionWrapper spacing="default">
                <ArtistSection
                    title={t('popular_artists')}
                    artists={popularArtists} // Зі стану useState
                    onMoreClick={() => console.log(t('more_pressed'))}
                />
            </MusicSectionWrapper>

            <MusicSectionWrapper spacing="default">
                {!isLoggedIn ? (
                    <LoginPromptSection
                        title={t('from_friends')}
                        promptText={t('login_prompt_text')}
                        buttonText={t('login_prompt_button')}
                        onLoginClick={() => setIsLoggedIn(true)} // Логіка логіну
                        onMoreClick={() => console.log(t('more_from_friends'))}
                    />
                ) : isLoadingFriends ? ( // Використовуємо isLoadingFriends
                    <SectionSkeleton title={t('from_friends')}/>
                ) : friendsRecommendations.length > 0 ? (
                    <TrackSection
                        title={t('from_friends')}
                        tracks={friendsRecommendations}
                        onMoreClick={() => console.log(t('more_from_friends'))}
                    />
                ) : (
                    <EmptyStateSection
                        title={t('from_friends')}
                        message={t('empty_state_message')}
                        onMoreClick={() => console.log(t('more_from_friends'))}
                    />
                )}
            </MusicSectionWrapper>


            <MusicSectionWrapper spacing="default">
                <TrackSection
                    title={t('listen_now')}
                    tracks={listenNowTracksData || []}
                    onMoreClick={() => console.log(t('more_pressed'))}
                />
            </MusicSectionWrapper>

            <MusicSectionWrapper spacing="default">
                <TrackSection
                    title={t('listen_now')}
                    tracks={listenNowTracksData || []}
                    onMoreClick={() => console.log(t('more_pressed'))}
                />
            </MusicSectionWrapper>
        </>
    );
}

