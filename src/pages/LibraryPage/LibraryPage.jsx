import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';

import MusicSectionWrapper from '../../components/Shared/MusicSectionWrapper/MusicSectionWrapper.jsx';
import TrackSection from '../../components/Shared/TrackSection/TrackSection.jsx';
import InfoSection from '../../components/Shared/InfoSection/InfoSection.jsx';
import Button from '../../components/UI/Button/Button.jsx';
import Dropdown from '../../components/UI/Dropdown/Dropdown.jsx';
import Spinner from '../../components/UI/Spinner/Spinner.jsx';

import { useAuth } from '../../context/AuthContext.jsx';
import { logger } from '../../utils/logger.js';

// TODO: Move to src/services/api.js
// Mocked paginated API call for enterprise-level library fetching
const fetchUserLibraryPaginated = async ({ pageParam = 1, queryKey }) => {
    const [, { tab, sort }] = queryKey;
    logger.info(`Fetching library: tab=${tab}, sort=${sort}, page=${pageParam}`);

    // Simulating API delay and response structure
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                items: [], // In real app: array of tracks/playlists/artists based on 'tab'
                nextCursor: pageParam < 3 ? pageParam + 1 : null, // Limits to 3 pages for mock
                totalCount: 45
            });
        }, 600);
    });
};

// TODO: Connect to real Audio/Queue Context
const useLibraryPlayback = () => {
    const playAll = useCallback((items) => logger.info('Playing all items', items), []);
    const shufflePlay = useCallback((items) => logger.info('Shuffling items', items), []);
    return { playAll, shufflePlay };
};

const LIBRARY_TABS = ['tracks', 'playlists', 'artists', 'albums'];
const SORT_OPTIONS = ['recently_added', 'alphabetical', 'creator'];
const STALE_TIME_MS = 1000 * 60 * 5;

export default function LibraryPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();
    const { playAll, shufflePlay } = useLibraryPlayback();

    const [activeTab, setActiveTab] = useState(LIBRARY_TABS[0]);
    const [activeSort, setActiveSort] = useState(SORT_OPTIONS[0]);

    const queryKey = useMemo(() =>
            ['userLibrary', { tab: activeTab, sort: activeSort }],
        [activeTab, activeSort]);

    const {
        data,
        isLoading,
        isError,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch
    } = useInfiniteQuery({
        queryKey,
        queryFn: fetchUserLibraryPaginated,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: Boolean(isLoggedIn),
        staleTime: STALE_TIME_MS,
        retry: 2,
    });

    const allItems = useMemo(() => {
        return data?.pages.flatMap((page) => page.items) || [];
    }, [data]);

    const handleLoginRedirect = useCallback(() => navigate('/login'), [navigate]);
    const handleRetry = useCallback(() => refetch(), [refetch]);

    const handlePlayAll = useCallback(() => playAll(allItems), [playAll, allItems]);
    const handleShuffle = useCallback(() => shufflePlay(allItems), [shufflePlay, allItems]);

    const sortDropdownOptions = useMemo(() =>
            SORT_OPTIONS.map(sortKey => ({
                value: sortKey,
                label: t(`library.sort.${sortKey}`)
            })),
        [t]);

    const renderTabs = () => (
        <div className="library-tabs-navigation">
            {LIBRARY_TABS.map((tab) => (
                <Button
                    key={tab}
                    variant={activeTab === tab ? 'primary' : 'ghost'}
                    onClick={() => setActiveTab(tab)}
                    className="library-tab-button"
                >
                    {t(`library.tabs.${tab}`)}
                </Button>
            ))}
        </div>
    );

    const renderActionControls = () => {
        if (!allItems.length && !isLoading) return null;

        return (
            <div className="library-action-controls">
                <div className="library-playback-actions">
                    <Button onClick={handlePlayAll} variant="primary" icon="play">
                        {t('library.actions.play_all')}
                    </Button>
                    <Button onClick={handleShuffle} variant="secondary" icon="shuffle">
                        {t('library.actions.shuffle')}
                    </Button>
                </div>
                <div className="library-filters">
                    <Dropdown
                        options={sortDropdownOptions}
                        value={activeSort}
                        onChange={(val) => setActiveSort(val)}
                        placeholder={t('library.actions.sort_by')}
                    />
                </div>
            </div>
        );
    };

    const renderContent = () => {
        if (!isLoggedIn) {
            return (
                <InfoSection
                    title={t('library.title')}
                    message={t('library.auth_required_message')}
                    action={{
                        label: t('auth.login_action'),
                        onClick: handleLoginRedirect,
                        variant: 'primary'
                    }}
                />
            );
        }

        if (isLoading) {
            return <Spinner size="large" centered />;
        }

        if (isError) {
            return (
                <InfoSection
                    title={t('library.error.title')}
                    message={error?.message || t('common.error_occurred')}
                    action={{
                        label: t('common.retry_action'),
                        onClick: handleRetry,
                        variant: 'outline'
                    }}
                />
            );
        }

        if (!allItems.length) {
            return (
                <InfoSection
                    title={t('library.empty.title')}
                    message={t(`library.empty.${activeTab}_message`)}
                />
            );
        }

        return (
            <div className="library-content-list">
                {activeTab === 'tracks' && (
                    <TrackSection tracks={allItems} />
                )}
                {/* TODO: Add PlaylistSection, ArtistSection, AlbumSection components */}
                {activeTab !== 'tracks' && (
                    <InfoSection message={t('common.coming_soon')} />
                )}

                {hasNextPage && (
                    <div className="library-load-more">
                        <Button
                            variant="outline"
                            onClick={() => fetchNextPage()}
                            disabled={isFetchingNextPage}
                        >
                            {isFetchingNextPage ? t('common.loading') : t('common.load_more')}
                        </Button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <MusicSectionWrapper spacing="top-only" className="library-page-wrapper">
            <header className="library-page-header">
                <h1>{t('library.title')}</h1>
                {isLoggedIn && renderTabs()}
            </header>

            {isLoggedIn && renderActionControls()}

            <main className="library-page-main">
                {renderContent()}
            </main>
        </MusicSectionWrapper>
    );
}