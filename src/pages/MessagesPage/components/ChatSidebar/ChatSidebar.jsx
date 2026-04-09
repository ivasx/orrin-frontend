import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Search, X } from 'lucide-react';
import { getUserChats } from '../../../../services/api';
import Spinner from '../../../../components/UI/Spinner/Spinner';
import InfoSection from '../../../../components/Shared/InfoSection/InfoSection';
import ChatListItem from './ChatListItem';
import styles from './ChatSidebar.module.css';

export default function ChatSidebar({ activeChatId }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const { data: chats, isLoading, isError, refetch } = useQuery({
        queryKey: ['userChats'],
        queryFn: getUserChats,
        staleTime: 1000 * 30,
    });

    const filteredChats = useMemo(() => {
        if (!chats) return [];
        const q = searchQuery.trim().toLowerCase();
        if (!q) return chats;
        return chats.filter((chat) => {
            const participant = chat.participant || {};
            const name = (participant.name || '').toLowerCase();
            const username = (participant.username || '').toLowerCase();
            return name.includes(q) || username.includes(q);
        });
    }, [chats, searchQuery]);

    const handleChatClick = (chatId) => {
        navigate(`/messages/${chatId}`);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    return (
        <div className={styles.sidebar}>
            <div className={styles.header}>
                <h2 className={styles.title}>{t('messages_title')}</h2>
                <div className={styles.searchWrapper}>
                    <Search size={15} className={styles.searchIcon} />
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder={t('messages_search_placeholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label={t('messages_search_placeholder')}
                    />
                    {searchQuery && (
                        <button
                            className={styles.clearButton}
                            onClick={handleClearSearch}
                            aria-label={t('clear_search')}
                            type="button"
                        >
                            <X size={13} />
                        </button>
                    )}
                </div>
            </div>

            <div className={styles.listWrapper}>
                {isLoading && (
                    <div className={styles.centered}>
                        <Spinner />
                    </div>
                )}

                {!isLoading && isError && (
                    <InfoSection
                        title=""
                        error={true}
                        action={{
                            label: t('retry'),
                            onClick: refetch,
                            variant: 'secondary',
                        }}
                    />
                )}

                {!isLoading && !isError && filteredChats.length === 0 && (
                    <InfoSection
                        title=""
                        message={searchQuery ? t('messages_no_results') : t('messages_no_chats')}
                    />
                )}

                {!isLoading && !isError && filteredChats.length > 0 && (
                    <div className={styles.list} role="list">
                        {filteredChats.map((chat) => (
                            <div key={chat.id} role="listitem">
                                <ChatListItem
                                    chat={chat}
                                    isActive={chat.id === activeChatId}
                                    onClick={() => handleChatClick(chat.id)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}