import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Play, Share2, Edit3, Music2, Users, Disc3, FileText, Info,
    BookOpen, History, Loader2, LayoutDashboard,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import MusicSectionWrapper from '../../components/Shared/MusicSectionWrapper/MusicSectionWrapper.jsx';
import TrackSection from '../../components/Shared/TrackSection/TrackSection.jsx';
import ArtistSection from '../../components/Shared/ArtistSection/ArtistSection.jsx';
import InfoSection from '../../components/Shared/InfoSection/InfoSection.jsx';

import DiscographyTab from './tabs/DiscographyTab/DiscographyTab.jsx';
import AboutTab from './tabs/AboutTab/AboutTab.jsx';
import HistoryTab from './tabs/HistoryTab/HistoryTab.jsx';
import ArtistNotesTab from './tabs/ArtistNotesTab/ArtistNotesTab.jsx';
import ArtistPostsTab from './tabs/ArtistPostsTab/ArtistPostsTab.jsx';
import MemberCard from './components/MemberCard/MemberCard.jsx';
import ArtistEditModal from './components/ArtistEditModal/ArtistEditModal.jsx';

import { useAudioCore } from '../../context/AudioCoreContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { usePermissions } from '../../hooks/usePermissions.jsx';
import { useArtistMutations } from '../../hooks/useArtistMutations.jsx';
import { getArtistById, getTracksByIds } from '../../services/api/index.js';
import { normalizeArtistData, normalizeTrackData } from '../../constants/fallbacks.js';
import { logger } from '../../utils/logger';

import styles from './ArtistPage.module.css';

