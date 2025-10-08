import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

export default function Register() {
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
      alert('Паролі не співпадають!');
      return;
    }

    // Тут буде інтеграція з DRF API
    console.log('Register:', formData);

    // Після успішної реєстрації:
    // navigate('/login');
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
          <h1 className="auth-title">Реєстрація в Orrin</h1>
          <p className="auth-subtitle">Створіть свій акаунт</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Ім'я користувача
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-input"
              placeholder="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Пароль
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
              Підтвердіть пароль
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
            Зареєструватися
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-footer-text">
            Вже маєте акаунт?{' '}
            <Link to="/login" className="auth-link">
              Увійти
            </Link>
          </p>
        </div>

        <button
          className="back-home-button"
          onClick={() => navigate('/')}
        >
          ← Повернутися на головну
        </button>
      </div>
    </div>
  );
}