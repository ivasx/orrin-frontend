import { useState, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Play, Share2, Edit3, Check, X, Camera, Music2,
    Users, Disc3, FileText, MessageCircle, Loader2,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import MusicSectionWrapper from '../../components/Shared/MusicSectionWrapper/MusicSectionWrapper.jsx';
import TrackSection from '../../components/Shared/TrackSection/TrackSection.jsx';
import ArtistSection from '../../components/Shared/ArtistSection/ArtistSection.jsx';
import InfoSection from '../../components/Shared/InfoSection/InfoSection.jsx';
import FeedPost from '../../components/Shared/FeedPost/FeedPost.jsx';
import CreatePost from '../../components/Shared/CreatePost/CreatePost.jsx';
import DiscographyTab from './DiscographyTab/DiscographyTab.jsx';

import { useAudioCore } from '../../context/AudioCoreContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { usePermissions } from '../../hooks/usePermissions.jsx';
import { useArtistMutations } from '../../hooks/useArtistMutations.jsx';
import {
    getArtistById,
    getTracksByIds,
    getArtistPosts,
} from '../../services/api/index.js';
import { normalizeArtistData, normalizeTrackData } from '../../constants/fallbacks.js';
import { logger } from '../../utils/logger';

import styles from './ArtistPage.module.css';


/** Inline avatar/banner file-picker shown only in edit mode */
const EditableImage = ({ src, alt, className, onFileSelect, overlayLabel }) => {
    const inputRef = useRef(null);
    return (
        <div className={`${styles.editableImageWrapper} ${className}`}>
            <img src={src} alt={alt} className={styles.editableImageContent} />
            <button
                type="button"
                className={styles.editableImageOverlay}
                onClick={() => inputRef.current?.click()}
                aria-label={overlayLabel}
            >
                <Camera size={20} />
                <span>{overlayLabel}</span>
            </button>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className={styles.hiddenInput}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onFileSelect(file);
                    e.target.value = '';
                }}
            />
        </div>
    );
};

/** Renders a member card that links to their Orrin user profile */
const MemberCard = ({ member }) => (
    <Link
        to={`/user/${member.username || member.id}`}
        className={styles.memberCard}
        aria-label={`View ${member.name}'s profile`}
    >
        <img
            src={member.imageUrl || '/default-avatar.png'}
            alt={member.name}
            className={styles.memberAvatar}
        />
        <div className={styles.memberInfo}>
            <span className={styles.memberName}>{member.name}</span>
            {member.role && <span className={styles.memberRole}>{member.role}</span>}
        </div>
    </Link>
);

/** Posts tab content — shows artist's social posts + create button for managers */
const ArtistPostsTab = ({ artistSlug, canPost }) => {
    const { t } = useTranslation();
    const { data: posts, isLoading, isError } = useQuery({
        queryKey: ['artistPosts', artistSlug],
        queryFn: () => getArtistPosts(artistSlug),
        enabled: !!artistSlug,
    });

    if (isLoading) return <InfoSection isLoading />;
    if (isError) return <InfoSection message={t('error_loading_posts', 'Could not load posts.')} />;

    return (
        <div className={styles.postsTab}>
            {canPost && (
                <div className={styles.createPostWrapper}>
                    <CreatePost />
                </div>
            )}
            {posts?.length > 0 ? (
                posts.map((post) => <FeedPost key={post.id} post={post} />)
            ) : (
                <InfoSection message={t('no_artist_posts', 'No posts from this artist yet.')} />
            )}
        </div>
    );
};


