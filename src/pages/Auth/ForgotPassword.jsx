import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaArrowLeft } from 'react-icons/fa';
import './Auth.css';
import styles from './ForgotPassword.module.css';
import { requestPasswordReset } from '../../services/api/api.real.js';

export default function ForgotPassword() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await requestPasswordReset(email);
            setSubmitted(true);
        } catch (err) {
            setError(err.message || t('forgot_password_error'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <Link to="/login" className="back-to-home" aria-label={t('back_to_login')}>
                    <FaArrowLeft />
                </Link>

                <div className="auth-header">
                    <img src="/orrin-logo.svg" alt="Orrin Logo" className="auth-logo" />
                    <h1 className="auth-title">{t('forgot_password_title')}</h1>
                    <p className="auth-subtitle">{t('forgot_password_subtitle')}</p>
                </div>

                {submitted ? (
                    <div className={styles.successState}>
                        <div className={styles.successIcon}>✓</div>
                        <p className={styles.successText}>
                            {t('forgot_password_success', { email })}
                        </p>
                        <Link to="/login" className={styles.backLink}>
                            {t('back_to_login_link')}
                        </Link>
                    </div>
                ) : (
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                {t('email_label')}
                            </label>
                            <input
                                type="email"
                                id="email"
                                className="form-input"
                                placeholder={t('email_placeholder')}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>

                        {error && <p className="error-message">{error}</p>}

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={isLoading || !email.trim()}
                        >
                            {isLoading ? t('loading') : t('forgot_password_submit')}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}