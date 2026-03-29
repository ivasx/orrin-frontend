import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useToast } from '../context/ToastContext.jsx';
import { updateUserProfile } from '../services/api/index.js';
import { logger } from '../utils/logger.js';

/**
 * Provides mutations for editing one's own user profile.
 *
 * @param {string} username - The username whose profile is being edited.
 * @returns {{ updateMutation: import('@tanstack/react-query').UseMutationResult }}
 */
export const useUserProfileMutations = (username) => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    const { showToast } = useToast();

    const updateMutation = useMutation({
        mutationFn: (payload) => updateUserProfile(username, payload),
        onSuccess: (updatedProfile) => {
            // Optimistically patch the profile cache
            queryClient.setQueryData(['userProfile', username], (old) => ({
                ...(old || {}),
                ...updatedProfile,
            }));
            queryClient.invalidateQueries({ queryKey: ['userProfile', username] });
            showToast(t('profile_updated', 'Profile updated successfully'), 'success');
        },
        onError: (error) => {
            logger.error('[useUserProfileMutations] updateProfile failed:', error);
            showToast(
                t('profile_update_error', 'Failed to update profile. Please try again.'),
                'error',
            );
        },
    });

    return { updateMutation };
};