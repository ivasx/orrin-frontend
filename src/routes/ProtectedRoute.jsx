import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import VinylLoader from '../components/UI/Spinner/VinylLoader';

export const ProtectedRoute = ({
                                   requireArtistManagement = false
                               }) => {
    const { isLoggedIn, isLoading } = useAuth();
    const { isArtistManager } = usePermissions();
    const location = useLocation();
    const { artistId } = useParams();

    if (isLoading) {
        return <VinylLoader />;
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requireArtistManagement && artistId) {
        if (!isArtistManager(artistId)) {
            return <Navigate to={`/artist/${artistId}`} replace />;
        }
    }

    return <Outlet />;
};

ProtectedRoute.propTypes = {
    requireArtistManagement: PropTypes.bool
};