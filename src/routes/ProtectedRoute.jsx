import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import VinylLoader from '../components/UI/Spinner/VinylLoader';

export const ProtectedRoute = ({ requireArtistManagement = false }) => {
    const { isLoggedIn, isLoading } = useAuth();
    const { isArtistManager } = usePermissions();
    const location = useLocation();

    if (isLoading) {
        return <VinylLoader />;
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requireArtistManagement) {
        return <ArtistManagementGuard isArtistManager={isArtistManager} />;
    }

    return <Outlet />;
};

function ArtistManagementGuard({ isArtistManager }) {
    const { artistSlug } = useParams();

    if (!artistSlug || !isArtistManager(artistSlug)) {
        return <Navigate to={artistSlug ? `/artist/${artistSlug}` : '/'} replace />;
    }

    return <Outlet />;
}

ArtistManagementGuard.propTypes = {
    isArtistManager: PropTypes.func.isRequired,
};

ProtectedRoute.propTypes = {
    requireArtistManagement: PropTypes.bool,
};