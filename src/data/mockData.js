export const mockArtists = [
    {
        id: 'artist-1',
        slug: 'arctic-monkeys',
        name: 'Arctic Monkeys',
        avatar: 'https://i.scdn.co/image/ab6761610000e5eb7da39dea0a72f581535fb11f',
        bio: 'English rock band formed in Sheffield in 2002.',
        followersCount: 15400000,
        isVerified: true,
    },
    {
        id: 'artist-2',
        slug: 'metallica',
        name: 'Metallica',
        avatar: 'https://i.scdn.co/image/ab6761610000e5eb8101d13bdd630b0889d93366',
        bio: 'American heavy metal band.',
        followersCount: 24500000,
        isVerified: true,
    }
];

export const mockTracks = [
    {
        id: 'track-1',
        slug: '505-arctic-monkeys',
        title: '505',
        artist: mockArtists[0],
        cover: 'https://i.scdn.co/image/ab67616d0000b2734ae1c4c5c45aabe565499163',
        audio: 'http://localhost:8000/media/audio/505.m4a', // Замініть на реальний тестовий файл
        duration: 253,
        playsCount: 1205000,
        isLiked: true,
    },
    {
        id: 'track-2',
        slug: 'nothing-else-matters',
        title: 'Nothing Else Matters',
        artist: mockArtists[1],
        cover: 'https://i.scdn.co/image/ab67616d0000b273e1641d401a581e285b01ce4d',
        audio: 'http://localhost:8000/media/audio/nothing.m4a',
        duration: 388,
        playsCount: 3500000,
        isLiked: false,
    }
];

export const mockUsers = [
    {
        id: 'user-1',
        name: 'Саша Рояль',
        username: 'sasuk',
        avatarUrl: 'https://static-cdn.jtvnw.net/jtv_user_pictures/fa82070b-d5dc-4044-bf2b-cef510e3a3e9-profile_image-300x300.png',
        bio: 'Слухаю рок та інді.',
        isVerified: true,
        isArtist: false,
        followersCount: 15420,
        followingCount: 234,
        isFollowing: false
    },
    {
        id: 'user-2',
        name: 'Іван Амброзяк',
        username: 'ivas',
        avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
        bio: 'Software Engineer & Music Lover',
        isVerified: false,
        isArtist: false,
        followersCount: 120,
        followingCount: 50,
        isFollowing: true
    }
];

export const mockPosts = [
    {
        id: 'post-1',
        author: mockUsers[0],
        text: 'життя дивна і не зрозуміла штука, але все таки це схоже на шанс',
        attachedTrack: mockTracks[0],
        timestamp: '2 год тому',
        fullTimestamp: '10 листопада 2024, 14:30',
        likesCount: 234,
        commentsCount: 45,
        repostsCount: 12,
        isLiked: false,
        comments: [
            {
                id: 'comment-1',
                author: { name: 'пепсікола', avatarUrl: 'https://example.com/pepsi.jpg' },
                text: 'ех 505',
                timestamp: '1 год тому',
                likesCount: 5
            }
        ]
    }
];

export const mockNotifications = [
    {
        id: 'notif-1',
        type: 'like',
        user: mockUsers[0],
        text: 'вподобав ваш допис',
        isRead: false,
        timestamp: '5 хв тому'
    },
    {
        id: 'notif-2',
        type: 'follow',
        user: mockUsers[1],
        text: 'почав стежити за вами',
        isRead: true,
        timestamp: '1 день тому'
    }
];