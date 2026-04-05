import { mockTracks } from './tracks.mock.js';
import { mockArtists } from './artists.mock.js';
import { mockSavedAlbums } from './albums.mock.js';

export const mockTopTracks = [
    mockTracks[1],
    mockTracks[0],
    mockTracks[4],
    mockTracks[6],
    mockTracks[2],
    mockTracks[5],
];

export const mockTopAlbums = [
    ...mockSavedAlbums,
    {
        id: 'salb-6',
        title: 'Gorillaz',
        artist: { id: 'artist-4', slug: 'gorillaz', name: 'Gorillaz' },
        cover: 'https://upload.wikimedia.org/wikipedia/en/b/b8/Gorillaz_-_Gorillaz.png',
        year: 2001,
        trackCount: 16,
        savedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    },
];

export const mockTopArtists = [
    {
        id: 'artist-1',
        slug: 'arctic-monkeys',
        name: 'Arctic Monkeys',
        imageUrl: 'https://images.prom.ua/3008024129_w640_h320_plakat-arctic-monkeys.jpg',
        genre: 'Indie Rock',
        role: 'Indie Rock',
    },
    {
        id: 'artist-4',
        slug: 'gorillaz',
        name: 'Gorillaz',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Gorillaz_-_Demon_Days_Live_-_20050523.jpg/800px-Gorillaz_-_Demon_Days_Live_-_20050523.jpg',
        genre: 'Alternative Rock',
        role: 'Alternative Rock',
    },
    {
        id: 'artist-2',
        slug: 'metallica',
        name: 'Metallica',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Metallica_at_The_O2_Arena_London_2008.jpg/800px-Metallica_at_The_O2_Arena_London_2008.jpg',
        genre: 'Heavy Metal',
        role: 'Heavy Metal',
    },
    {
        id: 'artist-3',
        slug: 'chase-atlantic',
        name: 'Chase Atlantic',
        imageUrl: 'https://i.pravatar.cc/400?img=15',
        genre: 'Alternative Pop',
        role: 'Alternative Pop',
    },
];