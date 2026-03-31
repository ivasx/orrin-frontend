import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ListMusic, Disc3, Users } from 'lucide-react';

import MusicSectionWrapper from '../../components/Shared/MusicSectionWrapper/MusicSectionWrapper.jsx';
import TrackSection from '../../components/Shared/TrackSection/TrackSection.jsx';
import CreatePlaylistModal from '../../components/Shared/CreatePlaylistModal/CreatePlaylistModal.jsx';

import LikedSongsBanner from './components/LikedSongsBanner.jsx';
import GuestPrompt from './components/GuestPrompt.jsx';
import PlaylistsTab from './tabs/PlaylistsTab.jsx';
import AlbumsTab from './tabs/AlbumsTab.jsx';
import ArtistsTab from './tabs/ArtistsTab.jsx';

import { useAuth } from '../../context/AuthContext.jsx';
import { getLikedSongs } from '../../services/api/index.js';

import styles from './LibraryPage.module.css';

const TABS = [
    { id: 'playlists', labelKey: 'tab_playlists', icon: ListMusic },
    { id: 'albums',    labelKey: 'tab_albums',    icon: Disc3 },
    { id: 'artists',   labelKey: 'tab_artists',   icon: Users },
];

export default function LibraryPage() {
    const { t } = useTranslation();
    const { isLoggedIn } = useAuth();
    const [activeTab, setActiveTab] = useState('playlists');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const {
        data: likedTracks = [],
        isLoading: likedLoading,
    } = useQuery({
        queryKey: ['likedSongs'],
        queryFn: getLikedSongs,
        enabled: isLoggedIn,
        staleTime: 5 * 60 * 1000,
    });

    if (!isLoggedIn) {
        return (
            <MusicSectionWrapper spacing="default">
                <GuestPrompt />
            </MusicSectionWrapper>
        );
    }

    return (
        <MusicSectionWrapper spacing="top-only">
            <div className={styles.page}>
                <LikedSongsBanner tracks={likedTracks} isLoading={likedLoading} />

                {likedTracks.length > 0 && (
                    <div className={styles.likedTracksSection}>
                        <TrackSection
                            title={t('liked_songs')}
                            tracks={likedTracks}
                        />
                    </div>
                )}

                <nav className={styles.tabs} role="tablist" aria-label={t('library_sections')}>
                    {TABS.map(({ id, labelKey, icon: Icon }) => (
                        <button
                            key={id}
                            role="tab"
                            aria-selected={activeTab === id}
                            className={`${styles.tab} ${activeTab === id ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab(id)}
                        >
                            <Icon size={16} className={styles.tabIcon} />
                            {t(labelKey)}
                        </button>
                    ))}
                </nav>

                <div role="tabpanel">
                    {activeTab === 'playlists' && (
                        <PlaylistsTab onCreateClick={() => setShowCreateModal(true)} />
                    )}
                    {activeTab === 'albums' && <AlbumsTab />}
                    {activeTab === 'artists' && <ArtistsTab />}
                </div>
            </div>

            <CreatePlaylistModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
            />
        </MusicSectionWrapper>
    );
}