import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Send } from 'lucide-react';
import styles from './MessageInput.module.css';

const MAX_ROWS = 5;
const LINE_HEIGHT = 22;
const PADDING_VERTICAL = 20;

export default function MessageInput({ onSend, isSending, disabled, notifyTyping }) {
    const { t } = useTranslation();
    const [value, setValue] = useState('');
    const textareaRef = useRef(null);

    useEffect(() => {
        if (textareaRef.current && !disabled) {
            textareaRef.current.focus();
        }
    }, [disabled]);

    const adjustHeight = useCallback(() => {
        const ta = textareaRef.current;
        if (!ta) return;
        ta.style.height = 'auto';
        const maxHeight = LINE_HEIGHT * MAX_ROWS + PADDING_VERTICAL;
        ta.style.height = Math.min(ta.scrollHeight, maxHeight) + 'px';
    }, []);

    const handleChange = useCallback((e) => {
        setValue(e.target.value);
        adjustHeight();
        if (notifyTyping) notifyTyping();
    }, [adjustHeight, notifyTyping]);

    const handleSubmit = useCallback(() => {
        const trimmed = value.trim();
        if (!trimmed || isSending || disabled) return;
        onSend(trimmed);
        setValue('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.focus();
        }
    }, [value, isSending, disabled, onSend]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }, [handleSubmit]);

    const canSend = value.trim().length > 0 && !isSending && !disabled;

    return (
        <div className={styles.container}>
            <textarea
                ref={textareaRef}
                className={styles.textarea}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={t('chat_input_placeholder')}
                disabled={disabled || isSending}
                rows={1}
                aria-label={t('chat_input_label')}
            />
            <button
                className={`${styles.sendButton} ${canSend ? styles.active : ''}`}
                onClick={handleSubmit}
                disabled={!canSend}
                aria-label={t('chat_send_message')}
                type="button"
            >
                <Send size={18} />
            </button>
        </div>
    );
}