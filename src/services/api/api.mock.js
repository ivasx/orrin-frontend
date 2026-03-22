import {
    mockTracks, mockArtists, mockPosts, mockUsers, mockNotifications
} from '../../data/mockData.js';

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const getTracks = async () => {
    await delay();
    return mockTracks;
};

export const getTracksByIds = async (trackIds = []) => {
    await delay();
    return mockTracks.filter(t => trackIds.includes(t.id));
};

export const getTrackBySlug = async (slug) => {
    await delay();
    const track = mockTracks.find(t => t.slug === slug);
    if (!track) throw new Error('Track not found');
    return track;
};

export const getUserLibrary = async () => {
    await delay();
    return mockTracks; // Для тесту повертаємо всі треки як бібліотеку
};

export const getUserFavorites = async () => {
    await delay();
    return mockTracks.filter(t => t.isLiked);
};

export const getUserHistory = async () => {
    await delay();
    return [...mockTracks].reverse(); // Імітація історії
};

export const getArtists = async () => {
    await delay();
    return mockArtists;
};

export const getArtistById = async (slugOrId) => {
    await delay();
    const artist = mockArtists.find(a => a.id === slugOrId || a.slug === slugOrId);
    if (!artist) throw new Error('Artist not found');
    return artist;
};

export const getFeedPosts = async () => {
    await delay(800);
    return mockPosts;
};

export const getCurrentUser = async () => {
    await delay();
    return mockUsers.find(u => u.username === 'ivas') || mockUsers[0];
};

export const getUserProfile = async (username) => {
    await delay();
    const user = mockUsers.find(u => u.username === username);
    if (!user) throw new Error('User not found');
    return user;
};

export const searchGlobal = async (query) => {
    await delay();
    const q = query.toLowerCase();
    return {
        tracks: mockTracks.filter(t => t.title.toLowerCase().includes(q)),
        artists: mockArtists.filter(a => a.name.toLowerCase().includes(q))
    };
};

export const getNotifications = async () => {
    await delay();
    return mockNotifications;
};

export const createPost = async (postData) => { await delay(); return { success: true }; };
export const toggleLikePost = async () => { await delay(); return { success: true }; };
export const toggleFollowUser = async () => { await delay(); return { success: true }; };