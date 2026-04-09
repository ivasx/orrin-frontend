import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ChatSidebar from './components/ChatSidebar/ChatSidebar';
import styles from './MessagesPage.module.css';

export default function MessagesPage() {
    const { t } = useTranslation();
    const { chatId } = useParams();

    return (
        <div
            className={styles.wrapper}
            data-chat-active={chatId ? 'true' : 'false'}
        >
            <aside className={styles.sidebar}>
                <ChatSidebar activeChatId={chatId} />
            </aside>

            <main className={styles.main}>
                {chatId ? (
                    <div className={styles.chatPlaceholder}>
                        {t('messages_loading_conversation')}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <p className={styles.emptyStateText}>{t('messages_select_conversation')}</p>
                    </div>
                )}
            </main>
        </div>
    );
}