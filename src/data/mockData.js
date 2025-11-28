export const mockPosts = [
    {
        id: 'post-1',
        author: {
            id: 'user-1',
            name: 'Саша Рояль',
            avatar: 'https://static-cdn.jtvnw.net/jtv_user_pictures/fa82070b-d5dc-4044-bf2b-cef510e3a3e9-profile_image-300x300.png',
            isVerified: true,
            isArtist: false
        },
        text: 'життя дивна і не зрозуміла штука, але все таки це схоже на шанс',
        attachedTrack: {
            trackId: '505-arctic-monkeys',
            title: '505',
            artist: 'Arctic Monkeys',
            cover: 'http://localhost:8000/media/images/covers/505_lLpURud.jpg',
            audio: 'http://localhost:8000/media/audio/505_-_Arctic_Monkeys.m4a'
        },
        timestamp: '2 год тому',
        fullTimestamp: '10 листопада 2024, 14:30',
        likesCount: 234,
        commentsCount: 45,
        repostsCount: 12,
        isLiked: false,
        comments: [
            {
                id: 'comment-1',
                author: {
                    name: 'пепсікола',
                    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWDLsr2qfDnWLnsvaoh8d9bp25hfhJpSpkPA&s'
                },
                text: 'ех 505',
                timestamp: '1 год тому',
                likesCount: 5
            }
        ]
    },
];

export const mockUsers = [
    {
        id: 'user-1',
        name: 'Саша Рояль',
        username: 'sasuk',
        avatar: 'https://static-cdn.jtvnw.net/jtv_user_pictures/fa82070b-d5dc-4044-bf2b-cef510e3a3e9-profile_image-300x300.png',
        isVerified: true,
        isArtist: false,
        followersCount: 15420,
        followingCount: 234
    },

];