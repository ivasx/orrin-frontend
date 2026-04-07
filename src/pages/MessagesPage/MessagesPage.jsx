import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './MessagesPage.module.css';

export default function MessagesPage() {
    const { t } = useTranslation();
    const { chatId } = useParams();

    return (
        <div className={styles.wrapper}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h2 className={styles.sidebarTitle}>{t('messages_title')}</h2>
                </div>
                <div className={styles.chatListPlaceholder}>
                    {t('messages_loading_chats')}
                </div>
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