import {useState, useCallback, useMemo} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {FileText, Info, Users} from 'lucide-react';

import MusicSectionWrapper from '../../components/Shared/MusicSectionWrapper/MusicSectionWrapper.jsx';
import InfoSection from '../../components/Shared/InfoSection/InfoSection.jsx';
import TabNav from '../../components/Shared/TabNav/TabNav.jsx';
import {ProfileHero} from './components/ProfileHero/ProfileHero.jsx';
import {ProfileEditModal} from './components/ProfileEditModal/ProfileEditModal.jsx';
import {PostsTab, AboutTab, FollowersTab} from './tabs/index.js';

import {getUserProfile, toggleFollowUser, getUserChats, fetchJson} from '../../services/api/index.js';
import {useAuth} from '../../context/AuthContext.jsx';
import {useUserProfileMutations} from '../../hooks/useUserProfileMutations.jsx';
import {useToast} from '../../context/ToastContext.jsx';
import {logger} from '../../utils/logger';

import styles from './UserProfilePage.module.css';

export default function UserProfilePage() {
    const {t} = useTranslation();
    const {userId, username} = useParams();
    const routeParam = username || userId;
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const {showToast} = useToast();

    const {user: currentUser, isLoggedIn} = useAuth();
    const [activeTab, setActiveTab] = useState('posts');
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [messageLoading, setMessageLoading] = useState(false);

    const {data: profileData, isLoading, isError} = useQuery({
        queryKey: ['userProfile', routeParam],
        queryFn: () => getUserProfile(routeParam),
        enabled: !!routeParam,
        retry: 1,
    });

    const isOwnProfile = useMemo(() => {
        if (!currentUser || !profileData) return false;
        return (
            currentUser.username === profileData.username ||
            String(currentUser.id) === String(profileData.id) ||
            String(currentUser.id) === String(profileData.pk) ||
            String(currentUser.pk) === String(profileData.id) ||
            String(currentUser.pk) === String(profileData.pk)
        );
    }, [currentUser, profileData]);

    const {updateMutation} = useUserProfileMutations(routeParam);

    const tabs = useMemo(() => {
        if (!profileData) return [];
        const list = [
            {id: 'posts', label: t('profile_tabs_posts'), icon: FileText},
            {id: 'about', label: t('profile_tabs_about'), icon: Info},
        ];
        if (profileData.followers_count > 0 || profileData.following_count > 0 || isOwnProfile) {
            list.push({id: 'followers', label: t('profile_tabs_followers'), icon: Users});
        }
        return list;
    }, [profileData, isOwnProfile, t]);

    const handleSaveProfile = useCallback((formData) => {
        updateMutation.mutate(formData, {
            onSuccess: () => setIsEditOpen(false),
        });
    }, [updateMutation]);

    const handleFollow = useCallback(async () => {
        if (!isLoggedIn || isOwnProfile || !profileData) return;
        setFollowLoading(true);
        try {
            await toggleFollowUser(profileData.username);
            queryClient.setQueryData(['userProfile', routeParam], (old) => {
                if (!old) return old;
                const wasFollowing = old.is_following;
                return {
                    ...old,
                    is_following: !wasFollowing,
                    followers_count: wasFollowing
                        ? Math.max(0, (old.followers_count ?? 1) - 1)
                        : (old.followers_count ?? 0) + 1,
                };
            });
        } catch (err) {
            logger.error('Follow failed:', err);
            showToast(t('error_generic'), 'error');
        } finally {
            setFollowLoading(false);
        }
    }, [isLoggedIn, isOwnProfile, profileData, queryClient, routeParam, showToast, t]);

    const handleMessage = useCallback(async () => {
        if (!isLoggedIn || !profileData) return;
        setMessageLoading(true);
        try {
            const isMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';
            let chat;

            if (isMock) {
                const chats = await getUserChats();
                chat = chats[0];
            } else {
                chat = await fetchJson('/api/v1/chats/', {
                    method: 'POST',
                    body: JSON.stringify({recipient_username: profileData.username}),
                });
            }

            if (chat?.id) {
                queryClient.invalidateQueries({queryKey: ['userChats']});
                navigate(`/messages/${chat.id}`);
            }
        } catch (err) {
            logger.error('Create chat failed:', err);
            showToast(t('error_generic'), 'error');
        } finally {
            setMessageLoading(false);
        }
    }, [isLoggedIn, profileData, navigate, queryClient, showToast, t]);

    const renderTab = () => {
        switch (activeTab) {
            case 'posts':
                return <PostsTab username={profileData?.username} isOwnProfile={isOwnProfile}/>;
            case 'about':
                return <AboutTab profile={profileData}/>;
            case 'followers':
                return <FollowersTab username={profileData?.username}/>;
            default:
                return null;
        }
    };

    if (isLoading) return (
        <MusicSectionWrapper spacing="top-only">
            <InfoSection title={t('state_loading')} isLoading/>
        </MusicSectionWrapper>
    );

    if (isError || !profileData) return (
        <MusicSectionWrapper spacing="top-only">
            <InfoSection title={t('state_error')} message={t('profile_not_found')}/>
        </MusicSectionWrapper>
    );

    return (
        <div className={styles.page}>
            <ProfileHero
                profile={profileData}
                isOwnProfile={isOwnProfile}
                onEditClick={() => setIsEditOpen(true)}
                onFollow={handleFollow}
                onMessage={handleMessage}
                followLoading={followLoading}
                messageLoading={messageLoading}
                isLoggedIn={isLoggedIn}
            />

            <TabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}/>

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