import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout.jsx';
import HeaderOnlyLayout from '../layouts/HeaderOnlyLayout.jsx';

import Spinner from '../components/UI/Spinner/Spinner.jsx';


const HomePage = lazy(() => import('../pages/HomePage/HomePage.jsx'));
const FeedPage = lazy(() => import('../pages/FeedPage/FeedPage.jsx'));
const LibraryPage = lazy(() => import('../pages/LibraryPage/LibraryPage.jsx'));
const FavoritesPage = lazy(() => import('../pages/FavoritesPage/FavoritesPage.jsx'));
const HistoryPage = lazy(() => import('../pages/HistoryPage/HistoryPage.jsx'));
const SettingsPage = lazy(() => import('../pages/SettingsPage/SettingsPage.jsx'));
const TrackPage = lazy(() => import('../pages/TrackPage/TrackPage.jsx'));
const SearchResultsPage = lazy(() => import('../pages/SearchResultsPage/SearchResultsPage.jsx'));
const ArtistPage = lazy(() => import('../pages/ArtistPage/ArtistPage.jsx'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage/NotFoundPage.jsx'));
const RegisterPage = lazy(() => import('../pages/Auth/Register.jsx'));
const LoginPage = lazy(() => import('../pages/Auth/Login.jsx'));

export default function AppRouter() {
    return (
        <Suspense fallback={<div className="page-loader"><Spinner /></div>}>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/feed" element={<FeedPage />} />
                    <Route path="/library" element={<LibraryPage />} />
                    <Route path="/favorites" element={<FavoritesPage />} />
                    <Route path="/history" element={<HistoryPage />} />

                    {/* TODO: [Features] Temporarily disabled. */}
                    {/* <Route path="/playlists" element={<PlaylistsPage />} /> */}
                    {/* <Route path="/top" element={<TopTracksPage />} /> */}
                    {/* <Route path="/radio" element={<RadioPage />} /> */}


                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/track/:trackId" element={<TrackPage />} />
                    <Route path="/search" element={<SearchResultsPage />} />
                    <Route path="/artist/:artistId" element={<ArtistPage />} />
                </Route>

                {/* Pages without sidebar (404) */}
                <Route element={<HeaderOnlyLayout />}>
                    <Route path="*" element={<NotFoundPage />} />
                </Route>

                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
            </Routes>
        </Suspense>
    );
}