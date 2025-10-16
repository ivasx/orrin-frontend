import {useState, useEffect} from 'react';
import TrackSection from '../../components/TrackSection/TrackSection.jsx';
import ArtistSection from '../../components/ArtistSection/ArtistSection.jsx';
import MusicSectionWrapper from "../../components/MusicSectionWrapper/MusicSectionWrapper.jsx";
import {ways, popularArtists as popularArtistsData} from '../../data.js';
import LoginPromptSection from '../../components/LoginPromptSection/LoginPromptSection.jsx';
import EmptyStateSection from '../../components/EmptyStateSection/EmptyStateSection.jsx';
import SectionSkeleton from '../../components/SectionSkeleton/SectionSkeleton.jsx';
import {useTranslation} from "react-i18next";

const mockRecommendations = ways.slice(0, 4);

export default function HomePage() {
    const [listenNowTracks, setListenNowTracks] = useState([]);
    const [popularArtists, setPopularArtists] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [friendsRecommendations, setFriendsRecommendations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const {t} = useTranslation();

    useEffect(() => {
        if (isLoggedIn) {
            setIsLoading(true);
            setTimeout(() => {
                setFriendsRecommendations(mockRecommendations);
                setIsLoading(false);
            }, 2000);
        } else {
            setFriendsRecommendations([]);
        }
    }, [isLoggedIn]);

    useEffect(() => {
        setListenNowTracks(ways);
        setPopularArtists(popularArtistsData.slice(0, 5));
    }, []);

    return (
        <>
            <MusicSectionWrapper spacing="top-only">
                <TrackSection
                    title={t('listen_now')}
                    tracks={listenNowTracks}
                    onMoreClick={() => console.log(t('more_pressed'))}
                />
            </MusicSectionWrapper>

            <MusicSectionWrapper spacing="default">
                <ArtistSection
                    title={t('popular_artists')}
                    artists={popularArtists}
                    onMoreClick={() => console.log(t('more_pressed'))}
                />
            </MusicSectionWrapper>

            <MusicSectionWrapper spacing="default">
                {!isLoggedIn ? (
                    <LoginPromptSection
                        title={t('from_friends')}
                        promptText={t('login_prompt_text')}
                        buttonText={t('login_prompt_button')}
                        onLoginClick={() => setIsLoggedIn(true)}
                        onMoreClick={() => console.log(t('more_from_friends'))}
                    />
                ) : isLoading ? (
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
                    tracks={listenNowTracks}
                    onMoreClick={() => console.log(t('more_pressed'))}
                />
            </MusicSectionWrapper>

            <MusicSectionWrapper spacing="default">
                <TrackSection
                    title={t('listen_now')}
                    tracks={listenNowTracks}
                    onMoreClick={() => console.log(t('more_pressed'))}
                />
            </MusicSectionWrapper>
        </>
    );
}