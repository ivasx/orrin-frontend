import { useState } from 'react';
import { Outlet } from 'react-router-dom'; // <--- Імпортуємо Outlet
import Header from '../components/Header/Header.jsx';
import Sidebar from '../components/Sidebar/Sidebar.jsx';
import BottomPlayer from '../components/AudioPlayerContext/BottomPlayer.jsx';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="AppContainer">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={`main-content ${sidebarOpen ? 'main-content--shifted' : 'main-content--full'}`}>
        <main className="main-wrapper">
          <Outlet />
        </main>
      </div>
      <BottomPlayer />
    </div>
  );
}