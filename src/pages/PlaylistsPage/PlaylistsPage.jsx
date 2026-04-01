import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ListMusic } from 'lucide-react';

import MusicSectionWrapper from '../../components/Shared/MusicSectionWrapper/MusicSectionWrapper.jsx';
import TrackSection from '../../components/Shared/TrackSection/TrackSection.jsx';
import Spinner from '../../components/UI/Spinner/Spinner.jsx';
import Button from '../../components/UI/Button/Button.jsx';
import PlaylistHero from './PlaylistHero.jsx';

import { getPlaylistById, deletePlaylist } from '../../services/api/index.js';
import { useAudioCore } from '../../context/AudioCoreContext.jsx';

import styles from './PlaylistPage.module.css';

export default function PlaylistPage() {
    const { id } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { playTrack } = useAudioCore();

    const [showMenu, setShowMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

    const {
        data: playlist,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['playlist', id],
        queryFn: () => getPlaylistById(id),
        staleTime: 2 * 60 * 1000,
    });

    const deleteMutation = useMutation({
        mutationFn: () => deletePlaylist(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userPlaylists'] });
            navigate('/library');
        },
    });

    const handlePlay = useCallback(() => {
        if (!playlist?.tracks?.length) return;
        playTrack(playlist.tracks[0], playlist.tracks);
    }, [playlist, playTrack]);

    const handleMenuOpen = useCallback((position) => {
        setMenuPosition(position);
        setShowMenu(true);
    }, []);

    const handleMenuClose = useCallback(() => {
        setShowMenu(false);
    }, []);

    const handleEditDetails = useCallback(() => {
        console.log('Edit playlist details:', id);
        setShowMenu(false);
    }, [id]);

    const handleDeletePlaylist = useCallback(() => {
        setShowMenu(false);
        deleteMutation.mutate();
    }, [deleteMutation]);

    if (isLoading) {
        return (
            <MusicSectionWrapper spacing="default">
                <div className={styles.loadingState}>
                    <Spinner />
                </div>
            </MusicSectionWrapper>
        );
    }

    if (isError || !playlist) {
        return (
            <MusicSectionWrapper spacing="default">
                <div className={styles.errorState}>
                    <ListMusic size={40} style={{ color: 'var(--color-text-muted)', opacity: 0.4 }} />
                    <h2 className={styles.errorTitle}>{t('playlist_not_found')}</h2>
                    <p className={styles.errorText}>{t('playlist_not_found_desc')}</p>
                    <Button variant="secondary" onClick={() => navigate('/library')}>
                        {t('back_to_library')}
                    </Button>
                </div>
            </MusicSectionWrapper>
        );
    }

    return (
        <MusicSectionWrapper spacing="top-only">
            <div className={styles.page}>
                <PlaylistHero
                    playlist={playlist}
                    onPlay={handlePlay}
                    showMenu={showMenu}
                    menuPosition={menuPosition}
                    onMenuOpen={handleMenuOpen}
                    onMenuClose={handleMenuClose}
                    onEditDetails={handleEditDetails}
                    onDeletePlaylist={handleDeletePlaylist}
                />

                <div className={styles.tracksSection}>
                    {playlist.tracks?.length > 0 ? (
                        <TrackSection
                            title={t('playlist_tracks')}
                            tracks={playlist.tracks}
                        />
                    ) : (
                        <div className={styles.emptyState}>
                            <ListMusic size={36} className={styles.emptyIcon} />
                            <p className={styles.emptyText}>{t('playlist_empty')}</p>
                        </div>
                    )}
                </div>
            </div>
        </MusicSectionWrapper>
    );
}