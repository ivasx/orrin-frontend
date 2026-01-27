import { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, X, Check, Music, Users, Sparkles } from 'lucide-react';
import Dropdown from '../../../components/UI/Dropdown/Dropdown.jsx';
import styles from './FeedFilters.module.css';

export default function FeedFilters({ activeTab, onTabChange, filters, onFiltersChange }) {
    const { t } = useTranslation();
    const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);
    const [tempFilters, setTempFilters] = useState(filters);
    const dropdownRef = useRef(null);

    // Using useMemo to prevent unnecessary re-creations
    const dropdownItems = useMemo(() => [
        {
            value: 'recommended',
            label: t('feed_recommended'),
            icon: <Sparkles size={16} />
        },
        {
            value: 'following',
            label: t('feed_following'),
            icon: <Users size={16} />
        },
        {
            value: 'artists',
            label: t('feed_artists'),
            icon: <Music size={16} />
        },
        {
            value: 'users',
            label: t('feed_users'),
            icon: <Users size={16} />
        },
    ], [t]);

    const contentTypes = useMemo(() => [
        { id: 'with_music', label: t('filter_with_music') },
        { id: 'text_only', label: t('filter_text_only') },
    ], [t]);

    const sortOptions = useMemo(() => [
        { id: 'newest', label: t('filter_newest') },
        { id: 'popular', label: t('filter_popular') },
        { id: 'discussed', label: t('filter_discussed') },
    ], [t]);

    // Close dropdown when clicking outside
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
        <div className={styles.container}>
            <div className={styles.wrapper}>
                <div className={styles.additionalFilters}>
                    <div className={styles.dropdown} ref={dropdownRef}>
                        <button
                            className={`${styles.filterButton} ${activeFiltersCount > 0 ? styles.filterButtonActive : ''}`}
                            onClick={() => setShowFiltersDropdown(!showFiltersDropdown)}
                            aria-label={t('filters', 'Filters')}
                        >
                            <Filter size={16} />
                            {t('filters', 'Filters')}
                            {activeFiltersCount > 0 && (
                                <span className={styles.filterBadge}>{activeFiltersCount}</span>
                            )}
                        </button>

                        {showFiltersDropdown && (
                            <div className={styles.dropdownMenu}>
                                <div className={styles.dropdownHeader}>
                                    <h3 className={styles.dropdownTitle}>
                                        {t('filters')}
                                    </h3>
                                    <button
                                        className={styles.closeButton}
                                        onClick={() => setShowFiltersDropdown(false)}
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className={styles.section}>
                                    <h4 className={styles.sectionTitle}>
                                        {t('filter_content_type')}
                                    </h4>
                                    <div className={styles.optionsList}>
                                        {contentTypes.map(type => (
                                            <div
                                                key={type.id}
                                                className={`${styles.option} ${tempFilters.contentType === type.id ? styles.optionSelected : ''}`}
                                                onClick={() => handleFilterToggle('contentType', type.id)}
                                            >
                                                <div className={styles.checkbox}>
                                                    {tempFilters.contentType === type.id && (
                                                        <Check size={14} />
                                                    )}
                                                </div>
                                                <span className={styles.label}>{type.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.section}>
                                    <h4 className={styles.sectionTitle}>
                                        {t('filter_sort')}
                                    </h4>
                                    <div className={styles.optionsList}>
                                        {sortOptions.map(option => (
                                            <div
                                                key={option.id}
                                                className={`${styles.option} ${tempFilters.sort === option.id ? styles.optionSelected : ''}`}
                                                onClick={() => handleFilterToggle('sort', option.id)}
                                            >
                                                <div className={styles.checkbox}>
                                                    {tempFilters.sort === option.id && (
                                                        <Check size={14} />
                                                    )}
                                                </div>
                                                <span className={styles.label}>{option.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.actions}>
                                    <button
                                        className={styles.clearButton}
                                        onClick={handleClearFilters}
                                    >
                                        {t('clear_all')}
                                    </button>
                                    <button
                                        className={styles.applyButton}
                                        onClick={handleApplyFilters}
                                    >
                                        {t('apply')}
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
                    placeholder={t('select_feed')}
                />
            </div>
        </div>
    );
}