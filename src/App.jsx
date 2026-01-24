import { useEffect, useRef } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

// Contexts
import { QueueProvider } from './context/QueueContext.jsx';
import { PlayerUIProvider } from './context/PlayerUIContext.jsx';
import { AudioCoreProvider, useAudioCore } from './context/AudioCoreContext.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';

// Components
import BottomPlayer from './components/Layout/BottomPlayer/BottomPlayer.jsx';
import ErrorBoundary from './components/UI/ErrorBoundary/ErrorBoundary.jsx';
import AppRouter from './routes/AppRouter.jsx';

import './App.css';

function AppLayout() {
    const { currentTrack } = useAudioCore();
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

    const isPlayerUiVisible = !!currentTrack;

    return (
        <div className={`AppContainer ${isPlayerUiVisible ? 'player-visible' : ''}`}>
            <AppRouter />

            <ErrorBoundary>
                <BottomPlayer ref={playerRef} />
            </ErrorBoundary>
        </div>
    );
}

export default function App() {
    return (
        <Router>
            <ErrorBoundary>
                <SettingsProvider>
                    <QueueProvider>
                        <PlayerUIProvider>
                            <AudioCoreProvider>
                                <AppLayout />
                            </AudioCoreProvider>
                        </PlayerUIProvider>
                    </QueueProvider>
                </SettingsProvider>
            </ErrorBoundary>
        </Router>
    );
}