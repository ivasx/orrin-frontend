import PropTypes from 'prop-types';
import { usePermissions } from '../../../hooks/usePermissions';

export const RequirePermission = ({
                                      artistId,
                                      children,
                                      fallback = null
                                  }) => {
    const { isArtistManager } = usePermissions();

    if (artistId && isArtistManager(artistId)) {
        return children;
    }

    return fallback;
};

RequirePermission.propTypes = {
    artistId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    children: PropTypes.node.isRequired,
    fallback: PropTypes.node
};