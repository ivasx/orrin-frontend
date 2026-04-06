import { useState, useCallback } from 'react';
import './TrackSection.css';
import TrackCard from '../TrackCard/TrackCard.jsx';
import SectionHeader from '../../UI/SectionHeader/SectionHeader.jsx';
import { useTranslation } from 'react-i18next';

const COLLAPSED_LIMIT = 4;

/**
 * @param {Object}   props
 * @param {string}   props.title
 * @param {Array}    props.tracks
 * @param {Function} [props.onMoreClick]          - External "more" handler (navigates away).
 *                                                  When omitted and collapsible=true,
 *                                                  the section handles expansion internally.
 * @param {boolean}  [props.collapsible=false]    - Whether to limit visible tracks to
 *                                                  COLLAPSED_LIMIT and show an expand toggle.
 * @param {Function} [props.onRemoveFromHistory]  - When provided, passes a per-track removal
 *                                                  callback into each TrackCard context menu.
 *                                                  Called with the full track object.
 */
export default function TrackSection({
                                         title,
                                         tracks,
                                         onMoreClick,
                                         collapsible = false,
                                         onRemoveFromHistory,
                                     }) {
    const { t } = useTranslation();
    const validTracks = Array.isArray(tracks) ? tracks : [];

    const [isExpanded, setIsExpanded] = useState(false);

    const shouldCollapse = collapsible && validTracks.length > COLLAPSED_LIMIT;
    const visibleTracks  = shouldCollapse && !isExpanded
        ? validTracks.slice(0, COLLAPSED_LIMIT)
        : validTracks;

    const internalMoreClick = shouldCollapse && !isExpanded
        ? () => setIsExpanded(true)
        : undefined;

    const resolvedMoreClick = onMoreClick ?? internalMoreClick;

    const handleCollapse = useCallback(() => setIsExpanded(false), []);

    return (
        <section className="track-section">
            <SectionHeader
                title={title}
                onMoreClick={resolvedMoreClick}
            />

            <div className="track-section-grid">
                {visibleTracks.map((track) => (
                    <TrackCard
                        key={track.historyEntryId ?? track.trackId}
                        {...track}
                        tracks={validTracks}
                        onRemoveFromHistory={
                            onRemoveFromHistory
                                ? () => onRemoveFromHistory(track)
                                : undefined
                        }
                    />
                ))}
            </div>

            {shouldCollapse && isExpanded && (
                <button
                    className="track-section-collapse-btn"
                    onClick={handleCollapse}
                >
                    {t('show_less')}
                </button>
            )}
        </section>
    );
}