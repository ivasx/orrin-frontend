import {useTranslation} from 'react-i18next';
import {useAuth} from '../../../../context/AuthContext.jsx';
import {useChat} from '../../../../hooks/useChat';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import InfoSection from '../../../../components/Shared/InfoSection/InfoSection';
import styles from './ChatWindow.module.css';

export default function ChatWindow({chatId}) {
    const {t} = useTranslation();
    const {user} = useAuth();

    const {
        messages,
        isLoading,
        isError,
        isSending,
        activeChat,
        isTyping,
        sendChatMessage,
        notifyTyping,
        refetchMessages,
    } = useChat(chatId, user?.id);

    return (
        <div className={styles.window}>
            <ChatHeader chat={activeChat} isTyping={isTyping}/>

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
                        currentUserId={user?.id}
                    />
                )}
            </div>

            <div className={styles.inputArea}>
                <MessageInput
                    onSend={sendChatMessage}
                    isSending={isSending}
                    disabled={isError}
                    notifyTyping={notifyTyping}
                />
            </div>
        </div>
    );
}