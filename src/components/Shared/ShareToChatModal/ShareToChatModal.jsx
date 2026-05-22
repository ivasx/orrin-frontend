import {useState, useRef, useEffect, useCallback} from 'react';
import ReactDOM from 'react-dom';
import {useTranslation} from 'react-i18next';
import {useMutation, useQuery} from '@tanstack/react-query';
import {X, Loader} from 'lucide-react';
import {getUserChats, sendMessage} from '../../../services/api/index.js';
import {useToast} from '../../../context/ToastContext.jsx';
import Button from '../../UI/Button/Button.jsx';
import styles from './ShareToChatModal.module.css';

export default function ShareToChatModal({isOpen, onClose, trackId}) {
    const {t} = useTranslation();
    const {showToast} = useToast();
    const modalRef = useRef(null);
    const messageInputRef = useRef(null);

    const [selectedChatId, setSelectedChatId] = useState(null);
    const [message, setMessage] = useState('');

    const {data: chats, isLoading: isChatsLoading} = useQuery({
        queryKey: ['userChats'],
        queryFn: getUserChats,
        enabled: isOpen,
    });

    const mutation = useMutation({
        mutationFn: (payload) => sendMessage(payload.chatId, payload.text, payload.trackId),
        onSuccess: () => {
            showToast(t('track_shared_success'), 'success');
            handleClose();
        },
        onError: () => {
            showToast(t('error_generic'), 'error');
        },
    });

    const handleClose = useCallback(() => {
        setSelectedChatId(null);
        setMessage('');
        onClose();
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e) => {
            if (e.key === 'Escape') handleClose();
        };

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.body.style.overflow = originalOverflow;
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, handleClose]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedChatId || !trackId) return;

        mutation.mutate({
            chatId: selectedChatId,
            text: message.trim(),
            trackId,
        });
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className={styles.overlay} onClick={handleClose} role="presentation">
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
                ref={modalRef}
                role="dialog"
                aria-modal="true"
            >
                <div className={styles.header}>
                    <h2 className={styles.title}>{t('share_to_chat')}</h2>
                    <button
                        className={styles.closeBtn}
                        onClick={handleClose}
                        type="button"
                    >
                        <X size={20}/>
                    </button>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.fields}>
                        <label className={styles.label}>{t('select_chat')}</label>
                        <div className={styles.chatList}>
                            {isChatsLoading ? (
                                <div className={styles.loaderContainer}>
                                    <Loader size={24} className={styles.spinner}/>
                                </div>
                            ) : chats?.length > 0 ? (
                                chats.map((chat) => (
                                    <button
                                        key={chat.id}
                                        type="button"
                                        className={`${styles.chatItem} ${selectedChatId === chat.id ? styles.selected : ''}`}
                                        onClick={() => setSelectedChatId(chat.id)}
                                    >
                                        {chat.participants?.map(p => p.username).join(', ') || `Chat ${chat.id}`}
                                    </button>
                                ))
                            ) : (
                                <div className={styles.emptyState}>{t('no_chats_found')}</div>
                            )}
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label} htmlFor="share-msg">
                                {t('message')} ({t('optional')})
                            </label>
                            <textarea
                                id="share-msg"
                                ref={messageInputRef}
                                className={styles.textarea}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={t('write_a_message')}
                                maxLength={500}
                                rows={2}
                                disabled={mutation.isPending}
                            />
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleClose}
                            disabled={mutation.isPending}
                        >
                            {t('cancel')}
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={!selectedChatId || mutation.isPending}
                        >
                            {mutation.isPending ? (
                                <>
                                    <Loader size={16} className={styles.spinner}/>
                                    {t('sending')}
                                </>
                            ) : (
                                t('send')
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}