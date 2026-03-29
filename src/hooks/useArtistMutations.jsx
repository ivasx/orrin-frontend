import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useToast } from '../context/ToastContext.jsx';
import { updateArtistProfile } from '../services/api/index.js';
import { logger } from '../utils/logger.js';

/**
 * Provides all mutations needed for managing an artist profile.
 *
 * @param {string} artistSlug - The slug/id of the artist being managed.
 * @returns {{ updateProfileMutation: import('@tanstack/react-query').UseMutationResult }}
 */
export const useArtistMutations = (artistSlug) => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    const { showToast } = useToast();

    const updateProfileMutation = useMutation({
        mutationFn: (formData) => updateArtistProfile(artistSlug, formData),
        onSuccess: (updatedArtist) => {
            // Optimistically update the cache so the page reflects changes instantly
            queryClient.setQueryData(['artist', artistSlug], (old) => ({
                ...old,
                ...updatedArtist,
            }));
            // Also invalidate to ensure freshness on next render
            queryClient.invalidateQueries({ queryKey: ['artist', artistSlug] });
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

    return { updateProfileMutation };
};