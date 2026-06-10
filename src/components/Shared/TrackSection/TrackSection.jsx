import {useState, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import TrackCard from '../TrackCard/TrackCard.jsx';
import SectionHeader from '../../UI/SectionHeader/SectionHeader.jsx';
import styles from './TrackSection.module.css';

const COLLAPSED_LIMIT = 4;

export default function TrackSection({
                                         title,
                                         tracks,
                                         onMoreClick,
                                         collapsible = false,
                                         onRemoveFromHistory,
                                     }) {
    const {t} = useTranslation();
    const validTracks = Array.isArray(tracks) ? tracks : [];
    const [isExpanded, setIsExpanded] = useState(false);

    const shouldCollapse = collapsible && validTracks.length > COLLAPSED_LIMIT;
    const visibleTracks = shouldCollapse && !isExpanded
        ? validTracks.slice(0, COLLAPSED_LIMIT)
        : validTracks;

    const internalMoreClick = shouldCollapse && !isExpanded
        ? () => setIsExpanded(true)
        : undefined;

    const resolvedMoreClick = onMoreClick ?? internalMoreClick;

    const handleCollapse = useCallback(() => setIsExpanded(false), []);

    return (
        <section className={styles.section}>
            <SectionHeader title={title} onMoreClick={resolvedMoreClick}/>

            <div className={styles.grid}>
                {visibleTracks.map((track) => (
                    <TrackCard
                        key={track.historyEntryId ?? track.trackId}
                        {...track}
                        tracks={validTracks}
                        onRemoveFromHistory={
                            onRemoveFromHistory ? () => onRemoveFromHistory(track) : undefined
                        }
                    />
                ))}
            </div>

            {shouldCollapse && isExpanded && (
                <button className={styles.collapseBtn} onClick={handleCollapse}>
                    {t('show_less')}
                </button>
            )}
        </section>
    );
}