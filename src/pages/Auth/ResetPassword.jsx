import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaArrowLeft } from 'react-icons/fa';
import '../Auth.css';
import styles from './ResetPassword.module.css';
import { confirmPasswordReset } from '../../services/api';

export default function ResetPassword() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get('token');
    const uid = searchParams.get('uid');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError(t('passwords_do_not_match'));
            return;
        }

        if (password.length < 8) {
            setError(t('password_min'));
            return;
        }

        setIsLoading(true);

        try {
            await confirmPasswordReset(uid, token, password);
            navigate('/login', { state: { message: t('reset_password_success') } });
        } catch (err) {
            setError(err.message || t('reset_password_error'));
        } finally {
            setIsLoading(false);
        }
    };

    if (!token || !uid) {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <div className={styles.invalidState}>
                        <img src="/orrin-logo.svg" alt="Orrin Logo" className="auth-logo" />
                        <h1 className={styles.invalidTitle}>{t('reset_invalid_link')}</h1>
                        <p className={styles.invalidText}>{t('reset_invalid_link_desc')}</p>
                        <Link to="/forgot-password" className="auth-button">
                            {t('request_new_link')}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <Link to="/login" className="back-to-home" aria-label={t('back_to_login')}>
                    <FaArrowLeft />
                </Link>

                <div className="auth-header">
                    <img src="/orrin-logo.svg" alt="Orrin Logo" className="auth-logo" />
                    <h1 className="auth-title">{t('reset_password_title')}</h1>
                    <p className="auth-subtitle">{t('reset_password_subtitle')}</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            {t('new_password_label')}
                        </label>
                        <input
                            type="password"
                            id="password"
                            className={`form-input ${error ? 'is-invalid' : ''}`}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">
                            {t('confirm_password_label')}
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className={`form-input ${error ? 'is-invalid' : ''}`}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={isLoading || !password || !confirmPassword}
                    >
                        {isLoading ? t('loading') : t('reset_password_submit')}
                    </button>
                </form>
            </div>
        </div>
    );
}