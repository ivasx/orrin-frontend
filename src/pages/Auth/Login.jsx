import {useState, useEffect, useRef} from 'react';
import {useNavigate, Link, useLocation} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {FaGoogle, FaApple, FaArrowLeft} from 'react-icons/fa';
import './Auth.css';
import {loginUser} from '../../services/api/index.js';
import {useAuth} from '../../context/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function Login() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const {login} = useAuth();
    const googleButtonRef = useRef(null);

    const [formData, setFormData] = useState({username: '', password: ''});
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const successMessage = location.state?.message ?? '';
    const from = location.state?.from?.pathname ?? '/';

    const handleGoogleResponse = async (response) => {
        setIsLoading(true);
        setServerError('');
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/v1/auth/google/login/`,
                {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({token: response.credential}),
                },
            );

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || t('login_failed_error'));
            }

            const data = await res.json();
            login(data.access, data.refresh, data.user);
            navigate(from, {replace: true});
        } catch (error) {
            setServerError(error.message || t('login_failed_error'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!GOOGLE_CLIENT_ID || !window.google) return;

        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
        });

        if (googleButtonRef.current) {
            window.google.accounts.id.renderButton(googleButtonRef.current, {
                type: 'standard',
                theme: 'outline',
                size: 'large',
                width: '100%',
            });
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setServerError('');

        try {
            const response = await loginUser(formData);
            const accessToken = response.access_token || response.access;
            const refreshToken = response.refresh_token || response.refresh;
            login(accessToken, refreshToken);
            navigate(from, {replace: true});
        } catch (error) {
            setServerError(error.message || t('login_failed_error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData((prev) => ({...prev, [e.target.name]: e.target.value}));
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <Link to="/" className="back-to-home" aria-label={t('back_to_home_aria')}>
                    <FaArrowLeft/>
                </Link>

                <div className="auth-header">
                    <img src="/orrin-logo.svg" alt="Orrin Logo" className="auth-logo"/>
                    <h1 className="auth-title">{t('login_title')}</h1>
                    <p className="auth-subtitle">
                        {t('no_account_yet')}{' '}
                        <Link to="/register" className="auth-link">{t('register_link')}</Link>
                    </p>
                </div>

                {successMessage && (
                    <p className="auth-success-message">{successMessage}</p>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username" className="form-label">
                            {t('email_label')}
                        </label>
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
                        <label htmlFor="password" className="form-label">
                            {t('password_label')}
                        </label>
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
                        <Link to="/forgot-password" className="form-label-link">
                            {t('forgot_password_link')}
                        </Link>
                    </div>

                    {serverError && (
                        <p className="error-message">{serverError}</p>
                    )}

                    <button type="submit" className="auth-button" disabled={isLoading}>
                        {isLoading ? t('loading') : t('login_button')}
                    </button>
                </form>

                <div className="social-register">
                    <div className="divider"><span>{t('login_with_divider')}</span></div>
                    <div className="social-buttons">
                        {GOOGLE_CLIENT_ID ? (
                            <div ref={googleButtonRef} style={{width: '100%'}}/>
                        ) : (
                            <button type="button" className="social-button google" disabled>
                                <FaGoogle/> Google
                            </button>
                        )}
                        <button type="button" className="social-button apple" disabled>
                            <FaApple/> Apple
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
