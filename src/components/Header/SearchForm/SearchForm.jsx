// src/components/Header/SearchForm/SearchForm.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import "./SearchForm.css";
import { useTranslation } from "react-i18next";
import SearchSuggestions from './SearchSuggestions';
import { ways, popularArtists } from '../../../data';

const SEARCH_HISTORY_KEY = 'orrin_search_history';
const MAX_HISTORY_ITEMS = 5;

export default function SearchForm({ initialQuery = "", onSubmit, onBack }) {
    const [query, setQuery] = useState(initialQuery);
    const { t } = useTranslation();
    const [suggestions, setSuggestions] = useState([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
    const [searchHistory, setSearchHistory] = useState([]);
    const searchWrapperRef = useRef(null);
    const searchTimerRef = useRef(null);

    // Завантаження історії пошуку при монтуванні
    useEffect(() => {
        const loadSearchHistory = () => {
            try {
                const history = localStorage.getItem(SEARCH_HISTORY_KEY);
                if (history) {
                    setSearchHistory(JSON.parse(history));
                }
            } catch (error) {
                console.error('Error loading search history:', error);
            }
        };
        loadSearchHistory();
    }, []);

    // Збереження в історію пошуку
    const addToSearchHistory = (searchTerm) => {
        const trimmedTerm = searchTerm.trim();
        if (!trimmedTerm) return;

        try {
            const newHistory = [
                trimmedTerm,
                ...searchHistory.filter(item => item.toLowerCase() !== trimmedTerm.toLowerCase())
            ].slice(0, MAX_HISTORY_ITEMS);

            setSearchHistory(newHistory);
            localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
        } catch (error) {
            console.error('Error saving search history:', error);
        }
    };

    // Видалення з історії
    const removeFromHistory = (termToRemove) => {
        try {
            const newHistory = searchHistory.filter(
                item => item.toLowerCase() !== termToRemove.toLowerCase()
            );
            setSearchHistory(newHistory);
            localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
        } catch (error) {
            console.error('Error removing from search history:', error);
        }
    };

    // Перевірка чиterm є в історії
    const isInHistory = (term) => {
        return searchHistory.some(item => item.toLowerCase() === term.toLowerCase());
    };

    // Хук Debounce
    const useDebounce = (value, delay) => {
        const [debouncedValue, setDebouncedValue] = useState(value);
        useEffect(() => {
            const handler = setTimeout(() => {
                setDebouncedValue(value);
            }, delay);
            return () => {
                clearTimeout(handler);
            };
        }, [value, delay]);
        return debouncedValue;
    };

    const debouncedQuery = useDebounce(query, 300);

    // Ефект для пошуку підказок
    useEffect(() => {
        const searchTerm = debouncedQuery.trim().toLowerCase();

        if (searchTerm === '') {
            // Показуємо історію пошуку, якщо запит порожній
            if (searchHistory.length > 0) {
                const historySuggestions = searchHistory.map(item => ({
                    type: 'history',
                    text: item,
                    icon: 'history'
                }));
                setSuggestions(historySuggestions);
            } else {
                setSuggestions([]);
                setIsSuggestionsVisible(false);
            }
            setIsLoadingSuggestions(false);
            return;
        }

        setIsLoadingSuggestions(true);
        setIsSuggestionsVisible(true);

        // Очищаємо попередній таймер
        if (searchTimerRef.current) {
            clearTimeout(searchTimerRef.current);
        }

        // Імітуємо невелику затримку
        searchTimerRef.current = setTimeout(() => {
            // Пошук треків
            const filteredTracks = ways.filter(track =>
                track.title.toLowerCase().includes(searchTerm) ||
                track.artist.toLowerCase().includes(searchTerm)
            ).slice(0, 5);

            // Пошук артистів
            const filteredArtists = popularArtists.filter(artist =>
                artist.name.toLowerCase().includes(searchTerm)
            ).slice(0, 3);

            // Формуємо підказки з треків та артистів
            const trackSuggestions = filteredTracks.map(t => {
                const fullText = `${t.title} - ${t.artist}`;
                return {
                    type: 'track',
                    text: fullText,
                    icon: isInHistory(fullText) ? 'history' : 'search'
                };
            });

            const artistSuggestions = filteredArtists.map(a => ({
                type: 'artist',
                text: a.name,
                icon: isInHistory(a.name) ? 'history' : 'search'
            }));

            // Об'єднуємо
            const combinedSuggestions = [...trackSuggestions, ...artistSuggestions].slice(0, 8);

            setSuggestions(combinedSuggestions);
            setIsLoadingSuggestions(false);
        }, 150);

        return () => {
            if (searchTimerRef.current) {
                clearTimeout(searchTimerRef.current);
            }
        };
    }, [debouncedQuery, searchHistory]);

    // Обробник вибору підказки
    const handleSuggestionClick = (suggestion) => {
        const cleanText = suggestion.text;
        setQuery(cleanText);
        setSuggestions([]);
        setIsSuggestionsVisible(false);

        // Додаємо в історію
        addToSearchHistory(cleanText);

        if (onSubmit) {
            onSubmit(cleanText);
        }
    };

    // Видалення з історії
    const handleRemoveFromHistory = (suggestion, e) => {
        e.stopPropagation();
        removeFromHistory(suggestion.text);
    };

    // Закриття підказок при кліку поза компонентом
    const handleClickOutside = useCallback((event) => {
        if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
            setIsSuggestionsVisible(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleClickOutside]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmedQuery = query.trim();
        setIsSuggestionsVisible(false);
        if (trimmedQuery) {
            // Додаємо в історію перед сабмітом
            addToSearchHistory(trimmedQuery);

            if (onSubmit) {
                onSubmit(trimmedQuery);
            }
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSubmit(e);
        }
        if (e.key === 'Escape') {
            setIsSuggestionsVisible(false);
        }
    };

    const handleInputChange = (e) => {
        setQuery(e.target.value);
    };

    const handleFocus = () => {
        // Показуємо історію або підказки
        if (query.trim() === '' && searchHistory.length > 0) {
            const historySuggestions = searchHistory.map(item => ({
                type: 'history',
                text: item,
                icon: 'history'
            }));
            setSuggestions(historySuggestions);
            setIsSuggestionsVisible(true);
        } else if (suggestions.length > 0) {
            setIsSuggestionsVisible(true);
        }
    };

    const handleClear = () => {
        setQuery("");
        setSuggestions([]);
        setIsSuggestionsVisible(false);
    };

    return (
        <div
            className={`search-form ${isSuggestionsVisible ? 'suggestions-open' : ''}`}
            ref={searchWrapperRef}
        >
            <form className="search-form__wrapper" onSubmit={handleSubmit} autoComplete="off">
                {onBack ? (
                    <button
                        type="button"
                        className="search-back-btn"
                        onClick={onBack}
                        aria-label={t('sf_close_search')}
                    >
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                    </button>
                ) : (
                    <button
                        type="submit"
                        className="search-icon-wrapper"
                        aria-label={t('sf_search')}
                    >
                        <svg className="search-icon" viewBox="0 0 24 24">
                            <path
                                d="M21 21L16.5 16.5M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
                                fill="none" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                    </button>
                )}
                <input
                    type="text"
                    className="search-input"
                    placeholder={t('sf_search_placeholder')}
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    onFocus={handleFocus}
                    aria-autocomplete="list"
                    aria-controls="search-suggestions-list"
                    aria-expanded={isSuggestionsVisible}
                />
                {query && (
                    <button
                        type="button"
                        className="search-clear-btn"
                        onClick={handleClear}
                        aria-label={t('sf_clear_search_field')}
                    >
                        ×
                    </button>
                )}
            </form>

            {isSuggestionsVisible && (
                <SearchSuggestions
                    suggestions={suggestions}
                    isLoading={isLoadingSuggestions}
                    onSuggestionClick={handleSuggestionClick}
                    onRemoveFromHistory={handleRemoveFromHistory}
                />
            )}
        </div>
    );
}