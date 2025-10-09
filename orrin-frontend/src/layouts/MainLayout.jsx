import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header/Header.jsx';
import Sidebar from '../components/Sidebar/Sidebar.jsx';
import BottomPlayer from '../components/AudioPlayerContext/BottomPlayer.jsx';
import { useAudioPlayer } from '../components/AudioPlayerContext/AudioPlayerContext.jsx';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { currentTrack } = useAudioPlayer();

    return (
        <div className="AppContainer">
            <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                isPlayerVisible={!!currentTrack}
            />
            <div className={`main-content ${sidebarOpen ? 'main-content--shifted' : 'main-content--full'}`}>
                <main className="main-wrapper">
                    <Outlet />
                </main>
            </div>
            <BottomPlayer />
        </div>
    );
}