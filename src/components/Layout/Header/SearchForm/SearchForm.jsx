import {useState, useEffect, useRef, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {Search, ChevronLeft, X} from 'lucide-react';
import SearchSuggestions from './SearchSuggestions.jsx';
import {logger} from '../../../../utils/logger.js';
import styles from './SearchForm.module.css';
import {searchGlobal} from '../../../../services/api/index.js';
import {useDebounce} from '../../../../hooks/useDebounce.js';

const SEARCH_HISTORY_KEY = 'orrin_search_history';
const MAX_HISTORY_ITEMS = 5;

export default function SearchForm({initialQuery = '', onSubmit, onBack}) {
    const [query, setQuery] = useState(initialQuery);
    const {t} = useTranslation();
    const [suggestions, setSuggestions] = useState([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
    const [searchHistory, setSearchHistory] = useState([]);
    const searchWrapperRef = useRef(null);

    const debouncedQuery = useDebounce(query, 400);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
            if (stored) setSearchHistory(JSON.parse(stored));
        } catch (error) {
            logger.error('Error loading search history:', error);
        }
    }, []);

    const addToSearchHistory = useCallback((searchTerm) => {
        const trimmedTerm = searchTerm.trim();
        if (!trimmedTerm) return;

        try {
            setSearchHistory(prev => {
                const newHistory = [
                    trimmedTerm,
                    ...prev.filter(item => item.toLowerCase() !== trimmedTerm.toLowerCase()),
                ].slice(0, MAX_HISTORY_ITEMS);
                localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
                return newHistory;
            });
        } catch (error) {
            logger.error('Error saving search history:', error);
        }
    }, []);

    const removeFromHistory = useCallback((termToRemove) => {
        try {
            setSearchHistory(prev => {
                const newHistory = prev.filter(
                    item => item.toLowerCase() !== termToRemove.toLowerCase(),
                );
                localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
                return newHistory;
            });
        } catch (error) {
            logger.error('Error removing from search history:', error);
        }
    }, []);

    const isInHistory = useCallback((term) => {
        return searchHistory.some(item => item.toLowerCase() === term.toLowerCase());
    }, [searchHistory]);

    useEffect(() => {
        const searchTerm = debouncedQuery.trim();

        if (!searchTerm) {
            if (searchHistory.length > 0) {
                setSuggestions(searchHistory.map(item => ({type: 'history', text: item, icon: 'history'})));
            } else {
                setSuggestions([]);
                if (document.activeElement !== searchWrapperRef.current?.querySelector('input')) {
                    setIsSuggestionsVisible(false);
                }
            }
            setIsLoadingSuggestions(false);
            return;
        }

        setIsLoadingSuggestions(true);
        setIsSuggestionsVisible(true);

        const fetchSuggestions = async () => {
            try {
                const {tracks, artists} = await searchGlobal(searchTerm);

                const trackSuggestions = tracks.slice(0, 5).map(tr => {
                    const fullText = `${tr.title} - ${tr.artist}`;
                    return {
                        type: 'track',
                        text: fullText,
                        icon: isInHistory(fullText) ? 'history' : 'search',
                        data: tr
                    };
                });

                const artistSuggestions = artists.slice(0, 3).map(a => ({
                    type: 'artist',
                    text: a.name,
                    icon: isInHistory(a.name) ? 'history' : 'search',
                    data: a,
                }));

                const combined = [...trackSuggestions, ...artistSuggestions];
                setSuggestions(combined.length === 0
                    ? [{type: 'info', text: t('sf_no_results'), icon: 'search'}]
                    : combined,
                );
            } catch (error) {
                logger.error('Search failed:', error);
                setSuggestions([]);
            } finally {
                setIsLoadingSuggestions(false);
            }
        };

        fetchSuggestions();
    }, [debouncedQuery, searchHistory, isInHistory, t]);

    const handleSuggestionClick = useCallback((suggestion) => {
        if (suggestion.type === 'info') return;
        setQuery(suggestion.text);
        setSuggestions([]);
        setIsSuggestionsVisible(false);
        addToSearchHistory(suggestion.text);
        onSubmit?.(suggestion.text);
    }, [addToSearchHistory, onSubmit]);

    const handleRemoveFromHistory = useCallback((suggestion, e) => {
        e.stopPropagation();
        removeFromHistory(suggestion.text);
    }, [removeFromHistory]);

    const handleClickOutside = useCallback((event) => {
        if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
            setIsSuggestionsVisible(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [handleClickOutside]);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        const trimmedQuery = query.trim();
        setIsSuggestionsVisible(false);
        if (trimmedQuery) {
            addToSearchHistory(trimmedQuery);
            onSubmit?.(trimmedQuery);
        }
    }, [query, addToSearchHistory, onSubmit]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') {
            setIsSuggestionsVisible(false);
            e.currentTarget.blur();
        }
    }, []);

    const handleFocus = useCallback(() => {
        if (query.trim() === '' && searchHistory.length > 0) {
            setSuggestions(searchHistory.map(item => ({type: 'history', text: item, icon: 'history'})));
            setIsSuggestionsVisible(true);
        } else if (suggestions.length > 0) {
            setIsSuggestionsVisible(true);
        }
    }, [query, searchHistory, suggestions.length]);

    const handleClear = useCallback(() => {
        setQuery('');
        setSuggestions([]);
        setIsSuggestionsVisible(false);
        if (searchHistory.length > 0) {
            setSuggestions(searchHistory.map(item => ({type: 'history', text: item, icon: 'history'})));
            setIsSuggestionsVisible(true);
        }
    }, [searchHistory]);

    const containerClasses = `${styles.form} ${isSuggestionsVisible ? styles.suggestionsOpen : ''}`;

    return (
        <div className={containerClasses} ref={searchWrapperRef}>
            <form className={styles.wrapper} onSubmit={handleSubmit} autoComplete="off">
                {onBack ? (
                    <button
                        type="button"
                        className={styles.iconWrapper}
                        onClick={onBack}
                        aria-label={t('sf_close_search')}
                    >
                        <ChevronLeft className={styles.searchIcon}/>
                    </button>
                ) : (
                    <button
                        type="submit"
                        className={styles.iconWrapper}
                        aria-label={t('sf_search')}
                        onClick={(e) => {
                            if (!query.trim()) e.preventDefault();
                        }}
                    >
                        <Search className={styles.searchIcon}/>
                    </button>
                )}

                <input
                    type="text"
                    className={styles.input}
                    placeholder={t('sf_search_placeholder')}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    aria-autocomplete="list"
                    aria-controls="search-suggestions-list"
                    aria-expanded={isSuggestionsVisible}
                />

                {query && (
                    <button
                        type="button"
                        className={styles.clearBtn}
                        onClick={handleClear}
                        aria-label={t('sf_clear_search_field')}
                    >
                        <X size={18}/>
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