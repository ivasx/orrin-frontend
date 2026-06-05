import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAudioCore } from '../../context/AudioCoreContext';
import { useSidebar } from '../../context/SidebarContext.jsx';
import ChatSidebar from './components/ChatSidebar/ChatSidebar';
import ChatWindow from './components/ChatWindow/ChatWindow';
import styles from './MessagesPage.module.css';

const SIDEBAR_WIDTH_OPEN = 240;
const SIDEBAR_WIDTH_COLLAPSED = 72;

export default function MessagesPage() {
    const { t } = useTranslation();
    const { chatId } = useParams();
    const { isOpen: sidebarOpen } = useSidebar();
    const { currentTrack } = useAudioCore();

    const sidebarWidth = sidebarOpen ? SIDEBAR_WIDTH_OPEN : SIDEBAR_WIDTH_COLLAPSED;
    const isPlayerVisible = Boolean(currentTrack) && currentTrack.trackId !== 'song-404';
    const bottomOffset = isPlayerVisible ? 'var(--player-height, 84px)' : '0px';

    return (
        <div
            className={styles.wrapper}
            style={{
                left: `${sidebarWidth}px`,
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