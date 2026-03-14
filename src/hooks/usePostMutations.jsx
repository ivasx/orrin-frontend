import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleLikePost, repostPost, toggleSavePost, addComment, reportPost } from '../services/api.js';
import { useTranslation } from 'react-i18next';
import { useToast } from '../context/ToastContext.jsx';
import { logger } from '../utils/logger.js';

export const usePostMutations = (post, user) => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    const { showToast } = useToast();

    // Utility function to apply optimistic updates across all feed queries
    const updateOptimistically = (updateFn) => {
        queryClient.setQueriesData({ queryKey: ['feed'] }, (oldData) => {
            if (!oldData) return oldData;

            // Handle infinite query data structure
            if (oldData.pages) {
                return {
                    ...oldData,
                    pages: oldData.pages.map(page =>
                        page.map(p => p.id === post.id ? updateFn(p) : p)
                    )
                };
            }

            // Fallback for standard array structure
            if (Array.isArray(oldData)) {
                return oldData.map(p => p.id === post.id ? updateFn(p) : p);
            }

            return oldData;
        });
    };

    // Generic error rollback handler
    const handleRollback = (context, errorMsg) => {
        if (context?.previousFeeds) {
            context.previousFeeds.forEach(([queryKey, data]) => {
                queryClient.setQueryData(queryKey, data);
            });
        }
        showToast(errorMsg, 'error');
    };

    const likeMutation = useMutation({
        mutationFn: () => toggleLikePost(post.id),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['feed'] });
            const previousFeeds = queryClient.getQueriesData({ queryKey: ['feed'] });

            updateOptimistically((p) => ({
                ...p,
                isLiked: !p.isLiked,
                likesCount: p.isLiked ? Math.max(0, p.likesCount - 1) : p.likesCount + 1
            }));

            return { previousFeeds };
        },
        onError: (err, variables, context) => {
            logger.error(`Failed to like post ${post.id}:`, err);
            handleRollback(context, t('error_like'));
        }
    });

    const repostMutation = useMutation({
        mutationFn: () => repostPost(post.id),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['feed'] });
            const previousFeeds = queryClient.getQueriesData({ queryKey: ['feed'] });

            updateOptimistically((p) => ({
                ...p,
                isReposted: !p.isReposted,
                repostsCount: p.isReposted ? Math.max(0, p.repostsCount - 1) : p.repostsCount + 1
            }));

            return { previousFeeds };
        },
        onError: (err, variables, context) => {
            logger.error(`Failed to repost post ${post.id}:`, err);
            handleRollback(context, t('error_repost'));
        }
    });

    const saveMutation = useMutation({
        mutationFn: () => toggleSavePost(post.id),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['feed'] });
            const previousFeeds = queryClient.getQueriesData({ queryKey: ['feed'] });

            updateOptimistically((p) => ({
                ...p,
                isSaved: !p.isSaved
            }));

            return { previousFeeds, wasSaved: post.isSaved };
        },
        onSuccess: (data, variables, context) => {
            const msg = context.wasSaved ? t('post_unsaved_success') : t('post_saved_success');
            showToast(msg, 'success');
        },
        onError: (err, variables, context) => {
            logger.error(`Failed to save post ${post.id}:`, err);
            handleRollback(context, t('error_save'));
        }
    });

    const commentMutation = useMutation({
        mutationFn: (text) => addComment(post.id, text),
        onMutate: async (text) => {
            await queryClient.cancelQueries({ queryKey: ['feed'] });
            const previousFeeds = queryClient.getQueriesData({ queryKey: ['feed'] });

            const tempId = `temp-${Date.now()}`;
            const newComment = {
                id: tempId,
                author: {
                    name: user?.name || t('you'),
                    avatar: user?.avatar || '/default-avatar.png'
                },
                text: text,
                timestamp: t('just_now'),
            };

            updateOptimistically((p) => ({
                ...p,
                comments: [newComment, ...(p.comments || [])],
                commentsCount: (p.commentsCount || 0) + 1
            }));

            return { previousFeeds };
        },
        onSuccess: () => {
            showToast(t('comment_added'), 'success');
        },
        onError: (err, variables, context) => {
            logger.error(`Failed to add comment to post ${post.id}:`, err);
            handleRollback(context, t('error_comment'));
        }
    });

    const reportMutation = useMutation({
        mutationFn: () => reportPost(post.id, 'inappropriate'),
        onSuccess: () => showToast(t('report_sent'), 'success'),
        onError: (err) => {
            logger.error(`Failed to report post ${post.id}:`, err);
            showToast(t('error_report'), 'error');
        }
    });

    return {
        likeMutation,
        repostMutation,
        saveMutation,
        commentMutation,
        reportMutation
    };
};