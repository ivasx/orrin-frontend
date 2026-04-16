import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getChatMessages, sendMessage, getUserChats } from '../services/api';
import { socketService } from '../services/socket/socket.service';
import { logger } from '../utils/logger';

const TYPING_DEBOUNCE_MS = 400;
const TYPING_EXPIRY_MS = 3000;

export function useChat(chatId) {
    const queryClient = useQueryClient();
    const [typingUsers, setTypingUsers] = useState({});
    const typingDebounceRef = useRef(null);
    const typingExpiryTimers = useRef({});

    const { data: chatsData } = useQuery({ queryKey: ['userChats'] });
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
        staleTime: 1000 * 60,
    });

    useEffect(() => {
        if (!chatId) return;

        socketService.connect(chatId);

        const handleReceiveMessage = (payload) => {
            logger.log('[useChat] receive_message:', payload);

            const incoming = payload.message ?? payload;

            queryClient.setQueryData(['chatMessages', chatId], (old) => {
                if (!old) return [incoming];
                const exists = old.some((m) => m.id === incoming.id);
                return exists ? old : [...old, incoming];
            });

            queryClient.setQueryData(['userChats'], (old) => {
                if (!old) return old;
                return old.map((c) =>
                    c.id === chatId
                        ? {
                            ...c,
                            lastMessage: {
                                id: incoming.id,
                                senderId: incoming.senderId,
                                text: incoming.text,
                                timestamp: incoming.timestamp,
                                isRead: false,
                            },
                            updatedAt: incoming.timestamp,
                            unreadCount: (c.unreadCount || 0) + 1,
                        }
                        : c
                );
            });
        };

        const handleTypingStart = ({ senderId }) => {
            if (!senderId) return;

            setTypingUsers((prev) => ({ ...prev, [senderId]: true }));

            clearTimeout(typingExpiryTimers.current[senderId]);
            typingExpiryTimers.current[senderId] = setTimeout(() => {
                setTypingUsers((prev) => {
                    const next = { ...prev };
                    delete next[senderId];
                    return next;
                });
            }, TYPING_EXPIRY_MS);
        };

        const handleTypingStop = ({ senderId }) => {
            if (!senderId) return;

            clearTimeout(typingExpiryTimers.current[senderId]);
            delete typingExpiryTimers.current[senderId];

            setTypingUsers((prev) => {
                const next = { ...prev };
                delete next[senderId];
                return next;
            });
        };

        socketService.on('receive_message', handleReceiveMessage);
        socketService.on('typing_start', handleTypingStart);
        socketService.on('typing_stop', handleTypingStop);

        return () => {
            socketService.off('receive_message');
            socketService.off('typing_start');
            socketService.off('typing_stop');
            socketService.disconnect();

            clearTimeout(typingDebounceRef.current);
            Object.values(typingExpiryTimers.current).forEach(clearTimeout);
            typingExpiryTimers.current = {};

            setTypingUsers({});
        };
    }, [chatId, queryClient]);

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

    const notifyTyping = useCallback(() => {
        if (!chatId) return;

        clearTimeout(typingDebounceRef.current);
        typingDebounceRef.current = setTimeout(() => {
            socketService.emit('typing_start', { chatId });
        }, TYPING_DEBOUNCE_MS);
    }, [chatId]);

    const refetchMessages = useCallback(() => {
        refetch();
    }, [refetch]);

    const isTyping = Object.keys(typingUsers).length > 0;

    return {
        messages: messages ?? [],
        isLoading,
        isError,
        error,
        isSending,
        activeChat,
        isTyping,
        typingUsers,
        sendChatMessage,
        notifyTyping,
        refetchMessages,
    };
}