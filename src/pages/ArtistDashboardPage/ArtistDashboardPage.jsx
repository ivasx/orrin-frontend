import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './ArtistDashboardPage.module.css';
import VinylLoader from '../../components/UI/Spinner/VinylLoader';
import ManageProfileView from './views/ManageProfileView';
import UploadTrackView from './views/UploadTrackView';
import InlineError from '../../components/Shared/InlineError/InlineError';

export default function ArtistDashboardPage() {
    const { artistSlug } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [artistData, setArtistData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    const activeTab = location.pathname.includes('/upload') ? 'upload' : 'manage';

    useEffect(() => {
        const fetchArtistDetails = async () => {
            setIsLoading(true);
            setFetchError(null);
            try {
                const response = await fetch(`/api/artists/${artistSlug}/`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to load artist dashboard data.');
                }

                const data = await response.json();
                setArtistData(data);
            } catch (error) {
                setFetchError(error.message || 'An unexpected error occurred.');
            } finally {
                setIsLoading(false);
            }
        };

        if (artistSlug) {
            fetchArtistDetails();
        }
    }, [artistSlug]);

    const handleTabChange = (tab) => {
        navigate(`/artist/${artistSlug}/${tab}`);
    };

    if (isLoading) {
        return (
            <div className={styles.loaderContainer}>
                <VinylLoader />
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className={styles.errorContainer}>
                <InlineError message={fetchError} />
                <button
                    className={styles.retryButton}
                    onClick={() => window.location.reload()}
                >
                    Try Again
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
                        {t('artistDashboard.managingProfileFor')} <span className={styles.highlight}>{artistData?.name || 'Artist'}</span>
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
                    className={`${styles.navButton} ${activeTab === 'manage' ? styles.active : ''}`}
                    onClick={() => handleTabChange('manage')}
                >
                    {t('artistDashboard.tabs.profileSettings')}
                </button>
                <button
                    className={`${styles.navButton} ${activeTab === 'upload' ? styles.active : ''}`}
                    onClick={() => handleTabChange('upload')}
                >
                    {t('artistDashboard.tabs.uploadRelease')}
                </button>
            </nav>

            <main className={styles.dashboardContent}>
                {activeTab === 'manage' && <ManageProfileView artistData={artistData} />}
                {activeTab === 'upload' && <UploadTrackView artistSlug={artistSlug} />}
            </main>
        </div>
    );
}