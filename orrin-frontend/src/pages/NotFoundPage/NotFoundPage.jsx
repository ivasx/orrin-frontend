import { useEffect } from 'react';
import './NotFoundPage.css';
import { Link } from 'react-router-dom';
import sadCat from '../../assets/orrin-404.png';


export default function NotFoundPage() {
  useEffect(() => {
    // Коли компонент з'являється на екрані, забороняємо скрол
    document.body.style.overflow = 'hidden';

    // Коли компонент зникає, повертаємо скрол назад.
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <p className="not-found-subtitle">Ой! Сторінку не знайдено</p>
        <h1 className="not-found-title">
          4
          <img src={sadCat} alt="Crying Cat" className="not-found-cat" />
          4
        </h1>
        <p className="not-found-text">На жаль, Orrin не зміг знайти те, що ви шукали.</p>
        <Link to="/" className="not-found-button">
          Повернутись на головну
        </Link>
      </div>
    </div>
  );
}