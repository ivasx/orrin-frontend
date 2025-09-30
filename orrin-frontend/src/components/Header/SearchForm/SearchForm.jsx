import { useState } from "react";
import "./SearchForm.css";

export default function SearchForm({ initialQuery = "", onSubmit, onBack }) {
    const [query, setQuery] = useState(initialQuery);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSubmit) onSubmit(query);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSubmit(e);
        }
    };

    return (
        <div className="search-form">
            <div className="search-form__wrapper">
                {onBack && (
                    <button
                        type="button"
                        className="search-back-btn"
                        onClick={onBack}
                        aria-label="Закрити пошук"
                    >
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                    </button>
                )}

                <button
                    type="button"
                    className="search-icon-wrapper"
                    onClick={handleSubmit}
                    aria-label="Пошук"
                >
                    <svg className="search-icon" viewBox="0 0 24 24">
                        <path d="M21 21L16.5 16.5M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
                              fill="none" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                </button>

                <input
                    type="text"
                    className="search-input"
                    placeholder="Що хочете послухати?"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                />

                {query && (
                    <button
                        type="button"
                        className="search-clear-btn"
                        onClick={() => setQuery("")}
                        aria-label="Очистити поле"
                    >
                        ×
                    </button>
                )}
            </div>
        </div>
    );
}