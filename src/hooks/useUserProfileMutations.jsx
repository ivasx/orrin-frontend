import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useTranslation} from 'react-i18next';
import {useToast} from '../context/ToastContext.jsx';
import {updateUserProfile} from '../services/api/index.js';
import {logger} from '../utils/logger.js';

export const useUserProfileMutations = (routeParam) => {
    const queryClient = useQueryClient();
    const {t} = useTranslation();
    const {showToast} = useToast();

    const updateMutation = useMutation({
        mutationFn: (payload) => updateUserProfile(routeParam, payload),
        onSuccess: (updatedProfile) => {
            queryClient.setQueryData(['userProfile', routeParam], (old) => ({
                ...(old || {}),
                ...updatedProfile,
            }));
            queryClient.invalidateQueries({queryKey: ['userProfile']});
            queryClient.invalidateQueries({queryKey: ['currentUser']});
            showToast(t('profile_updated'), 'success');
        },
        onError: (error) => {
            logger.error('[useUserProfileMutations] updateProfile failed:', error);
            showToast(error.message || t('profile_update_error'), 'error');
        },
    });

    return {updateMutation};
};