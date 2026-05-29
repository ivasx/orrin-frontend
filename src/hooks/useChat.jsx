import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getChatMessages, sendMessage, getUserChats } from '../services/api';
import { socketService } from '../services/socket/socket.service';
import { logger } from '../utils/logger';

const TYPING_DEBOUNCE_MS = 400;
const TYPING_EXPIRY_MS = 3000;

export function useChat(chatId, currentUserId) {
    const queryClient = useQueryClient();
    const [typingUsers, setTypingUsers] = useState({});
    const typingDebounceRef = useRef(null);
    const typingExpiryTimers = useRef({});
    const activeChatIdRef = useRef(null);

    const { data: chatsData } = useQuery({
        queryKey: ['userChats'],
        queryFn: getUserChats,
        staleTime: 1000 * 30,
    });

    const activeChat = chatsData?.find((c) => String(c.id) === String(chatId)) ?? null;

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

        activeChatIdRef.current = chatId;
        socketService.connect(chatId);

        const handleReceiveMessage = (payload) => {
            logger.log('[useChat] receive_message:', payload);
            const incoming = payload.message ?? payload;

            queryClient.setQueryData(['chatMessages', chatId], (old) => {
                if (!old) return [incoming];
                const alreadyExists = old.some(
                    (m) => !m.isOptimistic && String(m.id) === String(incoming.id)
                );
                if (alreadyExists) return old;
                const withoutOptimistic = old.filter(
                    (m) => !(m.isOptimistic && m.text === incoming.text)
                );
                return [...withoutOptimistic, incoming];
            });

            queryClient.setQueryData(['userChats'], (old) => {
                if (!old) return old;
                return old.map((c) =>
                    String(c.id) === String(chatId)
                        ? {
                            ...c,
                            lastMessage: {
                                id: incoming.id,
                                senderId: incoming.senderId,
                                text: incoming.text,
                                trackId: incoming.trackId,
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
            socketService.off('receive_message', handleReceiveMessage);
            socketService.off('typing_start', handleTypingStart);
            socketService.off('typing_stop', handleTypingStop);

            // Only disconnect if chatId actually changed (not StrictMode remount)
            // We use a timeout so StrictMode's immediate remount can reconnect first
            const disconnectingChatId = chatId;
            setTimeout(() => {
                if (activeChatIdRef.current !== disconnectingChatId) {
                    socketService.disconnect();
                }
            }, 0);

            clearTimeout(typingDebounceRef.current);
            Object.values(typingExpiryTimers.current).forEach(clearTimeout);
            typingExpiryTimers.current = {};
            setTypingUsers({});
        };
    }, [chatId, queryClient]);

    const { mutate: send, isPending: isSending } = useMutation({
        mutationFn: (payload) => sendMessage(chatId, payload.text, payload.trackId),
        onMutate: async (payload) => {
            await queryClient.cancelQueries({ queryKey: ['chatMessages', chatId] });
            const previous = queryClient.getQueryData(['chatMessages', chatId]);

            const optimistic = {
                id: 'optimistic-' + Date.now(),
                chatId,
                senderId: currentUserId ?? null,
                text: payload.text?.trim() || '',
                trackId: payload.trackId || null,
                timestamp: new Date().toISOString(),
                isRead: false,
                isOptimistic: true,
            };

            queryClient.setQueryData(['chatMessages', chatId], (old) =>
                old ? [...old, optimistic] : [optimistic]
            );

            return { previous };
        },
        onError: (err, _payload, context) => {
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
                const exists = filtered.some(
                    (m) => String(m.id) === String(newMessage.id)
                );
                return exists ? filtered : [...filtered, newMessage];
            });
            queryClient.invalidateQueries({ queryKey: ['userChats'] });
        },
    });

    const sendChatMessage = useCallback(
        (text, trackId = null) => {
            if ((!text?.trim() && !trackId) || !chatId) return;
            send({ text: text?.trim() || '', trackId });
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