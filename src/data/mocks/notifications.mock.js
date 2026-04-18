const minutesAgo = (m) => new Date(Date.now() - m * 60 * 1000).toISOString();
const hoursAgo   = (h) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
const daysAgo    = (d) => new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();

export const mockNotifications = [
    {
        id: 'notif-1',
        type: 'NEW_FOLLOWER',
        isRead: false,
        timestamp: minutesAgo(8),
        actor: {
            id: 'user-1',
            name: 'Alex Mercer',
            avatarUrl: 'https://i.pravatar.cc/150?img=11',
        },
        entity: null,
    },
    {
        id: 'notif-2',
        type: 'LIKE_TRACK',
        isRead: false,
        timestamp: minutesAgo(34),
        actor: {
            id: 'user-2',
            name: 'Katya Voloshyn',
            avatarUrl: 'https://i.pravatar.cc/150?img=47',
        },
        entity: {
            id: 'track-1',
            title: '505',
            coverUrl: 'https://www.muztonic.com/images/albums/AM.jpg',
        },
    },
    {
        id: 'notif-3',
        type: 'NEW_RELEASE',
        isRead: false,
        timestamp: hoursAgo(2),
        actor: {
            id: 'artist-1',
            name: 'Arctic Monkeys',
            avatarUrl: 'https://images.prom.ua/3008024129_w640_h320_plakat-arctic-monkeys.jpg',
        },
        entity: {
            id: 'alb-7',
            title: 'The Car',
            coverUrl: 'https://upload.wikimedia.org/wikipedia/en/0/00/The_Car_Arctic_Monkeys.png',
        },
    },
    {
        id: 'notif-4',
        type: 'PLAYLIST_ADD',
        isRead: true,
        timestamp: hoursAgo(6),
        actor: {
            id: 'user-3',
            name: 'Ivan Kovalchuk',
            avatarUrl: 'https://i.pravatar.cc/150?img=53',
        },
        entity: {
            id: 'pl-3',
            title: 'Sheffield Classics',
            coverUrl: 'https://images.prom.ua/3008024129_w640_h320_plakat-arctic-monkeys.jpg',
        },
    },
    {
        id: 'notif-5',
        type: 'LIKE_TRACK',
        isRead: true,
        timestamp: daysAgo(1),
        actor: {
            id: 'user-3',
            name: 'Ivan Kovalchuk',
            avatarUrl: 'https://i.pravatar.cc/150?img=53',
        },
        entity: {
            id: 'track-3',
            title: 'Master of Puppets',
            coverUrl: 'https://upload.wikimedia.org/wikipedia/ru/a/a4/Metallica_-_Master_of_Puppets.jpg',
        },
    },
    {
        id: 'notif-6',
        type: 'NEW_FOLLOWER',
        isRead: true,
        timestamp: daysAgo(2),
        actor: {
            id: 'user-2',
            name: 'Katya Voloshyn',
            avatarUrl: 'https://i.pravatar.cc/150?img=47',
        },
        entity: null,
    },
    {
        id: 'notif-7',
        type: 'NEW_RELEASE',
        isRead: true,
        timestamp: daysAgo(3),
        actor: {
            id: 'artist-4',
            name: 'Gorillaz',
            avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Gorillaz_-_Demon_Days_Live_-_20050523.jpg/800px-Gorillaz_-_Demon_Days_Live_-_20050523.jpg',
        },
        entity: {
            id: 'alb-18',
            title: 'Song Machine, Season One',
            coverUrl: 'https://upload.wikimedia.org/wikipedia/en/8/8f/Gorillaz_-_Song_Machine%2C_Season_One.png',
        },
    },
    {
        id: 'notif-8',
        type: 'PLAYLIST_ADD',
        isRead: false,
        timestamp: hoursAgo(1),
        actor: {
            id: 'user-1',
            name: 'Alex Mercer',
            avatarUrl: 'https://i.pravatar.cc/150?img=11',
        },
        entity: {
            id: 'pl-4',
            title: 'Heavy Rotation',
            coverUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&q=80',
        },
    },
];