import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { getChatMessages, sendMessage, getUserChats } from '../services/api';
import { logger } from '../utils/logger';

export function useChat(chatId) {
    const queryClient = useQueryClient();

    const chatsData = queryClient.getQueryData(['userChats']);
    const activeChat = chatsData?.find((c) => c.id === chatId) ?? null;

    const {
        data: messages,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ['chatMessages', chatId],
        queryFn: () => getChatMessages(chatId),
        enabled: !!chatId,
        staleTime: 1000 * 15,
        refetchInterval: 1000 * 20,
        onError: (err) => {
            logger.error('[useChat] Failed to fetch messages:', err);
        },
    });

    const { mutate: send, isLoading: isSending } = useMutation({
        mutationFn: (text) => sendMessage(chatId, text),
        onMutate: async (text) => {
            await queryClient.cancelQueries({ queryKey: ['chatMessages', chatId] });

            const previous = queryClient.getQueryData(['chatMessages', chatId]);

            const optimistic = {
                id: 'optimistic-' + Date.now(),
                chatId,
                senderId: 'user-4',
                text: text.trim(),
                timestamp: new Date().toISOString(),
                isRead: false,
                isOptimistic: true,
            };

            queryClient.setQueryData(['chatMessages', chatId], (old) =>
                old ? [...old, optimistic] : [optimistic]
            );

            return { previous };
        },
        onError: (err, _text, context) => {
            logger.error('[useChat] Failed to send message:', err);
            if (context?.previous) {
                queryClient.setQueryData(['chatMessages', chatId], context.previous);
            }
        },
        onSuccess: (newMessage) => {
            logger.log('[useChat] Message sent:', newMessage);
            queryClient.setQueryData(['chatMessages', chatId], (old) => {
                if (!old) return [newMessage];
                const filtered = old.filter((m) => !m.isOptimistic);
                return [...filtered, newMessage];
            });
            queryClient.invalidateQueries({ queryKey: ['userChats'] });
        },
    });

    const sendChatMessage = useCallback(
        (text) => {
            if (!text?.trim() || !chatId) return;
            send(text.trim());
        },
        [send, chatId]
    );

    const refetchMessages = useCallback(() => {
        refetch();
    }, [refetch]);

    return {
        messages: messages ?? [],
        isLoading,
        isError,
        error,
        isSending,
        activeChat,
        sendChatMessage,
        refetchMessages,
    };
}