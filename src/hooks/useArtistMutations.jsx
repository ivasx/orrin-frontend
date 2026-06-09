import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useTranslation} from 'react-i18next';
import {useToast} from '../context/ToastContext.jsx';
import {updateArtistProfile, uploadTrack} from '../services/api/index.js';
import {logger} from '../utils/logger.js';

export const useArtistMutations = (artistSlug) => {
    const queryClient = useQueryClient();
    const {t} = useTranslation();
    const {showToast} = useToast();

    const updateProfileMutation = useMutation({
        mutationFn: (formData) => updateArtistProfile(artistSlug, formData),
        onSuccess: (updatedArtist) => {
            queryClient.setQueryData(['artist', artistSlug], (old) => ({
                ...old,
                ...updatedArtist,
            }));
            queryClient.invalidateQueries({queryKey: ['artist', artistSlug]});
            showToast(t('artist_profile_updated', 'Profile updated successfully'), 'success');
        },
        onError: (error) => {
            logger.error('[useArtistMutations] updateProfile failed:', error);
            showToast(
                t('artist_profile_update_error', 'Failed to update profile. Please try again.'),
                'error',
            );
        },
    });

    const uploadTrackMutation = useMutation({
        mutationFn: (formData) => uploadTrack(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['artist', artistSlug]});
            showToast(t('track_uploaded', 'Track uploaded successfully'), 'success');
        },
        onError: (error) => {
            logger.error('[useArtistMutations] uploadTrack failed:', error);
            showToast(
                t('track_upload_error', 'Failed to upload track. Please try again.'),
                'error',
            );
        },
    });

    return {updateProfileMutation, uploadTrackMutation};
};