import {useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import './Auth.css';
import {useTranslation} from 'react-i18next';

export default function Register() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert(t('passwords_do_not_match'));
            return;
        }

        console.log('Register:', formData);
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
                    <h1 className="auth-title">{t('register_title')}</h1>
                    <p className="auth-subtitle">{t('register_subtitle')}</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username" className="form-label">
                            {t('username_label')}
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            className="form-input"
                            placeholder={t('username_placeholder')}
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

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

                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">
                            {t('confirm_password_label')}
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            className="form-input"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="auth-button">
                        {t('register_button')}
                    </button>
                </form>

                <div className="auth-footer">
                    <p className="auth-footer-text">
                        {t('already_have_account')}{' '}
                        <Link to="/login" className="auth-link">
                            {t('login_link')}
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