export default function ArtistPage() {
    const { t } = useTranslation();
    const { artistSlug } = useParams();
    const navigate = useNavigate();
    const { playTrack } = useAudioCore();
    const { isLoggedIn } = useAuth();
    const { isArtistManager } = usePermissions();

    const [activeTab, setActiveTab] = useState('songs');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    const { data: rawArtistData, isLoading, isError } = useQuery({
        queryKey: ['artist', artistSlug],
        queryFn: () => getArtistById(artistSlug),
        enabled: !!artistSlug,
    });

    const fullArtist = useMemo(() => {
        if (!rawArtistData) return null;
        const normalized = normalizeArtistData(rawArtistData);
        return {
            ...normalized,
            popularTracks: rawArtistData.popularTracks || [],
            notes: rawArtistData.notes || [],
            similarArtists: rawArtistData.similarArtists || [],
        };
    }, [rawArtistData]);

    const canManage = isArtistManager(artistSlug);
    const { updateProfileMutation } = useArtistMutations(artistSlug);

    const tabs = useMemo(() => {
        if (!fullArtist) return [];

        const list = [
            { id: 'songs', label: t('tab_songs'), icon: Music2 },
            { id: 'discography', label: t('tab_discography'), icon: Disc3 },
            { id: 'posts', label: t('tab_posts'), icon: FileText },
            { id: 'about', label: t('tab_about'), icon: Info },
            { id: 'notes', label: t('tab_notes'), icon: BookOpen },
        ];

        if (fullArtist.history) {
            list.push({ id: 'history', label: t('tab_history'), icon: History });
        }

        if (fullArtist.type === 'group' && fullArtist.members?.length > 0) {
            list.push({ id: 'members', label: t('tab_band_members'), icon: Users });
        }

        return list;
    }, [fullArtist, t]);

    const handlePlayArtist = useCallback(async () => {
        if (!fullArtist?.popularTracks?.length) return;
        const firstTrack = fullArtist.popularTracks[0];
        playTrack(firstTrack, fullArtist.popularTracks);
        navigate(`/track/${firstTrack.trackId}`);
    }, [fullArtist, playTrack, navigate]);

    const handlePlayAlbum = useCallback(async (album) => {
        if (!album.trackIds?.length) {
            logger.warn(`Album "${album.title}" has no tracks.`);
            return;
        }
        try {
            const rawTracks = await getTracksByIds(album.trackIds);
            const albumTracks = rawTracks.map(normalizeTrackData).filter(Boolean);
            if (albumTracks.length > 0) {
                playTrack(albumTracks[0], albumTracks);
                navigate(`/track/${albumTracks[0].trackId}`);
            }
        } catch (error) {
            logger.error(`Error fetching album tracks: ${error.message}`);
        }
    }, [playTrack, navigate]);

    const handleShare = useCallback(async () => {
        const url = window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({ title: fullArtist?.name, url });
            } else {
                await navigator.clipboard.writeText(url);
            }
        } catch (err) {
            if (err.name !== 'AbortError') logger.error('Share failed:', err);
        }
    }, [fullArtist]);

    const handleFollow = useCallback(async () => {
        if (!isLoggedIn) return;
        setFollowLoading(true);
        await new Promise((r) => setTimeout(r, 400));
        setIsFollowing((prev) => !prev);
        setFollowLoading(false);
    }, [isLoggedIn]);

    const handleSaveProfile = useCallback((formData) => {
        updateProfileMutation.mutate(formData, {
            onSuccess: () => setIsEditModalOpen(false),
        });
    }, [updateProfileMutation]);

    const handleOpenDashboard = useCallback(() => {
        navigate(`/artist/${artistSlug}/manage`);
    }, [navigate, artistSlug]);

    if (isLoading) return (
        <MusicSectionWrapper spacing="top-only">
            <InfoSection title={t('loading')} isLoading />
        </MusicSectionWrapper>
    );

    if (isError || !fullArtist) return (
        <MusicSectionWrapper spacing="top-only">
            <InfoSection title={t('error')} message={t('artist_not_found')} />
        </MusicSectionWrapper>
    );

    return (
        <div className={styles.page}>
            <div
                className={styles.hero}
                style={{ '--hero-bg': `url(${fullArtist.imageUrl})` }}
            >
                <div className={styles.heroNoise} />
                <div className={styles.heroOverlay} />

                <div className={styles.heroContent}>
                    <div className={styles.heroAvatarBlock}>
                        <img
                            src={fullArtist.imageUrl}
                            alt={fullArtist.name}
                            className={styles.heroAvatar}
                        />
                        {fullArtist.type === 'group' && (
                            <span className={styles.heroBadge}>
                                <Users size={12} /> {t('artist_badge_group')}
                            </span>
                        )}
                    </div>

                    <div className={styles.heroMeta}>
                        {fullArtist.listenersMonthly > 0 && (
                            <p className={styles.heroListeners}>
                                {fullArtist.listenersMonthly.toLocaleString()} {t('artist_monthly_listeners')}
                            </p>
                        )}
                        <h1 className={styles.heroName}>{fullArtist.name}</h1>

                        <div className={styles.heroActions}>
                            <button
                                className={styles.playBtn}
                                onClick={handlePlayArtist}
                                aria-label={t('artist_play_all')}
                            >
                                <Play size={20} fill="currentColor" />
                                {t('artist_listen')}
                            </button>

                            <button
                                className={`${styles.followBtn} ${isFollowing ? styles.followBtnActive : ''}`}
                                onClick={handleFollow}
                                disabled={followLoading || !isLoggedIn}
                                aria-pressed={isFollowing}
                            >
                                {followLoading
                                    ? <Loader2 size={16} className={styles.spinIcon} />
                                    : isFollowing ? t('artist_following') : t('artist_follow')
                                }
                            </button>

                            <button
                                className={styles.iconActionBtn}
                                onClick={handleShare}
                                aria-label={t('share')}
                            >
                                <Share2 size={18} />
                            </button>

                            {canManage && (
                                <>
                                    <button
                                        className={styles.editProfileBtn}
                                        onClick={() => setIsEditModalOpen(true)}
                                        aria-label={t('edit_artist_profile')}
                                    >
                                        <Edit3 size={16} />
                                        {t('edit_profile')}
                                    </button>

                                    <button
                                        className={styles.dashboardBtn}
                                        onClick={handleOpenDashboard}
                                        aria-label={t('artist_dashboard')}
                                    >
                                        <LayoutDashboard size={16} />
                                        {t('artist_dashboard')}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <nav className={styles.tabNav} role="tablist">
                {tabs.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        role="tab"
                        aria-selected={activeTab === id}
                        className={`${styles.tabBtn} ${activeTab === id ? styles.tabBtnActive : ''}`}
                        onClick={() => setActiveTab(id)}
                    >
                        <Icon size={15} />
                        {label}
                    </button>
                ))}
            </nav>

            <MusicSectionWrapper spacing="default">
                <div className={styles.tabContent}>
                    {activeTab === 'songs' && (
                        <div className={styles.songsTab}>
                            {fullArtist.popularTracks?.length > 0 ? (
                                <TrackSection
                                    title={t('artist_popular_tracks')}
                                    tracks={fullArtist.popularTracks}
                                />
                            ) : (
                                <InfoSection message={t('no_tracks')} />
                            )}

                            {fullArtist.description && (
                                <div className={styles.bioBanner}>
                                    <div className={styles.bioBannerInner}>
                                        <Info size={18} className={styles.bioBannerIcon} />
                                        <p className={styles.bioBannerText}>{fullArtist.description}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'discography' && (
                        <DiscographyTab
                            albums={fullArtist.discography || []}
                            onPlayAlbum={handlePlayAlbum}
                        />
                    )}

                    {activeTab === 'posts' && (
                        <ArtistPostsTab
                            artistSlug={artistSlug}
                            canPost={canManage}
                        />
                    )}

                    {activeTab === 'about' && (
                        <AboutTab artist={fullArtist} />
                    )}

                    {activeTab === 'notes' && (
                        <ArtistNotesTab
                            initialNotes={fullArtist.notes || []}
                            popularTracks={fullArtist.popularTracks || []}
                        />
                    )}

                    {activeTab === 'history' && fullArtist.history && (
                        <HistoryTab artist={fullArtist} />
                    )}

                    {activeTab === 'members' && fullArtist.members?.length > 0 && (
                        <div className={styles.membersGrid}>
                            {fullArtist.members.map((member) => (
                                <MemberCard key={member.id} member={member} />
                            ))}
                        </div>
                    )}
                </div>
            </MusicSectionWrapper>

            {fullArtist.similarArtists?.length > 0 && (
                <MusicSectionWrapper spacing="default">
                    <ArtistSection
                        title={t('artist_similar')}
                        artists={fullArtist.similarArtists}
                    />
                </MusicSectionWrapper>
            )}

            {isEditModalOpen && canManage && (
                <ArtistEditModal
                    artist={fullArtist}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleSaveProfile}
                    isSaving={updateProfileMutation.isPending}
                />
            )}
        </div>
    );
}