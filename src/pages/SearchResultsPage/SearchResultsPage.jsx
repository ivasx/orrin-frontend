import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ways, popularArtists } from '../../data';
import TrackSection from '../../components/Shared/TrackSection/TrackSection';
import ArtistSection from '../../components/Shared/ArtistSection/ArtistSection';
import MusicSectionWrapper from '../../components/Shared/MusicSectionWrapper/MusicSectionWrapper';
import './SearchResultsPage.css';

export default function SearchResultsPage() {
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();
    const query = searchParams.get('q') || '';

    const [foundTracks, setFoundTracks] = useState([]);
    const [foundArtists, setFoundArtists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const searchTerm = query.trim().toLowerCase();

        if (!searchTerm) {
            setFoundTracks([]);
            setFoundArtists([]);
            setIsLoading(false);
            return;
        }

        const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);

        const searchTimer = setTimeout(() => {

            const tracks = ways.filter(track => {
                const titleLower = track.title.toLowerCase();
                const artistLower = track.artist.toLowerCase();
                return searchWords.some(word =>
                    titleLower.includes(word) || artistLower.includes(word)
                );
            });

            const artists = popularArtists.filter(artist => {
                const nameLower = artist.name.toLowerCase();
                return searchWords.some(word => nameLower.includes(word));
            });

            setFoundTracks(tracks);
            setFoundArtists(artists);
            setIsLoading(false);
        }, 300);

        return () => clearTimeout(searchTimer);

    }, [query]);

    return (
        <MusicSectionWrapper spacing="top-only">
            <div className="search-results-page">
                {query && (
                    <h1 className="search-results-title">
                        {t('search_results_for')} "{query}"
                    </h1>
                )}

                {isLoading ? (
                    <p> {t('searching')}</p>
                ) : (
                    <>
                        {foundArtists.length > 0 && (
                            <MusicSectionWrapper spacing="default">
                                <ArtistSection
                                    title={t('found_artists')}
                                    artists={foundArtists}
                                    onMoreClick={() => {
                                        // TODO: Implement "More" functionality for artists
                                    }}
                                />
                            </MusicSectionWrapper>
                        )}

                        {foundTracks.length > 0 && (
                            <MusicSectionWrapper spacing="default">
                                <TrackSection
                                    title={t('found_tracks')}
                                    tracks={foundTracks}
                                    onMoreClick={() => {
                                        // TODO: Implement "More" functionality for tracks
                                    }}
                                />
                            </MusicSectionWrapper>
                        )}

                        {foundTracks.length === 0 && foundArtists.length === 0 && !isLoading && query && (
                            <p className="no-results-message">
                                {t('no_results_found_for_request')} "{query}"
                            </p>
                        )}
                        {!query && (
                            <p>
                                {t('type_something_in_search_field')}
                            </p>
                        )}
                    </>
                )}
            </div>
        </MusicSectionWrapper>
    );
}