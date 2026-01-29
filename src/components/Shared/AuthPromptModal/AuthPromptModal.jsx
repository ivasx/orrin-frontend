import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, LogIn } from 'lucide-react';
import Button from '../../UI/Button/Button';
import styles from './AuthPromptModal.module.css';

export default function AuthPromptModal({ onClose, isOpen }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const modalRef = useRef(null);

    // 1. Блокування скролу сторінки + закриття по Escape
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.body.style.overflow = originalOverflow;
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    // 2. Focus Trap (утримання фокусу всередині вікна для доступності)
    useEffect(() => {
        if (!isOpen || !modalRef.current) return;

        const modalElement = modalRef.current;
        const focusableElements = modalElement.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        firstElement.focus();

        const handleTabKey = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };

        modalElement.addEventListener('keydown', handleTabKey);
        return () => modalElement.removeEventListener('keydown', handleTabKey);
    }, [isOpen]);

    if (!isOpen) return null;

    // 3. React Portal - рендеринг у body
    return ReactDOM.createPortal(
        <div
            className={styles.overlay}
            onClick={onClose}
            role="presentation"
        >
            <div
                className={styles.modal}
                onClick={e => e.stopPropagation()}
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="auth-modal-title"
                aria-describedby="auth-modal-desc"
            >
                <div className={styles.header}>
                    <h3 id="auth-modal-title" className={styles.title}>
                        {t('auth_required_title')}
                    </h3>
                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label={t('close')}
                    >
                        <X size={20}/>
                    </button>
                </div>

                <p id="auth-modal-desc" className={styles.description}>
                    {t('auth_required_desc')}
                </p>

                <div className={styles.actions}>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => navigate('/login')}
                        icon={<LogIn size={18}/>}
                    >
                        {t('login')}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
}