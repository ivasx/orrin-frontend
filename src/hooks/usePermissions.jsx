import { useAuth } from '../context/AuthContext';

export const usePermissions = () => {
    const { user, isLoggedIn } = useAuth();

    const isArtistManager = (artistId) => {
        if (!isLoggedIn || !user) {
            return false;
        }

        const targetId = String(artistId);

        const managedArtistIds = Array.isArray(user.managed_artists)
            ? user.managed_artists.map(artist =>
                typeof artist === 'object' ? String(artist.id) : String(artist)
            )
            : [];

        const bandMembershipIds = Array.isArray(user.band_memberships)
            ? user.band_memberships.map(membership =>
                typeof membership.band === 'object' ? String(membership.band.id) : String(membership.band)
            )
            : [];

        const allManagedIds = new Set([...managedArtistIds, ...bandMembershipIds]);

        return allManagedIds.has(targetId);
    };

    const canEditArtist = (artistId) => {
        return isArtistManager(artistId);
    };

    const canUploadTracks = (artistId) => {
        return isArtistManager(artistId);
    };

    return {
        isArtistManager,
        canEditArtist,
        canUploadTracks
    };
};