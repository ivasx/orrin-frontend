import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';

import MusicSectionWrapper from '../../components/Shared/MusicSectionWrapper/MusicSectionWrapper.jsx';
import InfoSection from '../../components/Shared/InfoSection/InfoSection.jsx';

import { ProfileHero } from './components/ProfileHero/ProfileHero.jsx';
import { ProfileTabsNav } from './components/ProfileTabsNav/ProfileTabsNav.jsx';
import { AboutTab, PostsTab, FriendsTab } from './tabs';

import { getUserProfileById } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { logger } from '../../utils/logger';

import styles from './UserProfilePage.module.css';

export default function UserProfilePage() {
    const { t } = useTranslation();
    const { userId } = useParams();
    const { user: currentUser } = useAuth();

    const [activeTab, setActiveTab] = useState('posts');

    const isOwnProfile = currentUser?.id?.toString() === userId;

    const { data: profileData, isLoading, isError } = useQuery({
        queryKey: ['userProfile', userId],
        queryFn: () => getUserProfileById(userId),
        enabled: !!userId,
        retry: 1,
        onError: (error) => logger.error(`Failed to fetch profile: ${error.message}`)
    });

    const tabsConfig = useMemo(() => {
        if (!profileData) return [];

        const config = [
            { id: 'posts', label: t('profile_tabs_posts', 'Posts') },
            { id: 'about', label: t('profile_tabs_about', 'About') },
        ];

        if (profileData.stats?.friendsCount > 0 || isOwnProfile) {
            config.push({ id: 'friends', label: t('profile_tabs_friends', 'Friends') });
        }

        return config;
    }, [profileData, isOwnProfile, t]);

    if (isLoading) {
        return (
            <MusicSectionWrapper spacing="top-only">
                <InfoSection title={t('state_loading', 'Loading...')} isLoading />
            </MusicSectionWrapper>
        );
    }

    if (isError || !profileData) {
        return (
            <MusicSectionWrapper spacing="top-only">
                <InfoSection title={t('state_error', 'Error')} message={t('profile_not_found', 'Profile not found')} />
            </MusicSectionWrapper>
        );
    }

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'posts':
                return <PostsTab userId={userId} isOwnProfile={isOwnProfile} />;
            case 'about':
                return <AboutTab profile={profileData} />;
            case 'friends':
                return <FriendsTab userId={userId} isOwnProfile={isOwnProfile} />;
            default:
                return null;
        }
    };

    return (
        <MusicSectionWrapper spacing="none">
            <ProfileHero
                profile={profileData}
                isOwnProfile={isOwnProfile}
            />

            <ProfileTabsNav
                tabs={tabsConfig}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <MusicSectionWrapper spacing="default">
                <div className={styles.tabContentContainer}>
                    {renderActiveTab()}
                </div>
            </MusicSectionWrapper>
        </MusicSectionWrapper>
    );
}