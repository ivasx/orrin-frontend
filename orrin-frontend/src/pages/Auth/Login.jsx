import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';
import { useTranslation } from 'react-i18next';

export default function Login() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Login:', formData);
        // Після успішного логіну:
        // navigate('/');
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
                <div className="auth-header">
                    <h1 className="auth-title">{t('login_title')}</h1>
                    <p className="auth-subtitle">{t('login_subtitle')}</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            {t('email_label')}
                        </label>
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
                    </div>

                    <button type="submit" className="auth-button">
                        {t('login_link')}
                    </button>
                </form>

                <div className="auth-footer">
                    <p className="auth-footer-text">
                        {t('no_account_yet')}{' '}
                        <Link to="/register" className="auth-link">
                            {t('register_link')}
                        </Link>
                    </p>
                </div>

                <button
                    className="back-home-button"
                    onClick={() => navigate('/')}
                >
                    {t('back_to_home')}
                </button>
            </div>
        </div>
    );
}