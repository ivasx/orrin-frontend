import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaGoogle, FaApple, FaArrowLeft } from 'react-icons/fa';
import './Auth.css';

export default function Login() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Login attempt with:', formData);
    };

    const handleSocialLogin = (provider) => {
        console.log(`Login with ${provider}`);
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
                            type="email"
                            id="email"
                            name="email"
                            className="form-input"
                            placeholder={t('email_placeholder')}
                            value={formData.email}
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

                    <button type="submit" className="auth-button">
                        {t('login_button')}
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