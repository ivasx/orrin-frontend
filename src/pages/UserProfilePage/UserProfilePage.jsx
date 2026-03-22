import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';

import MusicSectionWrapper from '../../components/Shared/MusicSectionWrapper/MusicSectionWrapper.jsx';
import InfoSection from '../../components/Shared/InfoSection/InfoSection.jsx';

import { ProfileHero } from './components/ProfileHero/ProfileHero.jsx';
import { ProfileTabsNav } from './components/ProfileTabsNav/ProfileTabsNav.jsx';
import { AboutTab, PostsTab, FollowersTab } from './tabs';

import { getUserProfile } from '../../services/api/api.real.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { logger } from '../../utils/logger';

import styles from './UserProfilePage.module.css';

export default function UserProfilePage() {
    const { t } = useTranslation();
    const { userId, username } = useParams();
    const routeParam = username || userId;

    const { user: currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('posts');

    const isOwnProfile = currentUser?.username === routeParam;

    const { data: profileData, isLoading, isError } = useQuery({
        queryKey: ['userProfile', routeParam],
        queryFn: () => getUserProfile(routeParam),
        enabled: !!routeParam,
        retry: 1,
        onError: (error) => logger.error(`Failed to fetch profile: ${error.message}`)
    });

    const tabsConfig = useMemo(() => {
        if (!profileData) return [];

        const config = [
            { id: 'posts', label: t('profile_tabs_posts') },
            { id: 'about', label: t('profile_tabs_about') },
        ];

        if (profileData.followers_count > 0 || profileData.following_count > 0 || isOwnProfile) {
            config.push({ id: 'followers', label: t('profile_tabs_followers') });
        }

        return config;
    }, [profileData, isOwnProfile, t]);

    if (isLoading) {
        return (
            <MusicSectionWrapper spacing="top-only">
                <InfoSection title={t('state_loading')} isLoading />
            </MusicSectionWrapper>
        );
    }

    if (isError || !profileData) {
        return (
            <MusicSectionWrapper spacing="top-only">
                <InfoSection title={t('state_error')} message={t('profile_not_found')} />
            </MusicSectionWrapper>
        );
    }

    const renderActiveTab = () => {
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