// src/pages/HomePage/HomePage.jsx

import {useState, useEffect} from 'react';
import { useQuery } from '@tanstack/react-query';
import TrackSection from '../../components/TrackSection/TrackSection.jsx';
import ArtistSection from '../../components/ArtistSection/ArtistSection.jsx';
import MusicSectionWrapper from "../../components/MusicSectionWrapper/MusicSectionWrapper.jsx";
import LoginPromptSection from '../../components/LoginPromptSection/LoginPromptSection.jsx';
import EmptyStateSection from '../../components/EmptyStateSection/EmptyStateSection.jsx';
import SectionSkeleton from '../../components/SectionSkeleton/SectionSkeleton.jsx';
import {useTranslation} from "react-i18next";
import {getTracks, getArtists} from '../../services/api';
import { logger } from '../../utils/logger';

export default function HomePage() {

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [friendsRecommendations, setFriendsRecommendations] = useState([]);
    const [isLoadingFriends, setIsLoadingFriends] = useState(false);
    const {t} = useTranslation();

    // Запит для треків
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

    // Запит для артистів
    const {
        data: popularArtistsData,
        isLoading: isLoadingArtists,
        isFetching: isFetchingArtists,
        isError: isArtistsError,
        error: artistsError,
        refetch: refetchArtists,
    } = useQuery({
        queryKey: ['artists', 'list'],
        queryFn: getArtists,
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

    return (
        <>
            <MusicSectionWrapper spacing="top-only">
                {isLoadingTracks ? (
                    <SectionSkeleton title={t('listen_now')} />
                ) : isTracksError ? (
                    <SectionSkeleton
                        title={t('listen_now')}
                        isError={true}
                        error={tracksError}
                        onRetry={() => refetchTracks()}
                    />
                ) : (
                    <>
                        <TrackSection
                            title={t('listen_now')}
                            tracks={listenNowTracksData || []}
                            onMoreClick={() => {
                                // TODO: Implement "More" functionality for Listen Now section
                            }}
                        />
                        {/* Індикатор фонового оновлення */}
                        {isFetchingTracks && !isLoadingTracks &&
                            <span style={{marginLeft: '10px', fontSize: '0.8em', color: '#888'}}>🔄 Оновлення...</span>}
                    </>
                )}
            </MusicSectionWrapper>

            {/* --- Секція популярних артистів --- */}
            <MusicSectionWrapper spacing="default">
                {isLoadingArtists ? (
                    <SectionSkeleton title={t('popular_artists')} />
                ) : isArtistsError ? (
                    <SectionSkeleton
                        title={t('popular_artists')}
                        isError={true}
                        error={artistsError}
                        onRetry={() => refetchArtists()}
                        errorMessageKey="error_loading_artists"
                    />
                ) : (
                    <>
                        <ArtistSection
                            title={t('popular_artists')}
                            artists={popularArtistsData || []}
                            onMoreClick={() => {
                                // TODO: Implement "More" functionality for Popular Artists section
                            }}
                        />
                        {/* Індикатор фонового оновлення */}
                        {isFetchingArtists && !isLoadingArtists &&
                            <span style={{marginLeft: '10px', fontSize: '0.8em', color: '#888'}}>🔄 Оновлення...</span>}
                    </>
                )}
            </MusicSectionWrapper>

            <MusicSectionWrapper spacing="default">
                {!isLoggedIn ? (
                    <LoginPromptSection
                        title={t('from_friends')}
                        promptText={t('login_prompt_text')}
                        buttonText={t('login_prompt_button')}
                        onLoginClick={() => setIsLoggedIn(true)}
                        onMoreClick={() => {
                            // TODO: Implement "More" functionality for From Friends section
                        }}
                    />
                ) : isLoadingFriends ? (
                    <SectionSkeleton title={t('from_friends')}/>
                ) : friendsRecommendations.length > 0 ? (
                    <TrackSection
                        title={t('from_friends')}
                        tracks={friendsRecommendations}
                        onMoreClick={() => {
                            // TODO: Implement "More" functionality for From Friends section
                        }}
                    />
                ) : (
                    <EmptyStateSection
                        title={t('from_friends')}
                        message={t('empty_state_message')}
                        onMoreClick={() => {
                            // TODO: Implement "More" functionality for From Friends section
                        }}
                    />
                )}
            </MusicSectionWrapper>

        </>
    );
}