const ArtistEditModal = ({ artist, onClose, onSave, isSaving }) => {
    const { t } = useTranslation();
    const [name, setName] = useState(artist.name || '');
    const [bio, setBio] = useState(artist.description || '');
    const [avatarFile, setAvatarFile] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(artist.imageUrl || '');
    const [bannerPreview, setBannerPreview] = useState(artist.imageUrl || '');

    const handleFileChange = (file, setFile, setPreview) => {
        setFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name.trim());
        formData.append('description', bio.trim());
        if (avatarFile) formData.append('image', avatarFile);
        if (bannerFile) formData.append('banner', bannerFile);
        onSave(formData);
    };

    return (
        <div
            className={styles.modalOverlay}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className={styles.editModal}>
                <div className={styles.editModalHeader}>
                    <h2>{t('edit_artist_profile', 'Edit Artist Profile')}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className={styles.editModalClose}
                        aria-label={t('close')}
                    >
                        <X size={20} />
                    </button>
                </div>

                <form className={styles.editModalBody} onSubmit={handleSubmit}>
                    {/* Banner image picker */}
                    <div className={styles.editFormGroup}>
                        <label className={styles.editFormLabel}>
                            {t('artist_banner_image', 'Banner Image')}
                        </label>
                        <div className={styles.bannerEditWrapper}>
                            <img
                                src={bannerPreview}
                                alt="Banner preview"
                                className={styles.bannerEditPreview}
                            />
                            <label className={styles.filePickerBtn}>
                                <Camera size={16} />
                                {t('change_banner', 'Change Banner')}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className={styles.hiddenInput}
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) handleFileChange(f, setBannerFile, setBannerPreview);
                                        e.target.value = '';
                                    }}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Avatar image picker */}
                    <div className={styles.editFormGroup}>
                        <label className={styles.editFormLabel}>
                            {t('artist_avatar', 'Artist Photo')}
                        </label>
                        <div className={styles.avatarEditRow}>
                            <img
                                src={avatarPreview}
                                alt="Avatar preview"
                                className={styles.avatarEditPreview}
                            />
                            <label className={styles.filePickerBtn}>
                                <Camera size={16} />
                                {t('change_photo', 'Change Photo')}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className={styles.hiddenInput}
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) handleFileChange(f, setAvatarFile, setAvatarPreview);
                                        e.target.value = '';
                                    }}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Artist name */}
                    <div className={styles.editFormGroup}>
                        <label htmlFor="artist-name" className={styles.editFormLabel}>
                            {t('artist_name', 'Artist Name')}
                        </label>
                        <input
                            id="artist-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={styles.editFormInput}
                            required
                            disabled={isSaving}
                        />
                    </div>

                    {/* Bio */}
                    <div className={styles.editFormGroup}>
                        <label htmlFor="artist-bio" className={styles.editFormLabel}>
                            {t('artist_bio', 'Biography')}
                        </label>
                        <textarea
                            id="artist-bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className={styles.editFormTextarea}
                            rows={5}
                            disabled={isSaving}
                        />
                    </div>

                    <div className={styles.editModalActions}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={styles.cancelBtn}
                            disabled={isSaving}
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            className={styles.saveBtn}
                            disabled={isSaving || !name.trim()}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 size={16} className={styles.spinIcon} />
                                    {t('saving', 'Saving...')}
                                </>
                            ) : (
                                <>
                                    <Check size={16} />
                                    {t('save_changes', 'Save Changes')}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


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

    const artist = rawArtistData ? normalizeArtistData(rawArtistData) : null;
    const canManage = isArtistManager(artistSlug);

    const { updateProfileMutation } = useArtistMutations(artistSlug);

    const tabs = useMemo(() => {
        if (!artist) return [];
        const result = [
            { id: 'songs',       label: t('tab_songs', 'Songs'),       icon: Music2 },
            { id: 'discography', label: t('tab_discography', 'Discography'), icon: Disc3 },
            { id: 'posts',       label: t('tab_posts', 'Posts'),        icon: FileText },
        ];
        if (artist.type === 'group' && artist.members?.length > 0) {
            result.push({ id: 'members', label: t('tab_band_members', 'Band Members'), icon: Users });
        }
        return result;
    }, [artist, t]);

    const handlePlayArtist = useCallback(async () => {
        if (!artist?.popularTracks?.length) return;
        const firstTrack = artist.popularTracks[0];
        playTrack(firstTrack, artist.popularTracks);
        navigate(`/track/${firstTrack.trackId}`);
    }, [artist, playTrack, navigate]);

    const handlePlayAlbum = useCallback(async (album) => {
        if (!album.trackIds?.length) {
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
    }, [playTrack, navigate]);

    const handleShare = useCallback(async () => {
        const url = window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({ title: artist?.name, url });
            } else {
                await navigator.clipboard.writeText(url);
            }
        } catch (err) {
            if (err.name !== 'AbortError') logger.error('Share failed:', err);
        }
    }, [artist]);

    const handleFollow = useCallback(async () => {
        if (!isLoggedIn) return;
        setFollowLoading(true);
        await new Promise((r) => setTimeout(r, 400)); // Simulate network
        setIsFollowing((prev) => !prev);
        setFollowLoading(false);
    }, [isLoggedIn]);

    const handleSaveProfile = useCallback((formData) => {
        updateProfileMutation.mutate(formData, {
            onSuccess: () => setIsEditModalOpen(false),
        });
    }, [updateProfileMutation]);

    if (isLoading) return (
        <MusicSectionWrapper spacing="top-only">
            <InfoSection title={t('loading')} isLoading />
        </MusicSectionWrapper>
    );
    if (isError || !artist) return (
        <MusicSectionWrapper spacing="top-only">
            <InfoSection title={t('error')} message={t('artist_not_found')} />
        </MusicSectionWrapper>
    );

    return (
        <div className={styles.page}>
            {/* ── Hero ────────────────────────────────────────────────────── */}
            <div
                className={styles.hero}
                style={{ '--hero-bg': `url(${artist.imageUrl})` }}
            >
                <div className={styles.heroNoise} />
                <div className={styles.heroOverlay} />

                <div className={styles.heroContent}>
                    <div className={styles.heroAvatarBlock}>
                        <img
                            src={artist.imageUrl}
                            alt={artist.name}
                            className={styles.heroAvatar}
                        />
                        {artist.type === 'group' && (
                            <span className={styles.heroBadge}>
                                <Users size={12} /> {t('artist_badge_group', 'Group')}
                            </span>
                        )}
                    </div>

                    <div className={styles.heroMeta}>
                        {artist.listenersMonthly > 0 && (
                            <p className={styles.heroListeners}>
                                {artist.listenersMonthly.toLocaleString()}{' '}
                                {t('artist_monthly_listeners', 'monthly listeners')}
                            </p>
                        )}
                        <h1 className={styles.heroName}>{artist.name}</h1>

                        <div className={styles.heroActions}>
                            <button
                                className={styles.playBtn}
                                onClick={handlePlayArtist}
                                aria-label={t('artist_play_all', 'Play all')}
                            >
                                <Play size={20} fill="currentColor" />
                                {t('artist_listen', 'Listen')}
                            </button>

                            <button
                                className={`${styles.followBtn} ${isFollowing ? styles.followBtnActive : ''}`}
                                onClick={handleFollow}
                                disabled={followLoading || !isLoggedIn}
                                aria-pressed={isFollowing}
                            >
                                {followLoading
                                    ? <Loader2 size={16} className={styles.spinIcon} />
                                    : isFollowing
                                        ? t('artist_following', 'Following')
                                        : t('artist_follow', 'Follow')
                                }
                            </button>

                            <button
                                className={styles.iconActionBtn}
                                onClick={handleShare}
                                aria-label={t('share')}
                            >
                                <Share2 size={18} />
                            </button>

                            {/* Edit button — only for managers */}
                            {canManage && (
                                <button
                                    className={styles.editProfileBtn}
                                    onClick={() => setIsEditModalOpen(true)}
                                    aria-label={t('edit_artist_profile', 'Edit Artist Profile')}
                                >
                                    <Edit3 size={16} />
                                    {t('edit_profile', 'Edit Profile')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <nav className={styles.tabNav}>
                {tabs.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        className={`${styles.tabBtn} ${activeTab === id ? styles.tabBtnActive : ''}`}
                        onClick={() => setActiveTab(id)}
                        aria-selected={activeTab === id}
                        role="tab"
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
                            {artist.popularTracks?.length > 0 ? (
                                <TrackSection
                                    title={t('artist_popular_tracks', 'Popular Tracks')}
                                    tracks={artist.popularTracks}
                                />
                            ) : (
                                <InfoSection message={t('no_tracks', 'No tracks available yet.')} />
                            )}

                            {/* Bio snippet on songs tab */}
                            {artist.description && (
                                <div className={styles.bioBanner}>
                                    <div className={styles.bioBannerInner}>
                                        <MessageCircle size={18} className={styles.bioBannerIcon} />
                                        <p className={styles.bioBannerText}>{artist.description}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'discography' && (
                        <DiscographyTab
                            albums={artist.discography || []}
                            onPlayAlbum={handlePlayAlbum}
                        />
                    )}

                    {activeTab === 'posts' && (
                        <ArtistPostsTab
                            artistSlug={artistSlug}
                            canPost={canManage}
                        />
                    )}

                    {activeTab === 'members' && artist.members?.length > 0 && (
                        <div className={styles.membersGrid}>
                            {artist.members.map((member) => (
                                <MemberCard key={member.id} member={member} />
                            ))}
                        </div>
                    )}
                </div>
            </MusicSectionWrapper>

            {artist.similarArtists?.length > 0 && (
                <MusicSectionWrapper spacing="default">
                    <ArtistSection
                        title={t('artist_similar', 'Fans also like')}
                        artists={artist.similarArtists}
                    />
                </MusicSectionWrapper>
            )}

            {isEditModalOpen && canManage && (
                <ArtistEditModal
                    artist={artist}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleSaveProfile}
                    isSaving={updateProfileMutation.isPending}
                />
            )}
        </div>
    );
}