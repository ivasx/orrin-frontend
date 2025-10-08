import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Компоненти та Провайдери
import { AudioPlayerProvider } from './components/AudioPlayerContext/AudioPlayerContext.jsx';

// Шаблони (Layouts)
import MainLayout from './layouts/MainLayout.jsx';

// Сторінки
import RegisterPage from './pages/Auth/Register.jsx';
import LoginPage from './pages/Auth/Login.jsx';
import HomePage from './pages/HomePage/HomePage.jsx';
import FeedPage from './pages/FeedPage/FeedPage.jsx';
import LibraryPage from './pages/LibraryPage/LibraryPage.jsx';
import PlaylistsPage from './pages/PlaylistsPage/PlaylistsPage.jsx';
import FavoritesPage from './pages/FavoritesPage/FavoritesPage.jsx';
import HistoryPage from './pages/HistoryPage/HistoryPage.jsx';
import TopTracksPage from './pages/TopTracksPage/TopTracksPage.jsx';
import RadioPage from './pages/RadioPage/RadioPage.jsx';
import SettingsPage from './pages/SettingsPage/SettingsPage.jsx';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage.jsx';

import './App.css';
import HeaderOnlyLayout from './layouts/HeaderOnlyLayout.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';

export default function App() {
  return (
    <Router>
      <AudioPlayerProvider>
        <SettingsProvider>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/feed" element={<FeedPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/playlists" element={<PlaylistsPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/top" element={<TopTracksPage />} />
              <Route path="/radio" element={<RadioPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            <Route element={<HeaderOnlyLayout />}>
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </SettingsProvider>
      </AudioPlayerProvider>
    </Router>
  );
}