import {useState, useRef, useEffect, useCallback, useMemo} from 'react';
import ReactDOM from 'react-dom';
import {useTranslation} from 'react-i18next';
import {useMutation, useQuery} from '@tanstack/react-query';
import {X, Search, Send, Loader2} from 'lucide-react';
import {getUserChats, sendMessage, fetchJson} from '../../../services/api/index.js';
import {normalizeUserData} from '../../../constants/fallbacks.js';
import {useToast} from '../../../context/ToastContext.jsx';
import styles from './ShareToChatModal.module.css';

const isMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';

async function searchUsers(query) {
    if (!query.trim()) return [];
    if (isMock) {
        const {mockUsers} = await import('../../../data/mocks/users.mock.js');
        const q = query.toLowerCase();
        return mockUsers.filter(
            (u) =>
                u.username?.toLowerCase().includes(q) ||
                u.name?.toLowerCase().includes(q),
        );
    }
    const data = await fetchJson(`/api/v1/users/search/?search=${encodeURIComponent(query)}`);
    return (Array.isArray(data) ? data : data.results ?? []).map(normalizeUserData);
}

async function findOrCreateChat(username) {
    if (isMock) {
        const {mockChats} = await import('../../../data/mocks/chat.mock.js');
        return mockChats[0];
    }
    return fetchJson('/api/v1/chats/', {
        method: 'POST',
        body: JSON.stringify({recipient_username: username}),
    });
}

function Avatar({src, name, size = 40}) {
    const fallback = (name?.[0] ?? '?').toUpperCase();
    return (
        <div className={styles.avatar} style={{width: size, height: size}}>
            {src ? (
                <img src={src} alt={name}/>
            ) : (
                <span className={styles.avatarFallback}>{fallback}</span>
            )}
        </div>
    );
}

export default function ShareToChatModal({isOpen, onClose, trackId, trackTitle, trackArtist, trackCover}) {
    const {t} = useTranslation();
    const {showToast} = useToast();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState('');
    const [userResults, setUserResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef(null);
    const searchTimerRef = useRef(null);

    const {data: chats = [], isLoading: isChatsLoading} = useQuery({
        queryKey: ['userChats'],
        queryFn: getUserChats,
        enabled: isOpen,
    });

    const recentUsers = useMemo(() => {
        return chats
            .filter((c) => c.participant)
            .map((c) => ({...c.participant, chatId: c.id}));
    }, [chats]);

    const displayUsers = searchQuery.trim() ? userResults : recentUsers;

    useEffect(() => {
        if (!searchQuery.trim()) {
            setUserResults([]);
            return;
        }
        clearTimeout(searchTimerRef.current);
        setIsSearching(true);
        searchTimerRef.current = setTimeout(async () => {
            try {
                const results = await searchUsers(searchQuery);
                setUserResults(results);
            } finally {
                setIsSearching(false);
            }
        }, 300);
        return () => clearTimeout(searchTimerRef.current);
    }, [searchQuery]);

    const mutation = useMutation({
        mutationFn: async ({user, text, trackId}) => {
            let chatId = user.chatId;
            if (!chatId) {
                const chat = await findOrCreateChat(user.username);
                chatId = chat.id;
            }
            return sendMessage(chatId, text, trackId);
        },
        onSuccess: () => {
            showToast(t('track_shared_success', 'Track shared!'), 'success');
            handleClose();
        },
        onError: () => {
            showToast(t('error_generic', 'Something went wrong'), 'error');
        },
    });

    const handleClose = useCallback(() => {
        setSelectedUser(null);
        setMessage('');
        setSearchQuery('');
        setUserResults([]);
        onClose();
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => {
            if (e.key === 'Escape') handleClose();
        };
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', onKey);
        setTimeout(() => searchRef.current?.focus(), 50);
        return () => {
            document.body.style.overflow = prev;
            document.removeEventListener('keydown', onKey);
        };
    }, [isOpen, handleClose]);

    const handleSend = () => {
        if (!selectedUser || !trackId) return;
        mutation.mutate({user: selectedUser, text: message.trim(), trackId});
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className={styles.overlay} onClick={handleClose} role="presentation">
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={t('share_to_chat', 'Share to chat')}
            >
                <div className={styles.header}>
                    <span className={styles.title}>{t('share_to_chat', 'Share to chat')}</span>
                    <button className={styles.closeBtn} onClick={handleClose} type="button" aria-label={t('close')}>
                        <X size={18}/>
                    </button>
                </div>

                {(trackTitle || trackCover) && (
                    <div className={styles.trackPreview}>
                        {trackCover && (
                            <img src={trackCover} alt={trackTitle} className={styles.trackCover}/>
                        )}
                        <div className={styles.trackMeta}>
                            <span className={styles.trackTitle}>{trackTitle}</span>
                            {trackArtist && <span className={styles.trackArtist}>{trackArtist}</span>}
                        </div>
                    </div>
                )}

                <div className={styles.searchBar}>
                    <Search size={15} className={styles.searchIcon}/>
                    <input
                        ref={searchRef}
                        type="text"
                        className={styles.searchInput}
                        placeholder={t('share_search_placeholder', 'Search people...')}
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setSelectedUser(null);
                        }}
                    />
                    {isSearching && <Loader2 size={14} className={styles.searchSpinner}/>}
                </div>

                <div className={styles.listLabel}>
                    {searchQuery.trim()
                        ? t('share_results', 'Results')
                        : t('share_recent', 'Recent conversations')}
                </div>

                <div className={styles.userList}>
                    {isChatsLoading && !searchQuery && (
                        <div className={styles.centered}>
                            <Loader2 size={20} className={styles.spinner}/>
                        </div>
                    )}

                    {!isChatsLoading && displayUsers.length === 0 && (
                        <div className={styles.empty}>
                            {searchQuery.trim()
                                ? t('share_no_results', 'No users found')
                                : t('messages_no_chats')}
                        </div>
                    )}

                    {displayUsers.map((user) => {
                        const uid = user.id ?? user.username;
                        const isSelected = selectedUser?.id === uid || selectedUser?.username === user.username;
                        return (
                            <button
                                key={uid}
                                type="button"
                                className={`${styles.userItem} ${isSelected ? styles.userItemSelected : ''}`}
                                onClick={() => setSelectedUser(user)}
                            >
                                <Avatar src={user.avatar || user.avatarUrl} name={user.name || user.username}/>
                                <div className={styles.userInfo}>
                                    <span className={styles.userName}>{user.name || user.username}</span>
                                    <span className={styles.userHandle}>@{user.username}</span>
                                </div>
                                {isSelected && <div className={styles.selectedDot}/>}
                            </button>
                        );
                    })}
                </div>

                {selectedUser && (
                    <div className={styles.composeRow}>
                        <input
                            type="text"
                            className={styles.messageInput}
                            placeholder={t('share_message_placeholder', 'Add a message...')}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) handleSend();
                            }}
                            disabled={mutation.isPending}
                            maxLength={300}
                        />
                        <button
                            type="button"
                            className={styles.sendBtn}
                            onClick={handleSend}
                            disabled={mutation.isPending}
                            aria-label={t('chat_send_message')}
                        >
                            {mutation.isPending
                                ? <Loader2 size={16} className={styles.spinner}/>
                                : <Send size={16}/>
                            }
                        </button>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}