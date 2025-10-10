import { useState, useRef, useEffect } from 'react';
import {Outlet} from 'react-router-dom';
import Header from '../components/Header/Header.jsx';
import Sidebar from '../components/Sidebar/Sidebar.jsx';
import BottomPlayer from '../components/BottomPlayer/BottomPlayer.jsx';
import {useAudioPlayer} from '../context/AudioPlayerContext.jsx';

export default function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const {currentTrack} = useAudioPlayer();
    const containerClassName = `AppContainer ${currentTrack ? 'player-visible' : ''}`;
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


    return (
        <div className={containerClassName}>
            <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)}/>
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                isPlayerVisible={!!currentTrack}
            />
            <div className={`main-content ${sidebarOpen ? 'main-content--shifted' : 'main-content--full'}`}>
                <main className="main-wrapper">
                    <Outlet/>
                </main>
            </div>
            <BottomPlayer ref={playerRef} />
        </div>
    );
}