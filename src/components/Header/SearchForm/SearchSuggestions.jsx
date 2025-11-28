import React, {useState} from 'react';
import './SearchSuggestions.css';

export default function SearchSuggestions({suggestions, isLoading, onSuggestionClick, onRemoveFromHistory}) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    if (isLoading) {
        return (
            <div className="search-suggestions-container loading">
                <div className="suggestion-item">Завантаження...</div>
            </div>
        );
    }

    if (suggestions.length === 0) {
        return null;
    }

    const renderIcon = (suggestion) => {
        if (suggestion.icon === 'history') {
            return (
                <svg className="suggestion-svg-icon" viewBox="0 0 24 24" width="18" height="18">
                    <path
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            );
        } else {
            return (
                <svg className="suggestion-svg-icon" viewBox="0 0 24 24" width="18" height="18">
                    <path
                        d="M21 21L16.5 16.5M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    />
                </svg>
            );
        }
    };

    return (
        <div className="search-suggestions-container">
            <ul id="search-suggestions-list" className="search-suggestions-list" role="listbox">
                {suggestions.map((suggestion, index) => (
                    <li
                        key={index}
                        className="suggestion-item"
                        role="option"
                        aria-selected="false"
                        onClick={() => onSuggestionClick(suggestion)}
                        onMouseDown={(e) => e.preventDefault()}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <span className="suggestion-icon">
                            {renderIcon(suggestion)}
                        </span>
                        <span className="suggestion-text">{suggestion.text}</span>

                        {suggestion.icon === 'history' && hoveredIndex === index && (
                            <button
                                className="suggestion-remove-btn"
                                onClick={(e) => onRemoveFromHistory(suggestion, e)}
                                onMouseDown={(e) => e.preventDefault()}
                                aria-label="Видалити з історії"
                            >
                                <svg viewBox="0 0 24 24" width="16" height="16">
                                    <path
                                        d="M18 6L6 18M6 6l12 12"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}