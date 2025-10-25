import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ways, popularArtists } from '../../data'; // Імпортуємо дані
import TrackSection from '../../components/TrackSection/TrackSection';
import ArtistSection from '../../components/ArtistSection/ArtistSection';
import MusicSectionWrapper from '../../components/MusicSectionWrapper/MusicSectionWrapper';
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

        // Розбиваємо на слова, як і раніше
        const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);

        // Імітуємо затримку
        const searchTimer = setTimeout(() => {

            // --- Початок змін: Фільтрація за допомогою .some() ---
            const tracks = ways.filter(track => { //
                const titleLower = track.title.toLowerCase();
                const artistLower = track.artist.toLowerCase();
                // Перевіряємо, чи ХОЧА Б ОДНЕ слово запиту є в назві АБО в імені виконавця
                return searchWords.some(word => // <-- Змінено .every на .some
                    titleLower.includes(word) || artistLower.includes(word)
                );
            });

            const artists = popularArtists.filter(artist => { //
                const nameLower = artist.name.toLowerCase();
                // Перевіряємо, чи ХОЧА Б ОДНЕ слово запиту є в імені виконавця
                return searchWords.some(word => nameLower.includes(word)); // <-- Змінено .every на .some
            });
            // --- Кінець змін ---

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
                    // TODO: Replace with translated string
                    <h1 className="search-results-title">Результати пошуку для "{query}"</h1>
                )}

                {isLoading ? (
                    // TODO: Replace with translated string
                    <p>Шукаємо...</p> // Або компонент-скелетон
                ) : (
                    <>
                        {foundArtists.length > 0 && (
                            <MusicSectionWrapper spacing="default">
                                <ArtistSection
                                    // TODO: Replace with translated string
                                    title="Знайдені виконавці"
                                    artists={foundArtists}
                                    onMoreClick={() => console.log('More artists clicked')}
                                />
                            </MusicSectionWrapper>
                        )}

                        {foundTracks.length > 0 && (
                            <MusicSectionWrapper spacing="default">
                                <TrackSection
                                    // TODO: Replace with translated string
                                    title="Знайдені треки"
                                    tracks={foundTracks}
                                    onMoreClick={() => console.log('More tracks clicked')}
                                />
                            </MusicSectionWrapper>
                        )}

                        {foundTracks.length === 0 && foundArtists.length === 0 && !isLoading && query && (
                            // TODO: Replace with translated string
                            <p className="no-results-message">Нічого не знайдено за запитом "{query}".</p>
                        )}
                        {!query && (
                            // TODO: Replace with translated string
                            <p>Введіть щось у поле пошуку.</p>
                        )}
                    </>
                )}
            </div>
        </MusicSectionWrapper>
    );
}