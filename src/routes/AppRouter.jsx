import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout.jsx';
import HeaderOnlyLayout from '../layouts/HeaderOnlyLayout.jsx';
import VinylLoader from '../components/UI/Spinner/VinylLoader.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';

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
const ForgotPassword = lazy(() => import('../pages/Auth/ForgotPassword.jsx'));
const ResetPassword = lazy(() => import('../pages/Auth/ResetPassword.jsx'));
const UserProfilePage = lazy(() => import('../pages/UserProfilePage/UserProfilePage.jsx'));

// Placeholder export for artist management view
const ArtistDashboardPage = lazy(() => import('../pages/ArtistDashboardPage/ArtistDashboardPage.jsx'));

export default function AppRouter() {
    return (
        <Suspense fallback={<VinylLoader />}>
            <Routes>
                <Route element={<MainLayout />}>
                    {/* Publicly Accessible Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/feed" element={<FeedPage />} />
                    <Route path="/track/:trackId" element={<TrackPage />} />
                    <Route path="/search" element={<SearchResultsPage />} />
                    <Route path="/artist/:artistSlug" element={<ArtistPage />} />
                    <Route path="/user/:userId" element={<UserProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    
                    {/* Standard Authenticated Routes */}
                    <Route element={<ProtectedRoute requireArtistManagement={false} />}>
                        <Route path="/library" element={<LibraryPage />} />
                        <Route path="/favorites" element={<FavoritesPage />} />
                        <Route path="/history" element={<HistoryPage />} />
                    </Route>

                    {/* Artist Manager Protected Routes (Resource-Based Auth) */}
                    <Route element={<ProtectedRoute requireArtistManagement={true} />}>
                        <Route path="/artist/:artistSlug/manage" element={<ArtistDashboardPage />} />
                        <Route path="/artist/:artistSlug/upload" element={<ArtistDashboardPage />} />
                    </Route>
                </Route>

                {/* Pages without sidebar (404) */}
                <Route element={<HeaderOnlyLayout />}>
                    <Route path="*" element={<NotFoundPage />} />
                </Route>

                {/* Auth Routes */}
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
        </Suspense>
    );
}