import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react';

import { getTrackBySlug } from '../../services/api/index.js';
import { normalizeTrackData } from '../../constants/fallbacks.js';
import { useAudioCore } from '../../context/AudioCoreContext.jsx';

import MusicLyrics from '../../components/Shared/MusicLyrics/MusicLyrics.jsx';
import QueueList    from '../../components/Shared/QueueList/QueueList.jsx';
import InlineError  from '../../components/Shared/InlineError/InlineError.jsx';
import CommentsTab  from './tabs/CommentsTab/CommentsTab.jsx';
import NotesTab     from './tabs/NotesTab/NotesTab.jsx';

import {
    MOCK_COMMENTS,
    NOTES_RECOMMENDED,
    NOTES_FROM_FRIENDS,
    NOTES_OWN,
} from '../../data/mockData.js';
import styles from './TrackPage.module.css';

// Tab Navigation

/**
 * @param {Object}    props
 * @param {Array}     props.tabs
 * @param {string}    props.activeTab
 * @param {Function}  props.onTabChange
 * @param {string}    [props.className]
 */
function TabNav({ tabs, activeTab, onTabChange, className = '' }) {
    return (
        <nav
            className={`${styles.tabNav} ${className}`}
            aria-label="Track content navigation"
            role="tablist"
        >
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabButtonActive : ''}`}
                    onClick={() => onTabChange(tab.id)}
                    aria-selected={activeTab === tab.id}
                    role="tab"
                    type="button"
                >
                    {tab.label}
                    {tab.count !== undefined && (
                        <span className={styles.tabCount}>{tab.count}</span>
                    )}
                </button>
            ))}
        </nav>
    );
}

// History Placeholder

function HistoryPanel() {
    const { t } = useTranslation();
    return (
        <div className={styles.placeholderPanel}>
            <Clock size={40} className={styles.placeholderIcon} aria-hidden="true" />
            <p className={styles.placeholderTitle}>{t('history_placeholder_title')}</p>
            <p className={styles.placeholderSubtitle}>{t('history_placeholder_subtitle')}</p>
        </div>
    );
}

// Tab config

const PRIMARY_TAB_CONFIG = [
    { id: 'lyrics',   translationKey: 'tabs_lyrics' },
    { id: 'comments', translationKey: 'tabs_comments', hasCount: true },
    { id: 'history',  translationKey: 'tabs_history' },
    { id: 'notes',    translationKey: 'tabs_notes' },
    { id: 'queue',    translationKey: 'tabs_queue' },
];

/** Pre-grouped notes by sub-tab id — passed as initial state to NotesTab. */
const INITIAL_NOTES = {
    recommended: NOTES_RECOMMENDED,
    friends:     NOTES_FROM_FRIENDS,
    own:         NOTES_OWN,
};


export default function TrackPage() {
    const { trackId } = useParams();
    const { t } = useTranslation();
    const { seek, playTrack, currentTrack, audioRef } = useAudioCore();

    const [activeTab, setActiveTab] = useState('lyrics');

    const { data: rawTrack, isLoading, isError, error } = useQuery({
        queryKey: ['track', trackId],
        queryFn:  () => getTrackBySlug(trackId),
        enabled:  !!trackId,
    });

    const track = rawTrack ? normalizeTrackData(rawTrack) : null;

    const [currentTime, setCurrentTime] = useState(0);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const onTimeUpdate = () => setCurrentTime(audio.currentTime);
        audio.addEventListener('timeupdate', onTimeUpdate);
        return () => audio.removeEventListener('timeupdate', onTimeUpdate);
    }, [audioRef]);

    const handleLineClick = useCallback((time) => {
        if (!track) return;
        if (currentTrack?.trackId !== track.trackId) {
            playTrack(track);
            const audio = audioRef.current;
            const doSeek = () => seek(time);
            if (audio && audio.readyState >= 1) {
                doSeek();
            } else {
                audio?.addEventListener('loadedmetadata', doSeek, { once: true });
            }
        } else {
            seek(time);
        }
    }, [seek, playTrack, track, currentTrack, audioRef]);

    const primaryTabs = useMemo(() => PRIMARY_TAB_CONFIG.map(tab => ({
        id:    tab.id,
        label: t(tab.translationKey),
        ...(tab.hasCount ? { count: MOCK_COMMENTS.length } : {}),
    })), [t]);

    if (isLoading) {
        return (
            <div className={styles.page}>
                <div className={styles.loadingState}>{t('loading')}</div>
            </div>
        );
    }

    if (isError || !track) {
        return (
            <div className={styles.page}>
                <InlineError
                    error={error}
                    title={t('error_loading_track')}
                    defaultMessage={t('track_not_found')}
                />
            </div>
        );
    }

    const isThisTrackActive = currentTrack?.trackId === track.trackId;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'lyrics':
                return (
                    <MusicLyrics
                        lyricsData={track.lyrics}
                        currentTime={isThisTrackActive ? currentTime : 0}
                        onLineClick={handleLineClick}
                    />
                );
            case 'comments':
                return <CommentsTab initialComments={MOCK_COMMENTS} />;
            case 'history':
                return <HistoryPanel />;
            case 'notes':
                return <NotesTab initialNotes={INITIAL_NOTES} />;
            case 'queue':
                return <QueueList />;
            default:
                return null;
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.contentWrapper}>
                <aside className={styles.infoSide}>
                    <div className={styles.coverContainer}>
                        <img
                            src={track.cover}
                            alt={track.title}
                            className={styles.cover}
                        />
                    </div>

                    <div className={styles.metadata}>
                        <h1 className={styles.title}>{track.title}</h1>

                        <div className={styles.artistRow}>
                            {track.artistSlug ? (
                                <Link to={`/artist/${track.artistSlug}`}>{track.artist}</Link>
                            ) : (
                                <span>{track.artist}</span>
                            )}
                        </div>

                        <div className={styles.metaExtra}>
                            <span>{track.durationFormatted || track.duration_formatted}</span>
                        </div>
                    </div>
                </aside>

                <section className={styles.contentSide}>
                    <TabNav
                        tabs={primaryTabs}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />

                    <div className={styles.tabContent}>
                        {renderTabContent()}
                    </div>
                </section>
            </div>
        </div>
    );
}