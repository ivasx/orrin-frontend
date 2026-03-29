import { useState, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Layout/Header/Header.jsx';
import Sidebar from '../components/Layout/Sidebar/Sidebar.jsx';
import { useAudioCore } from '../context/AudioCoreContext.jsx';
import { usePlayerUI, MINI_PLAYER_PADDING } from '../context/PlayerUIContext.jsx';

export default function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { currentTrack } = useAudioCore();
    const { isPlayerCollapsed } = usePlayerUI();
    const isPlayerUiVisible = Boolean(currentTrack) && currentTrack.trackId !== 'song-404';

    /**
     * Compute the inline style for the scrollable content wrapper.
     *
     * We use an inline style rather than toggling class names so that the exact
     * numeric value from the context constant is the single source of truth —
     * no risk of the CSS constant and the JS constant drifting apart.
     *
     * When the full bar is visible the existing `.player-visible .main-wrapper`
     * rule in App.css already sets `padding-bottom: var(--player-height)` via
     * the ResizeObserver-driven CSS custom property. We only need to override
     * that value when the bar is *collapsed* (mini-player pill mode), where the
     * pill's footprint is smaller than the full bar height.
     *
     * Specificity note: inline styles always win over class-based rules, so
     * this safely overrides the App.css rule in the collapsed case.
     */
    const mainWrapperStyle = useMemo(() => {
        if (!isPlayerUiVisible) {
            // No player at all — remove any bottom padding.
            return { paddingBottom: 0 };
        }

        if (isPlayerCollapsed) {
            return {
                paddingBottom: `${MINI_PLAYER_PADDING}px`,
                transition: 'padding-bottom 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            };
        }

        return {
            paddingBottom: 'var(--player-height, 84px)',
            transition: 'padding-bottom 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        };
    }, [isPlayerUiVisible, isPlayerCollapsed]);

    return (
        <>
            <Header onMenuToggle={() => setSidebarOpen(prev => !prev)} />

            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                isPlayerVisible={isPlayerUiVisible}
            />

            <div
                className={`main-content ${sidebarOpen ? 'main-content--shifted' : 'main-content--full'}`}
            >
                <main className="main-wrapper" style={mainWrapperStyle}>
                    <Outlet />
                </main>
            </div>
        </>
    );
}