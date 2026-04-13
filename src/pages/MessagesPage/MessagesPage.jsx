import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAudioCore } from '../../context/AudioCoreContext';
import ChatSidebar from './components/ChatSidebar/ChatSidebar';
import ChatWindow from './components/ChatWindow/ChatWindow';
import styles from './MessagesPage.module.css';

function getSidebarWidth() {
    if (document.querySelector('.main-content--shifted')) return 240;
    return 72;
}

function useSidebarWidth() {
    const [width, setWidth] = useState(getSidebarWidth);

    useEffect(() => {
        setWidth(getSidebarWidth());

        const target = document.querySelector('.main-content');
        if (!target) return;

        const observer = new MutationObserver(() => {
            setWidth(getSidebarWidth());
        });

        observer.observe(target, { attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    return width;
}

export default function MessagesPage() {
    const { t } = useTranslation();
    const { chatId } = useParams();
    const sidebarWidth = useSidebarWidth();
    const { currentTrack } = useAudioCore();

    const isPlayerVisible = Boolean(currentTrack) && currentTrack.trackId !== 'song-404';
    const bottomOffset = isPlayerVisible ? 'var(--player-height, 84px)' : '0px';

    return (
        <div
            className={styles.wrapper}
            style={{
                left: sidebarWidth + 'px',
                bottom: bottomOffset,
            }}
            data-chat-active={chatId ? 'true' : 'false'}
        >
            <aside className={styles.sidebar}>
                <ChatSidebar activeChatId={chatId} />
            </aside>

            <main className={styles.main}>
                {chatId ? (
                    <ChatWindow chatId={chatId} />
                ) : (
                    <div className={styles.emptyState}>
                        <p className={styles.emptyStateText}>{t('messages_select_conversation')}</p>
                    </div>
                )}
            </main>
        </div>
    );
}