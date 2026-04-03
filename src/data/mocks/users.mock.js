export const mockUsers = [
    {
        id: 'user-1', pk: 1,
        username: 'alex_rocks', first_name: 'Alex', last_name: 'Mercer', name: 'Alex Mercer',
        avatar: 'https://i.pravatar.cc/150?img=11',
        bio: 'Music junkie | Indie & Metal collector | Sheffield represent',
        location: 'Sheffield, UK', website: 'https://alexmercer.dev',
        is_verified: true, is_artist: false,
        followers_count: 1542, following_count: 234, is_following: false,
        managed_artists: [],
    },
    {
        id: 'user-2', pk: 2,
        username: 'katya_music', first_name: 'Katya', last_name: 'Voloshyn', name: 'Katya Voloshyn',
        avatar: 'https://i.pravatar.cc/150?img=47',
        bio: 'Finding beauty in every chord | UA',
        location: 'Kyiv, Ukraine', website: null,
        is_verified: false, is_artist: false,
        followers_count: 320, following_count: 180, is_following: true,
        managed_artists: [],
    },
    {
        id: 'user-3', pk: 3,
        username: 'metal_ivan', first_name: 'Ivan', last_name: 'Kovalchuk', name: 'Ivan Kovalchuk',
        avatar: 'https://i.pravatar.cc/150?img=53',
        bio: 'Thrash metal till I die | 30 years of headbanging',
        location: 'Lviv, Ukraine', website: 'https://metalzone.ua',
        is_verified: false, is_artist: false,
        followers_count: 887, following_count: 421, is_following: false,
        managed_artists: [],
    },
    {
        id: 'user-4', pk: 4,
        username: 'orrin_demo', first_name: 'Demo', last_name: 'User', name: 'Demo User',
        avatar: 'https://i.pravatar.cc/150?img=32',
        bio: 'Testing Orrin. All genres welcome.',
        location: 'Lviv, Ukraine', website: null,
        is_verified: false, is_artist: false,
        followers_count: 12, following_count: 44, is_following: false,
        managed_artists: ['arctic-monkeys'],
    },
];

export const mockUserProfiles = {
    'alex_rocks':  { ...mockUsers[0], cover_photo: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80', followers_count: 1542, following_count: 234, is_following: false },
    'katya_music': { ...mockUsers[1], cover_photo: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200&q=80', followers_count: 320,  following_count: 180, is_following: true  },
    'metal_ivan':  { ...mockUsers[2], cover_photo: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&q=80', followers_count: 887,  following_count: 421, is_following: false },
    'orrin_demo':  { ...mockUsers[3], cover_photo: null,                                                                         followers_count: 12,   following_count: 44,  is_following: false },
};

export const mockFollowers = [
    { id: 'user-2', username: 'katya_music', first_name: 'Katya', avatar: 'https://i.pravatar.cc/150?img=47' },
    { id: 'user-3', username: 'metal_ivan',  first_name: 'Ivan',  avatar: 'https://i.pravatar.cc/150?img=53' },
    { id: 'user-4', username: 'orrin_demo',  first_name: 'Demo',  avatar: 'https://i.pravatar.cc/150?img=32' },
];

export const mockNotifications = [
    { id: 'notif-1', notification_type: 'like_post',    text: 'Katya Voloshyn liked your post about 505',                is_read: false, created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
    { id: 'notif-2', notification_type: 'follow',       text: 'Ivan Kovalchuk started following you',                     is_read: false, created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: 'notif-3', notification_type: 'reply',        text: 'Alex Mercer commented: "The bass line in this is insane"',  is_read: true,  created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
    { id: 'notif-4', notification_type: 'new_track',    text: 'Arctic Monkeys released a new track you might like',       is_read: true,  created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    { id: 'notif-5', notification_type: 'like_comment', text: 'Demo User liked your comment',                             is_read: true,  created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
];