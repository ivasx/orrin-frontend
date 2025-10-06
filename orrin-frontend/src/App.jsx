import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header/Header.jsx';
import Sidebar from './components/Sidebar/Sidebar.jsx';
import TrackSection from './components/TrackSection/TrackSection.jsx';
import MusicSectionWrapper from './components/TrackSection/MusicSectionWrapper.jsx';
import { AudioPlayerProvider } from './components/AudioPlayerContext/AudioPlayerContext.jsx';
import BottomPlayer from './components/AudioPlayerContext/BottomPlayer.jsx';
import { ways } from './data';
import './App.css';

// Компонент для головної сторінки
function HomePage() {
  return (
    <>
      <MusicSectionWrapper spacing="top-only">
        <TrackSection
          title="Слухати зараз"
          tracks={ways}
          onMoreClick={() => console.log('Більше натиснуто')}
        />
      </MusicSectionWrapper>
      <MusicSectionWrapper spacing="top-only">
        <TrackSection
          title="Популярні виконавці"
          tracks={ways}
          onMoreClick={() => console.log('Більше натиснуто')}
        />
      </MusicSectionWrapper>
    </>
  );
}

// Компонент для стрічки
function FeedPage() {
  return (
    <MusicSectionWrapper spacing="top-only">
      <TrackSection
        title="Ваша стрічка"
        tracks={ways}
        onMoreClick={() => console.log('Більше натиснуто')}
      />
    </MusicSectionWrapper>
  );
}

// Компонент для бібліотеки
function LibraryPage() {
  return (
    <MusicSectionWrapper spacing="top-only">
      <TrackSection
        title="Ваша бібліотека"
        tracks={ways}
        onMoreClick={() => console.log('Більше натиснуто')}
      />
    </MusicSectionWrapper>
  );
}

// Компонент для плейлістів
function PlaylistsPage() {
  return (
    <MusicSectionWrapper spacing="top-only">
      <TrackSection
        title="Мої плейлісти"
        tracks={ways}
        onMoreClick={() => console.log('Більше натиснуто')}
      />
    </MusicSectionWrapper>
  );
}

// Компонент для улюбленого
function FavoritesPage() {
  return (
    <MusicSectionWrapper spacing="top-only">
      <TrackSection
        title="Улюблені треки"
        tracks={ways}
        onMoreClick={() => console.log('Більше натиснуто')}
      />
    </MusicSectionWrapper>
  );
}

// Компонент для історії
function HistoryPage() {
  return (
    <MusicSectionWrapper spacing="top-only">
      <TrackSection
        title="Історія прослуховування"
        tracks={ways}
        onMoreClick={() => console.log('Більше натиснуто')}
      />
    </MusicSectionWrapper>
  );
}

// Компонент для топ треків
function TopTracksPage() {
  return (
    <MusicSectionWrapper spacing="top-only">
      <TrackSection
        title="Топ треки"
        tracks={ways}
        onMoreClick={() => console.log('Більше натиснуто')}
      />
    </MusicSectionWrapper>
  );
}

// Компонент для радіо
function RadioPage() {
  return (
    <MusicSectionWrapper spacing="top-only">
      <TrackSection
        title="Радіо"
        tracks={ways}
        onMoreClick={() => console.log('Більше натиснуто')}
      />
    </MusicSectionWrapper>
  );
}

// Компонент для налаштувань
function SettingsPage() {
  return (
    <MusicSectionWrapper spacing="top-only">
      <div style={{ padding: '20px' }}>
        <h1>Налаштування</h1>
        <p>Тут будуть налаштування додатку</p>
      </div>
    </MusicSectionWrapper>
  );
}

// Основний Layout компонент
function Layout({ sidebarOpen, setSidebarOpen }) {
  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="AppContainer">
      <Header onMenuToggle={handleMenuToggle} />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className={`main-content ${sidebarOpen ? 'main-content--shifted' : 'main-content--full'}`}>
        <main className="main-wrapper">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/playlists" element={<PlaylistsPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/top" element={<TopTracksPage />} />
            <Route path="/radio" element={<RadioPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <BottomPlayer />
    </div>
  );
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Router>
      <AudioPlayerProvider>
        <Layout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </AudioPlayerProvider>
    </Router>
  );
}