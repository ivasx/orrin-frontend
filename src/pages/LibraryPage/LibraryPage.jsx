import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import MusicSectionWrapper from '../../components/MusicSectionWrapper/MusicSectionWrapper.jsx';
import TrackSection from '../../components/TrackSection/TrackSection.jsx';
import LoginPromptSection from '../../components/LoginPromptSection/LoginPromptSection.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import EmptyStateSection from '../../components/EmptyStateSection/EmptyStateSection.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getUserLibrary } from '../../services/api.js';
import { logger } from '../../utils/logger.js';

export default function LibraryPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

    const {
        data: tracks = [],
        isLoading,
        isError,
        error
    } = useQuery({
        queryKey: ['library'],
        queryFn: getUserLibrary,
        enabled: isLoggedIn,
    });

    if (!isLoggedIn) {
        return (
            <MusicSectionWrapper spacing="top-only">
                <LoginPromptSection
                    title={t('your_library')}
                    promptText={t('to_start_using_the_library_log_in')}
                    buttonText={t('login')}
                    onLoginClick={() => navigate('/login')}
                />
            </MusicSectionWrapper>
        );
    }

    if (isLoading) {
        return (
            <MusicSectionWrapper spacing="top-only">
                <Spinner />
            </MusicSectionWrapper>
        );
    }

    if (isError) {
        logger.error("Library fetch error", error);
        return (
            <MusicSectionWrapper spacing="top-only">
                <div style={{ textAlign: 'center', color: 'red' }}>
                    {t('error_loading_library')}
                </div>
            </MusicSectionWrapper>
        );
    }

    return (
        <MusicSectionWrapper spacing="top-only">
            {tracks.length > 0 ? (
                <TrackSection
                    title={t('your_library')}
                    tracks={tracks}
                    onMoreClick={() => {
                        logger.log("Load more library tracks");
                    }}
                />
            ) : (
                <EmptyStateSection
                    title={t('library_empty_title')}
                    description={t('library_empty_message')}
                />
            )}
        </MusicSectionWrapper>
    );
}