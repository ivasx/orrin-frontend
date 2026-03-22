import PropTypes from 'prop-types';
import { usePermissions } from '../../../hooks/usePermissions';

export const RequirePermission = ({
                                      artistSlug,
                                      children,
                                      fallback = null
                                  }) => {
    const { isArtistManager } = usePermissions();

    if (artistSlug && isArtistManager(artistSlug)) {
        return children;
    }

    return fallback;
};

RequirePermission.propTypes = {
    artistSlug: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    fallback: PropTypes.node
};