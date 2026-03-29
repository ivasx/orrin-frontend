import { useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
    FileText, Info, Users, Music2, Edit3,
    X, Check, Camera, Loader2, MapPin, Globe, Calendar,
} from 'lucide-react';
import { FaUserPlus, FaUserCheck } from 'react-icons/fa';

import MusicSectionWrapper from '../../components/Shared/MusicSectionWrapper/MusicSectionWrapper.jsx';
import InfoSection from '../../components/Shared/InfoSection/InfoSection.jsx';
import FeedPost from '../../components/Shared/FeedPost/FeedPost.jsx';
import CreatePost from '../../components/Shared/CreatePost/CreatePost.jsx';
import TrackSection from '../../components/Shared/TrackSection/TrackSection.jsx';

import { getUserProfile, getUserPosts, getUserFollowers, toggleFollowUser } from '../../services/api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useUserProfileMutations } from '../../hooks/useUserProfileMutations.jsx';
import { logger } from '../../utils/logger';

import styles from './UserProfilePage.module.css';

// ─── Profile Edit Modal ────────────────────────────────────────────────────────

const ProfileEditModal = ({ profile, onClose, onSave, isSaving }) => {
    const { t } = useTranslation();
    const [firstName, setFirstName] = useState(profile.first_name || '');
    const [lastName, setLastName]   = useState(profile.last_name  || '');
    const [bio, setBio]             = useState(profile.bio        || '');
    const [location, setLocation]   = useState(profile.location   || '');
    const [website, setWebsite]     = useState(profile.website    || '');
    const [avatarFile, setAvatarFile]   = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(profile.avatar || '/default-avatar.png');

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setAvatarPreview(reader.result);
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('first_name', firstName.trim());
        formData.append('last_name',  lastName.trim());
        formData.append('bio',        bio.trim());
        formData.append('location',   location.trim());
        formData.append('website',    website.trim());
        if (avatarFile) formData.append('avatar', avatarFile);
        onSave(formData);
    };

    return (
        <div
            className={styles.modalOverlay}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className={styles.editModal}>
                <div className={styles.editModalHeader}>
                    <h2>{t('edit_profile', 'Edit Profile')}</h2>
                    <button
                        type="button"
                        className={styles.editModalClose}
                        onClick={onClose}
                        aria-label={t('close')}
                    >
                        <X size={20} />
                    </button>
                </div>

                <form className={styles.editModalBody} onSubmit={handleSubmit}>
                    {/* Avatar */}
                    <div className={styles.editAvatarRow}>
                        <img src={avatarPreview} alt="Preview" className={styles.editAvatarPreview} />
                        <label className={styles.filePickerBtn}>
                            <Camera size={15} />
                            {t('change_avatar', 'Change Avatar')}
                            <input
                                type="file"
                                accept="image/*"
                                className={styles.hiddenInput}
                                onChange={handleAvatarChange}
                            />
                        </label>
                    </div>

                    {/* Name row */}
                    <div className={styles.editRow}>
                        <div className={styles.editFormGroup}>
                            <label htmlFor="first-name" className={styles.editFormLabel}>
                                {t('first_name_label', 'First Name')}
                            </label>
                            <input
                                id="first-name"
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className={styles.editFormInput}
                                disabled={isSaving}
                            />
                        </div>
                        <div className={styles.editFormGroup}>
                            <label htmlFor="last-name" className={styles.editFormLabel}>
                                {t('last_name_label', 'Last Name')}
                            </label>
                            <input
                                id="last-name"
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className={styles.editFormInput}
                                disabled={isSaving}
                            />
                        </div>
                    </div>

                    {/* Bio */}
                    <div className={styles.editFormGroup}>
                        <label htmlFor="bio" className={styles.editFormLabel}>
                            {t('profile_bio_title', 'Bio')}
                        </label>
                        <textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className={styles.editFormTextarea}
                            rows={4}
                            placeholder={t('bio_placeholder', 'Tell your story...')}
                            disabled={isSaving}
                        />
                    </div>

                    {/* Location */}
                    <div className={styles.editFormGroup}>
                        <label htmlFor="location" className={styles.editFormLabel}>
                            {t('profile_location_title', 'Location')}
                        </label>
                        <input
                            id="location"
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className={styles.editFormInput}
                            placeholder={t('location_placeholder', 'City, Country')}
                            disabled={isSaving}
                        />
                    </div>

                    {/* Website */}
                    <div className={styles.editFormGroup}>
                        <label htmlFor="website" className={styles.editFormLabel}>
                            {t('profile_website_title', 'Website')}
                        </label>
                        <input
                            id="website"
                            type="url"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            className={styles.editFormInput}
                            placeholder="https://"
                            disabled={isSaving}
                        />
                    </div>

                    <div className={styles.editModalActions}>
                        <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={onClose}
                            disabled={isSaving}
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            className={styles.saveBtn}
                            disabled={isSaving}
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

// ─── About Tab ─────────────────────────────────────────────────────────────────

const AboutTab = ({ profile }) => {
    const { t } = useTranslation();
    const hasContent = profile.bio || profile.location || profile.website;

    if (!hasContent) {
        return <InfoSection message={t('profile_no_about_info', 'No details provided yet.')} />;
    }

    return (
        <div className={styles.aboutTab}>
            {profile.bio && (
                <div className={styles.aboutSection}>
                    <h3 className={styles.aboutTitle}>{t('profile_bio_title', 'Biography')}</h3>
                    <p className={styles.aboutText}>{profile.bio}</p>
                </div>
            )}
            <div className={styles.aboutMeta}>
                {profile.location && (
                    <div className={styles.aboutMetaItem}>
                        <MapPin size={16} className={styles.aboutMetaIcon} />
                        <span>{profile.location}</span>
                    </div>
                )}
                {profile.website && (
                    <div className={styles.aboutMetaItem}>
                        <Globe size={16} className={styles.aboutMetaIcon} />
                        <a
                            href={profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.aboutLink}
                        >
                            {profile.website.replace(/^https?:\/\//, '')}
                        </a>
                    </div>
                )}
                {profile.date_joined && (
                    <div className={styles.aboutMetaItem}>
                        <Calendar size={16} className={styles.aboutMetaIcon} />
                        <span>
                            {t('joined_date', 'Joined')} {new Date(profile.date_joined).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Posts Tab ─────────────────────────────────────────────────────────────────

const PostsTab = ({ username, isOwnProfile }) => {
    const { t } = useTranslation();
    const { data: posts, isLoading, isError } = useQuery({
        queryKey: ['userPosts', username],
        queryFn: () => getUserPosts(username),
        enabled: !!username,
    });

    if (isLoading) return <InfoSection isLoading />;
    if (isError) return <InfoSection message={t('profile_error_posts', 'Could not load posts.')} />;

    return (
        <div className={styles.postsTab}>
            {isOwnProfile && <CreatePost />}
            {posts?.length > 0
                ? posts.map((post) => <FeedPost key={post.id} post={post} />)
                : <InfoSection message={t('profile_no_posts', 'No posts yet.')} />
            }
        </div>
    );
};

// ─── Followers Tab ─────────────────────────────────────────────────────────────

const FollowersTab = ({ username }) => {
    const { t } = useTranslation();
    const { data: followers, isLoading, isError } = useQuery({
        queryKey: ['userFollowers', username],
        queryFn: () => getUserFollowers(username),
        enabled: !!username,
    });

    if (isLoading) return <InfoSection isLoading />;
    if (isError) return <InfoSection message={t('profile_error_followers', 'Could not load followers.')} />;

    if (!followers?.length) {
        return <InfoSection message={t('profile_no_followers', 'No followers yet.')} />;
    }

    return (
        <div className={styles.followersGrid}>
            {followers.map((user) => (
                <a
                    key={user.id}
                    href={`/user/${user.username || user.id}`}
                    className={styles.followerCard}
                >
                    <img
                        src={user.avatar || '/default-avatar.png'}
                        alt={user.username}
                        className={styles.followerAvatar}
                    />
                    <div className={styles.followerInfo}>
                        <span className={styles.followerName}>
                            {user.first_name || user.username}
                        </span>
                        {user.first_name && (
                            <span className={styles.followerHandle}>@{user.username}</span>
                        )}
                    </div>
                </a>
            ))}
        </div>
    );
};

// ─── Main Page ──────────────────────────────────────────────────────────────────

export default function UserProfilePage() {
    const { t } = useTranslation();
    const { userId, username } = useParams();
    const routeParam = username || userId;

    const { user: currentUser, isLoggedIn } = useAuth();
    const [activeTab, setActiveTab]   = useState('posts');
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    const isOwnProfile = currentUser?.username === routeParam;

    const { data: profileData, isLoading, isError } = useQuery({
        queryKey: ['userProfile', routeParam],
        queryFn: () => getUserProfile(routeParam),
        enabled: !!routeParam,
        retry: 1,
        onError: (error) => logger.error(`Failed to fetch profile: ${error.message}`),
    });

    const { updateMutation } = useUserProfileMutations(routeParam);

    const tabsConfig = useMemo(() => {
        if (!profileData) return [];
        const config = [
            { id: 'posts',     label: t('profile_tabs_posts',     'Posts'),     icon: FileText },
            { id: 'about',     label: t('profile_tabs_about',     'About'),     icon: Info },
        ];
        if (
            profileData.followers_count > 0 ||
            profileData.following_count > 0 ||
            isOwnProfile
        ) {
            config.push({ id: 'followers', label: t('profile_tabs_followers', 'Followers'), icon: Users });
        }
        return config;
    }, [profileData, isOwnProfile, t]);

    const handleSaveProfile = useCallback((formData) => {
        updateMutation.mutate(formData, {
            onSuccess: () => setIsEditOpen(false),
        });
    }, [updateMutation]);

    const handleFollow = useCallback(async () => {
        if (!isLoggedIn || isOwnProfile) return;
        setFollowLoading(true);
        try {
            await toggleFollowUser(profileData?.username);
        } catch (err) {
            logger.error('Follow failed:', err);
        } finally {
            setFollowLoading(false);
        }
    }, [isLoggedIn, isOwnProfile, profileData]);

    const renderTab = () => {
        switch (activeTab) {
            case 'posts':
                return <PostsTab username={routeParam} isOwnProfile={isOwnProfile} />;
            case 'about':
                return <AboutTab profile={profileData} />;
            case 'followers':
                return <FollowersTab username={routeParam} />;
            default:
                return null;
        }
    };

    if (isLoading) return (
        <MusicSectionWrapper spacing="top-only">
            <InfoSection title={t('state_loading')} isLoading />
        </MusicSectionWrapper>
    );

    if (isError || !profileData) return (
        <MusicSectionWrapper spacing="top-only">
            <InfoSection title={t('state_error')} message={t('profile_not_found')} />
        </MusicSectionWrapper>
    );

    const displayName = [profileData.first_name, profileData.last_name].filter(Boolean).join(' ')
        || profileData.username;

    return (
        <div className={styles.page}>
            {/* ── Banner / Hero ──────────────────────────────────────── */}
            <div
                className={styles.hero}
                style={profileData.cover_photo
                    ? { backgroundImage: `url(${profileData.cover_photo})` }
                    : {}
                }
            >
                <div className={styles.heroOverlay} />

                <div className={styles.heroContent}>
                    <div className={styles.avatarBlock}>
                        <img
                            src={profileData.avatar || '/default-avatar.png'}
                            alt={displayName}
                            className={styles.avatar}
                        />
                        {profileData.is_verified && (
                            <span className={styles.verifiedBadge} title={t('verified')}>✓</span>
                        )}
                    </div>

                    <div className={styles.heroMeta}>
                        <h1 className={styles.displayName}>{displayName}</h1>
                        {profileData.first_name && (
                            <span className={styles.handle}>@{profileData.username}</span>
                        )}

                        {profileData.bio && (
                            <p className={styles.heroBio}>{profileData.bio}</p>
                        )}

                        <div className={styles.statsRow}>
                            <div className={styles.stat}>
                                <strong>{profileData.followers_count ?? 0}</strong>
                                <span>{t('profile_stats_followers', 'Followers')}</span>
                            </div>
                            <div className={styles.statDivider} />
                            <div className={styles.stat}>
                                <strong>{profileData.following_count ?? 0}</strong>
                                <span>{t('profile_stats_following', 'Following')}</span>
                            </div>
                        </div>

                        <div className={styles.heroActions}>
                            {isOwnProfile ? (
                                <button
                                    className={styles.editBtn}
                                    onClick={() => setIsEditOpen(true)}
                                >
                                    <Edit3 size={15} />
                                    {t('profile_action_edit', 'Edit Profile')}
                                </button>
                            ) : (
                                <button
                                    className={`${styles.followBtn} ${profileData.is_following ? styles.followBtnActive : ''}`}
                                    onClick={handleFollow}
                                    disabled={followLoading || !isLoggedIn}
                                >
                                    {followLoading ? (
                                        <Loader2 size={16} className={styles.spinIcon} />
                                    ) : profileData.is_following ? (
                                        <><FaUserCheck size={15} /> {t('profile_action_unfollow', 'Unfollow')}</>
                                    ) : (
                                        <><FaUserPlus size={15} /> {t('profile_action_follow', 'Follow')}</>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Tab Navigation ────────────────────────────────────── */}
            <nav className={styles.tabNav} aria-label="Profile navigation">
                {tabsConfig.map(({ id, label, icon: Icon }) => (
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

            {/* ── Tab Content ───────────────────────────────────────── */}
            <MusicSectionWrapper spacing="default">
                <div className={styles.tabContent}>
                    {renderTab()}
                </div>
            </MusicSectionWrapper>

            {/* ── Edit Modal ────────────────────────────────────────── */}
            {isEditOpen && isOwnProfile && (
                <ProfileEditModal
                    profile={profileData}
                    onClose={() => setIsEditOpen(false)}
                    onSave={handleSaveProfile}
                    isSaving={updateMutation.isPending}
                />
            )}
        </div>
    );
}