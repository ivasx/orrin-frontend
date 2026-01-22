import React, {useState} from 'react';
import { useTranslation } from "react-i18next";
import { Clock, Search, X } from 'lucide-react';
import styles from './SearchSuggestions.module.css';

export default function SearchSuggestions({suggestions, isLoading, onSuggestionClick, onRemoveFromHistory}) {
    const { t } = useTranslation();

    const [hoveredIndex, setHoveredIndex] = useState(null);

    if (isLoading) {
        return (
            <div className={`${styles.container} ${styles.loading}`}>
                <div className={styles.item}>{t('loading')}...</div>
            </div>
        );
    }

    if (suggestions.length === 0) {
        return null;
    }

    const renderIcon = (suggestion) => {
        if (suggestion.icon === 'history') {
            return <Clock size={18} className={styles.svgIcon} />;
        } else {
            return <Search size={18} className={styles.svgIcon} />;
        }
    };

    return (
        <div className={styles.container}>
            <ul className={styles.list}>
                {suggestions.map((suggestion, index) => (
                    <li
                        key={index}
                        className={styles.item}
                        onClick={() => onSuggestionClick(suggestion)}
                        onMouseDown={(e) => e.preventDefault()}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <span className={styles.icon}>
                            {renderIcon(suggestion)}
                        </span>
                        <span className={styles.text}>{suggestion.text}</span>

                        {suggestion.icon === 'history' && hoveredIndex === index && (
                            <button
                                className={styles.removeBtn}
                                onClick={(e) => onRemoveFromHistory(suggestion, e)}
                                onMouseDown={(e) => e.preventDefault()}
                                aria-label={t('sf_remove_from_history')}
                            >
                                <X size={16} />
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}