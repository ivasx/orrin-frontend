import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { searchGlobal } from '../../services/api/index.js';
import TrackSection from '../../components/Shared/TrackSection/TrackSection';
import ArtistSection from '../../components/Shared/ArtistSection/ArtistSection';
import MusicSectionWrapper from '../../components/Shared/MusicSectionWrapper/MusicSectionWrapper';
import './SearchResultsPage.css';

export default function SearchResultsPage() {
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();
    const query = searchParams.get('q') || '';

    const [foundTracks, setFoundTracks]   = useState([]);
    const [foundArtists, setFoundArtists] = useState([]);
    const [isLoading, setIsLoading]       = useState(false);

    useEffect(() => {
        const searchTerm = query.trim();

        if (!searchTerm) {
            setFoundTracks([]);
            setFoundArtists([]);
            return;
        }

        let cancelled = false;
        setIsLoading(true);

        searchGlobal(searchTerm)
            .then(({ tracks, artists }) => {
                if (cancelled) return;
                setFoundTracks(tracks);
                setFoundArtists(artists);
            })
            .catch(() => {})
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => { cancelled = true; };
    }, [query]);

    const hasResults = foundTracks.length > 0 || foundArtists.length > 0;

    return (
        <MusicSectionWrapper spacing="top-only">
            <div className="search-results-page">
                {query && (
                    <h1 className="search-results-title">
                        {t('search_results_for')} "{query}"
                    </h1>
                )}

                {isLoading && <p>{t('searching')}</p>}

                {!isLoading && (
                    <>
                        {foundArtists.length > 0 && (
                            <ArtistSection
                                title={t('found_artists')}
                                artists={foundArtists}
                            />
                        )}

                        {foundTracks.length > 0 && (
                            <TrackSection
                                title={t('found_tracks')}
                                tracks={foundTracks}
                            />
                        )}

                        {query && !hasResults && (
                            <p className="no-results-message">
                                {t('no_results_found_for_request')} "{query}"
                            </p>
                        )}

                        {!query && <p>{t('type_something_in_search_field')}</p>}
                    </>
                )}
            </div>
        </MusicSectionWrapper>
    );
}