import { useEffect, useRef } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import { AppProviders } from './context/AppProviders.jsx';
import { useAudioCore } from './context/AudioCoreContext.jsx';

import BottomPlayer from './components/Layout/BottomPlayer/BottomPlayer.jsx';
import ErrorBoundary from './components/UI/ErrorBoundary/ErrorBoundary.jsx';
import AppRouter from './routes/AppRouter.jsx';

import './App.css';

function AppLayout() {
    const { currentTrack } = useAudioCore();
    const playerRef = useRef(null);

    const isPlayerUiVisible = Boolean(currentTrack);

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
    }, [isPlayerUiVisible]);

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
                <AppProviders>
                    <AppLayout />
                </AppProviders>
            </ErrorBoundary>
        </Router>
    );
}