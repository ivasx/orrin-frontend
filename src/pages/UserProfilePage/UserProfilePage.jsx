import { useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { FileText, Info, Users } from 'lucide-react';

import MusicSectionWrapper from '../../components/Shared/MusicSectionWrapper/MusicSectionWrapper.jsx';
import InfoSection from '../../components/Shared/InfoSection/InfoSection.jsx';
import { ProfileHero } from './components/ProfileHero/ProfileHero.jsx';
import { ProfileEditModal } from './components/ProfileEditModal/ProfileEditModal.jsx';
import { PostsTab, AboutTab, FollowersTab } from './tabs/index.js';

import { getUserProfile, toggleFollowUser } from '../../services/api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useUserProfileMutations } from '../../hooks/useUserProfileMutations.jsx';
import { logger } from '../../utils/logger';

import styles from './UserProfilePage.module.css';

export default function UserProfilePage() {
    const { t } = useTranslation();
    const { userId, username } = useParams();

    // routeParam може бути як username так і числовий id — підтримуємо обидва роути
    const routeParam = username || userId;

    const { user: currentUser, isLoggedIn } = useAuth();
    const [activeTab, setActiveTab]     = useState('posts');
    const [isEditOpen, setIsEditOpen]   = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    const { data: profileData, isLoading, isError } = useQuery({
        queryKey: ['userProfile', routeParam],
        queryFn:  () => getUserProfile(routeParam),
        enabled:  !!routeParam,
        retry:    1,
        onError:  (error) => logger.error(`Failed to fetch profile: ${error.message}`),
    });

    // Порівнюємо і username, і id/pk — бо хедер може навігувати за id
    const isOwnProfile = useMemo(() => {
        if (!currentUser || !profileData) return false;
        return (
            currentUser.username === profileData.username ||
            String(currentUser.id)  === String(profileData.id)  ||
            String(currentUser.id)  === String(profileData.pk)  ||
            String(currentUser.pk)  === String(profileData.id)  ||
            String(currentUser.pk)  === String(profileData.pk)
        );
    }, [currentUser, profileData]);

    const { updateMutation } = useUserProfileMutations(routeParam);

    const tabsConfig = useMemo(() => {
        if (!profileData) return [];
        const tabs = [
            { id: 'posts',     label: t('profile_tabs_posts'),     icon: FileText },
            { id: 'about',     label: t('profile_tabs_about'),     icon: Info },
        ];
        if (
            profileData.followers_count > 0 ||
            profileData.following_count > 0 ||
            isOwnProfile
        ) {
            tabs.push({ id: 'followers', label: t('profile_tabs_followers'), icon: Users });
        }
        return tabs;
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
                return <PostsTab username={profileData?.username} isOwnProfile={isOwnProfile} />;
            case 'about':
                return <AboutTab profile={profileData} />;
            case 'followers':
                return <FollowersTab username={profileData?.username} />;
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

    return (
        <div className={styles.page}>
            <ProfileHero
                profile={profileData}
                isOwnProfile={isOwnProfile}
                onEditClick={() => setIsEditOpen(true)}
                onFollow={handleFollow}
                followLoading={followLoading}
                isLoggedIn={isLoggedIn}
            />

            <nav className={styles.tabNav} aria-label={t('profile_nav_label')}>
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

            <MusicSectionWrapper spacing="default">
                <div className={styles.tabContent}>
                    {renderTab()}
                </div>
            </MusicSectionWrapper>

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