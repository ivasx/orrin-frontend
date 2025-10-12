// src/App.jsx
import { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Компоненти та Провайдери
import { AudioPlayerProvider, useAudioPlayer } from './context/AudioPlayerContext.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import HeaderOnlyLayout from './layouts/HeaderOnlyLayout.jsx';
import BottomPlayer from './components/BottomPlayer/BottomPlayer.jsx';

// Сторінки
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
import RegisterPage from './pages/Auth/Register.jsx';
import LoginPage from './pages/Auth/Login.jsx';

import './App.css';

function AppContent() {
    const { currentTrack } = useAudioPlayer();
    const playerRef = useRef(null);

    useEffect(() => {
        const playerElement = playerRef.current;
        if (!playerElement) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const height = entry.contentRect.height;
                document.documentElement.style.setProperty('--player-height', `${height}px`);
            }
        });
        resizeObserver.observe(playerElement);
        return () => resizeObserver.disconnect();
    }, [currentTrack]);

    const isPlayerUiVisible = currentTrack && currentTrack.trackId !== 'song-404';

    return (
        <div className={`AppContainer ${isPlayerUiVisible ? 'player-visible' : ''}`}>
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
            </Routes>

            <BottomPlayer ref={playerRef} />
        </div>
    );
}

export default function App() {
    return (
        <Router>
            <AudioPlayerProvider>
                <SettingsProvider>
                    <AppContent />
                </SettingsProvider>
            </AudioPlayerProvider>
        </Router>
    );
}