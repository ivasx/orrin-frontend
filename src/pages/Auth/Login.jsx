import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaGoogle, FaApple, FaArrowLeft } from 'react-icons/fa';
import './Auth.css';
import { loginUser } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setServerError('');

        try {
            const response = await loginUser(formData);
            const accessToken = response.access_token || response.access;
            const refreshToken = response.refresh_token || response.refresh;

            login(accessToken, refreshToken);
            navigate(from, { replace: true });
        } catch (error) {
            setServerError(error.message || t('login_failed_error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = (provider) => {
        window.location.href = `/api/v1/auth/${provider.toLowerCase()}/login/`;
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <Link to="/" className="back-to-home" aria-label={t('back_to_home_aria')}>
                    <FaArrowLeft />
                </Link>

                <div className="auth-header">
                    <img src="/orrin-logo.svg" alt="Orrin Logo" className="auth-logo" />
                    <h1 className="auth-title">{t('login_title')}</h1>
                    <p className="auth-subtitle">
                        {t('no_account_yet')}{' '}
                        <Link to="/register" className="auth-link">{t('register_link')}</Link>
                    </p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">{t('email_label')}</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            className="form-input"
                            placeholder={t('email_or_username_placeholder')}
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">{t('password_label')}</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {serverError && <div className="error-message server-error" style={{ marginBottom: '1rem' }}>{serverError}</div>}

                    <button type="submit" className="auth-button" disabled={isLoading}>
                        {isLoading ? t('loading') : t('login_button')}
                    </button>
                </form>

                <div className="social-register">
                    <div className="divider"><span>{t('login_with_divider')}</span></div>
                    <div className="social-buttons">
                        <button className="social-button google" onClick={() => handleSocialLogin('Google')}>
                            <FaGoogle /> Google
                        </button>
                        <button className="social-button apple" onClick={() => handleSocialLogin('Apple')}>
                            <FaApple /> Apple
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}