import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, Trash2, AlertTriangle } from 'lucide-react';
import MusicSectionWrapper from '../../components/Shared/MusicSectionWrapper/MusicSectionWrapper.jsx';
import TrackSection from '../../components/Shared/TrackSection/TrackSection.jsx';
import InfoSection from '../../components/Shared/InfoSection/InfoSection.jsx';
import Button from '../../components/UI/Button/Button.jsx';
import Spinner from '../../components/UI/Spinner/Spinner.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
    getListeningHistory,
    clearListeningHistory,
    removeTrackFromHistory,
} from '../../services/api/index.js';
import { logger } from '../../utils/logger.js';
import styles from './HistoryPage.module.css';

function groupHistoryByDate(tracks) {
    const now        = new Date();
    const today      = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday  = today - 86400000;
    const twoDaysAgo = today - 2 * 86400000;

    const groups = {};
    const order  = [];

    tracks.forEach((track) => {
        const playedAt = track.playedAt ? new Date(track.playedAt).getTime() : null;

        let labelKey;
        if (!playedAt) {
            labelKey = 'history_older';
        } else if (playedAt >= today) {
            labelKey = 'history_today';
        } else if (playedAt >= yesterday) {
            labelKey = 'history_yesterday';
        } else if (playedAt >= twoDaysAgo) {
            labelKey = 'history_two_days_ago';
        } else {
            labelKey = 'history_older';
        }

        if (!groups[labelKey]) {
            groups[labelKey] = [];
            order.push(labelKey);
        }
        groups[labelKey].push(track);
    });

    return order.map((labelKey) => ({ labelKey, tracks: groups[labelKey] }));
}

function ConfirmDialog({ isOpen, onConfirm, onCancel, isLoading }) {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div className={styles.dialogOverlay} onClick={onCancel}>
            <div
                className={styles.dialog}
                onClick={(e) => e.stopPropagation()}
                role="alertdialog"
                aria-modal="true"
            >
                <div className={styles.dialogIcon}>
                    <AlertTriangle size={28} />
                </div>
                <h3 className={styles.dialogTitle}>
                    {t('history_clear_confirm_title')}
                </h3>
                <p className={styles.dialogMessage}>
                    {t('history_clear_confirm_message')}
                </p>
                <div className={styles.dialogActions}>
                    <Button
                        variant="secondary"
                        size="medium"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        variant="primary"
                        size="medium"
                        onClick={onConfirm}
                        isLoading={isLoading}
                    >
                        {t('history_clear_confirm_action')}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function HistoryPage() {
    const { t }          = useTranslation();
    const navigate       = useNavigate();
    const { isLoggedIn } = useAuth();
    const queryClient    = useQueryClient();

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const {
        data: tracks = [],
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ['listening-history'],
        queryFn:  getListeningHistory,
        enabled:  isLoggedIn,
    });

    const { mutate: clearHistory, isPending: isClearing } = useMutation({
        mutationFn: clearListeningHistory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['listening-history'] });
            setIsConfirmOpen(false);
        },
        onError: (err) => {
            logger.error('Clear history error', err);
            setIsConfirmOpen(false);
        },
    });

    const { mutate: removeTrack } = useMutation({
        mutationFn: (historyEntryId) => removeTrackFromHistory(historyEntryId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['listening-history'] });
        },
        onError: (err) => {
            logger.error('Remove track from history error', err);
        },
    });

    const handleRemoveFromHistory = useCallback((track) => {
        if (track.historyEntryId) {
            removeTrack(track.historyEntryId);
        }
    }, [removeTrack]);

    if (!isLoggedIn) {
        return (
            <MusicSectionWrapper spacing="top-only">
                <InfoSection
                    title={t('listening_history')}
                    message={t('login_to_see_history')}
                    action={{
                        label:   t('login'),
                        onClick: () => navigate('/login'),
                        variant: 'primary',
                    }}
                />
            </MusicSectionWrapper>
        );
    }

    if (isLoading) {
        return (
            <MusicSectionWrapper spacing="top-only">
                <div className={styles.spinnerWrapper}>
                    <Spinner />
                </div>
            </MusicSectionWrapper>
        );
    }

    if (isError) {
        logger.error('History fetch error', error);
        return (
            <MusicSectionWrapper spacing="top-only">
                <InfoSection
                    title={t('listening_history')}
                    error={error}
                    action={{
                        label:   t('retry'),
                        onClick: refetch,
                        variant: 'outline',
                    }}
                />
            </MusicSectionWrapper>
        );
    }

    const grouped = groupHistoryByDate(tracks);

    return (
        <MusicSectionWrapper spacing="top-only">
            <div className={styles.pageHeader}>
                <div className={styles.pageHeaderTitle}>
                    <Clock size={22} className={styles.titleIcon} />
                    <h2 className={styles.title}>{t('listening_history')}</h2>
                </div>

                {tracks.length > 0 && (
                    <Button
                        variant="outline"
                        size="small"
                        icon={<Trash2 size={14} />}
                        onClick={() => setIsConfirmOpen(true)}
                        disabled={isClearing}
                    >
                        {t('history_clear')}
                    </Button>
                )}
            </div>

            {grouped.length === 0 ? (
                <InfoSection
                    title={t('history_empty_title')}
                    message={t('history_empty_msg')}
                />
            ) : (
                <div className={styles.groupsList}>
                    {grouped.map((group) => (
                        <TrackSection
                            key={group.labelKey}
                            title={t(group.labelKey)}
                            tracks={group.tracks}
                            collapsible
                            onRemoveFromHistory={handleRemoveFromHistory}
                        />
                    ))}
                </div>
            )}

            <ConfirmDialog
                isOpen={isConfirmOpen}
                onConfirm={() => clearHistory()}
                onCancel={() => setIsConfirmOpen(false)}
                isLoading={isClearing}
            />
        </MusicSectionWrapper>
    );
}