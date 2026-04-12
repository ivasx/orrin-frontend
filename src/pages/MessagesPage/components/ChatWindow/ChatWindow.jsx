import { useTranslation } from 'react-i18next';
import { useChat } from '../../../../hooks/useChat';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import InfoSection from '../../../../components/Shared/InfoSection/InfoSection';
import styles from './ChatWindow.module.css';

export default function ChatWindow({ chatId }) {
    const { t } = useTranslation();

    const {
        messages,
        isLoading,
        isError,
        isSending,
        activeChat,
        sendChatMessage,
        refetchMessages,
    } = useChat(chatId);

    return (
        <div className={styles.window}>
            <ChatHeader chat={activeChat} />

            <div className={styles.body}>
                {isError ? (
                    <div className={styles.stateWrapper}>
                        <InfoSection
                            title=""
                            error={true}
                            action={{
                                label: t('retry'),
                                onClick: refetchMessages,
                                variant: 'secondary',
                            }}
                        />
                    </div>
                ) : (
                    <MessageList
                        messages={messages}
                        isLoading={isLoading}
                        currentUserId="user-4"
                    />
                )}
            </div>

            <div className={styles.inputArea}>
                <MessageInput
                    onSend={sendChatMessage}
                    isSending={isSending}
                    disabled={isError}
                />
            </div>
        </div>
    );
}