import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaShareAlt, FaPen } from 'react-icons/fa';
import { Play } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import MusicSectionWrapper from '../../components/Shared/MusicSectionWrapper/MusicSectionWrapper.jsx';
import TrackSection from '../../components/Shared/TrackSection/TrackSection.jsx';
import ArtistSection from '../../components/Shared/ArtistSection/ArtistSection.jsx';
import InfoSection from '../../components/Shared/InfoSection/InfoSection.jsx';

import AboutTab from './AboutTab/AboutTab.jsx';
import HistoryTab from './HistoryTab/HistoryTab.jsx';
import MembersTab from './MembersTab/MembersTab.jsx';
import DiscographyTab from './DiscographyTab/DiscographyTab.jsx';
import ArtistNotesTab from './ArtistNotesTab/ArtistNotesTab.jsx';

import { useAudioCore } from '../../context/AudioCoreContext.jsx';
import { getArtistById, getTracksByIds } from '../../services/api.js';
import { normalizeArtistData, normalizeTrackData } from '../../constants/fallbacks.js';
import { logger } from '../../utils/logger';

import styles from './ArtistPage.module.css';

export default function ArtistPage() {
    const { t } = useTranslation();
    const { artistId } = useParams();
    const [activeTab, setActiveTab] = useState('about');
    const { playTrack } = useAudioCore();
    const navigate = useNavigate();

    const { data: rawArtistData, isLoading, isError } = useQuery({
        queryKey: ['artist', artistId],
        queryFn: () => getArtistById(artistId),
        enabled: !!artistId,
    });

    const artist = rawArtistData ? normalizeArtistData(rawArtistData) : null;

    const tabs = useMemo(() => {
        if (!artist) return [];
        const TABS = [{ id: 'about', label: t('artist_about', 'Про артиста') }];

        if (artist.history) TABS.push({ id: 'history', label: t('artist_history', 'Історія') });
        if (artist.type === 'group' && artist.members?.length > 0) {
            TABS.push({ id: 'members', label: t('artist_members', 'Склад гурту') });
        }
        if (artist.discography?.length > 0) {
            TABS.push({ id: 'discography', label: t('artist_discography', 'Дискографія') });
        }
        TABS.push({ id: 'notes', label: t('artist_notes', 'Нотатки') });

        return TABS;
    }, [artist, t]);

    const handlePlayAlbum = async (album) => {
        if (!album.trackIds || album.trackIds.length === 0) {
            logger.warn(`Album "${album.title}" has no tracks.`);
            return;
        }
        try {
            const rawTracks = await getTracksByIds(album.trackIds);
            const albumTracks = rawTracks.map(normalizeTrackData).filter(Boolean);

            if (albumTracks.length > 0) {
                const firstTrack = albumTracks[0];
                playTrack(firstTrack, albumTracks);
                navigate(`/track/${firstTrack.trackId}`);
            }
        } catch (error) {
            logger.error(`Error fetching album tracks: ${error.message}`);
        }
    };

    if (isLoading) return <MusicSectionWrapper spacing="top-only"><InfoSection title={t('loading')} isLoading /></MusicSectionWrapper>;
    if (isError) return <MusicSectionWrapper spacing="top-only"><InfoSection title={t('error')} message={t('artist_not_found')} /></MusicSectionWrapper>;
    if (!artist) return <MusicSectionWrapper spacing="top-only"><InfoSection title={t('artist_not_found')} /></MusicSectionWrapper>;

    return (
        <MusicSectionWrapper spacing="none">
            {/* Hero Section */}
            <div className={styles.hero} style={{ backgroundImage: `url(${artist.imageUrl})` }}>
                <div className={styles.overlay}></div>
                <div className={styles.heroContent}>
                    <img src={artist.imageUrl} alt={artist.name} className={styles.avatar} />
                    <div className={styles.heroInfo}>
                        <h1 className={styles.name}>{artist.name}</h1>
                        {artist.listenersMonthly > 0 && (
                            <p className={styles.listeners}>
                                {artist.listenersMonthly.toLocaleString()} {t('artist_listeners')}
                            </p>
                        )}
                        <div className={styles.actions}>
                            <button className={styles.playButton}>
                                <Play size={20} fill="currentColor" /> {t('artist_listen')}
                            </button>
                            <button className={styles.outlineButton}>{t('artist_follow')}</button>
                            <button className={styles.iconButton} aria-label={t('artist_share')}><FaShareAlt size={20} /></button>
                            <button className={styles.iconButton} aria-label={t('artist_add_note')}><FaPen size={20} /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className={styles.tabsNav}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            {/* Content Area */}
            <MusicSectionWrapper spacing="default">
                <div className={styles.tabContent}>
                    {activeTab === 'about' && <AboutTab artist={artist} />}
                    {activeTab === 'history' && <HistoryTab artist={artist} />}
                    {activeTab === 'members' && <MembersTab members={artist.members} />}
                    {activeTab === 'discography' && <DiscographyTab albums={artist.discography} onPlayAlbum={handlePlayAlbum} />}
                    {activeTab === 'notes' && <ArtistNotesTab initialNotes={artist.notes || []} popularTracks={artist.popularTracks || []} />}
                </div>
            </MusicSectionWrapper>

            {/* Additional Sections */}
            {artist.popularTracks?.length > 0 && (
                <MusicSectionWrapper spacing="default">
                    <TrackSection title={t('artist_popular_tracks')} tracks={artist.popularTracks} />
                </MusicSectionWrapper>
            )}

            {artist.similarArtists?.length > 0 && (
                <MusicSectionWrapper spacing="default">
                    <ArtistSection title={t('artist_similar')} artists={artist.similarArtists} />
                </MusicSectionWrapper>
            )}
        </MusicSectionWrapper>
    );
}