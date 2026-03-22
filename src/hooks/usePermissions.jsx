import { useAuth } from '../context/AuthContext';

export const usePermissions = () => {
    const { user, isLoggedIn } = useAuth();

    const isArtistManager = (artistSlug) => {
        if (!isLoggedIn || !user || !artistSlug) {
            return false;
        }

        const targetSlug = String(artistSlug).toLowerCase();

        // user.managed_artists is now a flat array of slugs from the backend
        const managedArtistSlugs = Array.isArray(user.managed_artists)
            ? user.managed_artists.map(slug => String(slug).toLowerCase())
            : [];

        const allManagedSlugs = new Set([...managedArtistSlugs]);

        return allManagedSlugs.has(targetSlug);
    };

    const canEditArtist = (artistSlug) => isArtistManager(artistSlug);
    const canUploadTracks = (artistSlug) => isArtistManager(artistSlug);

    return {
        isArtistManager,
        canEditArtist,
        canUploadTracks
    };
};