import { useState } from 'react';
import Header from './components/Header/Header.jsx';
import Sidebar from './components/Sidebar/Sidebar.jsx';
import TrackSection from './components/TrackSection/TrackSection.jsx';
import MusicSectionWrapper from './components/TrackSection/MusicSectionWrapper.jsx';
import { AudioPlayerProvider } from './components/AudioPlayerContext/AudioPlayerContext.jsx';
import BottomPlayer from './components/AudioPlayerContext/BottomPlayer.jsx';
import { ways } from './data';
import './App.css';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (

    <div className="AppContainer">
      <Header onMenuToggle={handleMenuToggle} />
      <AudioPlayerProvider>
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />


        <div className={`main-content ${sidebarOpen ? 'main-content--shifted' : 'main-content--full'}`}>
          <main className="main-wrapper">
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
          </main>
        </div>

        <BottomPlayer />
      </AudioPlayerProvider>
    </div>
  );
}