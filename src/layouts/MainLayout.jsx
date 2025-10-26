import {useState} from 'react';
import {Outlet} from 'react-router-dom';
import Header from '../components/Header/Header.jsx';
import Sidebar from '../components/Sidebar/Sidebar.jsx';
import {useAudioCore} from '../context/AudioCoreContext.jsx';

export default function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const {currentTrack} = useAudioCore();

    const isPlayerUiVisible = currentTrack && currentTrack.trackId !== 'song-404';

    return (
        <>
            <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)}/>
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                isPlayerVisible={isPlayerUiVisible}
            />
            <div className={`main-content ${sidebarOpen ? 'main-content--shifted' : 'main-content--full'}`}>
                <main className="main-wrapper">
                    <Outlet/>
                </main>
            </div>
        </>
    );
}