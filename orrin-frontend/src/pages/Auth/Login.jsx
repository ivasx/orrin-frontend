import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

export default function Login() {
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

  // Відправка на бекенд
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //
  //   try {
  //     const response = await fetch('http://localhost:8000/api/auth/login/', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(formData)
  //     });
  //
  //     const data = await response.json();
  //
  //     if (response.ok) {
  //       // Зберегти токен
  //       localStorage.setItem('token', data.token);
  //       navigate('/');
  //     }
  //   } catch (error) {
  //     console.error('Login error:', error);
  //   }
  // };

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
          <h1 className="auth-title">Вхід в Orrin</h1>
          <p className="auth-subtitle">Ласкаво просимо назад!</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
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

          <button type="submit" className="auth-button">
            Увійти
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-footer-text">
            Ще не маєте акаунту?{' '}
            <Link to="/register" className="auth-link">
              Зареєструватися
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