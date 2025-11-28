import { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, X, Check, Music, Users, Sparkles } from 'lucide-react';
import Dropdown from '../Dropdown/Dropdown';
import './FeedFilters.css';

export default function FeedFilters({ activeTab, onTabChange, filters, onFiltersChange }) {
    const { t } = useTranslation();
    const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);
    const [tempFilters, setTempFilters] = useState(filters);
    const dropdownRef = useRef(null);

    const dropdownItems = useMemo(() => [
        {
            value: 'recommended',
            label: t('feed_recommended', 'Рекомендації'),
            icon: <Sparkles size={16} />
        },
        {
            value: 'following',
            label: t('feed_following', 'Відстежуються'),
            icon: <Users size={16} />
        },
        {
            value: 'artists',
            label: t('feed_artists', 'Від музикантів'),
            icon: <Music size={16} />
        },
        {
            value: 'users',
            label: t('feed_users', 'Від користувачів'),
            icon: <Users size={16} />
        },
    ], [t]);

    const contentTypes = [
        { id: 'with_music', label: t('filter_with_music', 'З музикою') },
        { id: 'text_only', label: t('filter_text_only', 'Тільки текст') },
    ];

    const sortOptions = [
        { id: 'newest', label: t('filter_newest', 'Спочатку нові') },
        { id: 'popular', label: t('filter_popular', 'Популярні') },
        { id: 'discussed', label: t('filter_discussed', 'Обговорювані') },
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowFiltersDropdown(false);
            }
        };

        if (showFiltersDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showFiltersDropdown]);

    const handleFilterToggle = (category, value) => {
        setTempFilters(prev => ({
            ...prev,
            [category]: prev[category] === value ? null : value
        }));
    };

    const handleApplyFilters = () => {
        onFiltersChange(tempFilters);
        setShowFiltersDropdown(false);
    };

    const handleClearFilters = () => {
        const clearedFilters = {
            contentType: null,
            sort: 'newest'
        };
        setTempFilters(clearedFilters);
        onFiltersChange(clearedFilters);
        setShowFiltersDropdown(false);
    };

    const activeFiltersCount = Object.values(filters).filter(v => v && v !== 'newest').length;

    return (
        <div className="feed-filters">
            <div className="feed-filters-wrapper">
                <div className="feed-additional-filters">
                    <div style={{ position: 'relative' }} ref={dropdownRef}>
                        <button
                            className={`filter-button ${activeFiltersCount > 0 ? 'active' : ''}`}
                            onClick={() => setShowFiltersDropdown(!showFiltersDropdown)}
                        >
                            <Filter size={16} />
                            {t('filters', 'Фільтри')}
                            {activeFiltersCount > 0 && (
                                <span className="filter-badge">{activeFiltersCount}</span>
                            )}
                        </button>

                        {showFiltersDropdown && (
                            <div className="filters-dropdown">
                                <div className="filters-dropdown-header">
                                    <h3 className="filters-dropdown-title">
                                        {t('filters', 'Фільтри')}
                                    </h3>
                                    <button
                                        className="filters-close-button"
                                        onClick={() => setShowFiltersDropdown(false)}
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Тип контенту */}
                                <div className="filters-dropdown-section">
                                    <h4 className="filters-section-title">
                                        {t('filter_content_type', 'Тип контенту')}
                                    </h4>
                                    <div className="filters-options">
                                        {contentTypes.map(type => (
                                            <div
                                                key={type.id}
                                                className={`filter-option ${tempFilters.contentType === type.id ? 'selected' : ''}`}
                                                onClick={() => handleFilterToggle('contentType', type.id)}
                                            >
                                                <div className="filter-checkbox">
                                                    {tempFilters.contentType === type.id && (
                                                        <Check size={14} />
                                                    )}
                                                </div>
                                                <span className="filter-label">{type.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Сортування */}
                                <div className="filters-dropdown-section">
                                    <h4 className="filters-section-title">
                                        {t('filter_sort', 'Сортування')}
                                    </h4>
                                    <div className="filters-options">
                                        {sortOptions.map(option => (
                                            <div
                                                key={option.id}
                                                className={`filter-option ${tempFilters.sort === option.id ? 'selected' : ''}`}
                                                onClick={() => handleFilterToggle('sort', option.id)}
                                            >
                                                <div className="filter-checkbox">
                                                    {tempFilters.sort === option.id && (
                                                        <Check size={14} />
                                                    )}
                                                </div>
                                                <span className="filter-label">{option.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="filters-dropdown-actions">
                                    <button
                                        className="filters-clear-button"
                                        onClick={handleClearFilters}
                                    >
                                        {t('clear_all', 'Очистити все')}
                                    </button>
                                    <button
                                        className="filters-apply-button"
                                        onClick={handleApplyFilters}
                                    >
                                        {t('apply', 'Застосувати')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <Dropdown
                    items={dropdownItems}
                    selectedValue={activeTab}
                    onSelect={onTabChange}
                    placeholder={t('select_feed', 'Оберіть стрічку')}
                />
            </div>
        </div>
    );
}