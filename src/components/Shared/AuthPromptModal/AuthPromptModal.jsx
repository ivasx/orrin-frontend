import React, {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {X, LogIn} from 'lucide-react';
import Button from '../../UI/Button/Button';
import styles from './AuthPromptModal.module.css';

export default function AuthPromptModal({onClose, isOpen}) {
    const {t} = useTranslation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleLogin = () => {
        navigate('/login');
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3 className={styles.title}>
                        {t('auth_required_title')}
                    </h3>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={20}/>
                    </button>
                </div>

                <p className={styles.description}>
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
                        onClick={handleLogin}
                        icon={<LogIn size={18}/>}
                    >
                        {t('login')}
                    </Button>
                </div>
            </div>
        </div>
    );
}