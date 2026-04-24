import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './ArtistDashboardPage.module.css';
import VinylLoader from '../../components/UI/Spinner/VinylLoader';
import ManageProfileView from './views/ManageProfileView';
import UploadTrackView from './views/UploadTrackView';
import InlineError from '../../components/Shared/InlineError/InlineError';
import { useQuery } from '@tanstack/react-query';
import { getArtistById } from '../../services/api/index.js';
import { normalizeArtistData } from '../../constants/fallbacks.js';

const TABS = {
    MANAGE: 'manage',
    UPLOAD: 'upload',
};

function resolveActiveTab(pathname) {
    if (pathname.endsWith('/upload')) return TABS.UPLOAD;
    return TABS.MANAGE;
}

export default function ArtistDashboardPage() {
    const { artistSlug } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const activeTab = resolveActiveTab(location.pathname);

    const { data: rawArtistData, isLoading, isError } = useQuery({
        queryKey: ['artist', artistSlug],
        queryFn: () => getArtistById(artistSlug),
        enabled: !!artistSlug,
        staleTime: 1000 * 60 * 5,
    });

    const artistData = rawArtistData ? normalizeArtistData(rawArtistData) : null;

    const handleTabChange = (tab) => {
        navigate(`/artist/${artistSlug}/${tab}`, { replace: true });
    };

    if (isLoading) {
        return (
            <div className={styles.loaderContainer}>
                <VinylLoader />
            </div>
        );
    }

    if (isError || !artistData) {
        return (
            <div className={styles.errorContainer}>
                <InlineError message={t('artistDashboard.fetchError', 'Failed to load artist dashboard.')} />
                <button
                    className={styles.retryButton}
                    onClick={() => navigate(`/artist/${artistSlug}`)}
                >
                    {t('artistDashboard.backToProfile', 'Back to Profile')}
                </button>
            </div>
        );
    }

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.dashboardHeader}>
                <div>
                    <h1 className={styles.title}>{t('artistDashboard.title')}</h1>
                    <p className={styles.subtitle}>
                        {t('artistDashboard.managingProfileFor')}{' '}
                        <span className={styles.highlight}>{artistData.name}</span>
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <button
                        className={styles.viewPublicButton}
                        onClick={() => navigate(`/artist/${artistSlug}`)}
                    >
                        {t('artistDashboard.viewPublicPage')}
                    </button>
                </div>
            </header>

            <nav className={styles.dashboardNav}>
                <button
                    className={`${styles.navButton} ${activeTab === TABS.MANAGE ? styles.active : ''}`}
                    onClick={() => handleTabChange(TABS.MANAGE)}
                >
                    {t('artistDashboard.tabs.profileSettings')}
                </button>
                <button
                    className={`${styles.navButton} ${activeTab === TABS.UPLOAD ? styles.active : ''}`}
                    onClick={() => handleTabChange(TABS.UPLOAD)}
                >
                    {t('artistDashboard.tabs.uploadRelease')}
                </button>
            </nav>

            <main className={styles.dashboardContent}>
                {activeTab === TABS.MANAGE && (
                    <ManageProfileView artistData={artistData} artistSlug={artistSlug} />
                )}
                {activeTab === TABS.UPLOAD && (
                    <UploadTrackView artistSlug={artistSlug} />
                )}
            </main>
        </div>
    );
}