import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import InfoSection from '../../../../components/Shared/InfoSection/InfoSection.jsx';
import { getUserFriends } from '../../../../services/api.js';

export const FriendsTab = ({ userId }) => {
    const { t } = useTranslation();

    const { data: friends, isLoading, isError } = useQuery({
        queryKey: ['userFriends', userId],
        queryFn: () => getUserFriends(userId),
        enabled: !!userId,
    });

    if (isLoading) return <InfoSection isLoading />;
    if (isError) return <InfoSection message={t('profile_error_friends', 'Could not load friends.')} />;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {friends?.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                    {friends.map(friend => (
                        <div key={friend.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--bg-color-secondary, #121212)', borderRadius: '8px' }}>
                            <img
                                src={friend.avatarUrl || '/default-avatar.png'}
                                alt={friend.username}
                                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <span style={{ color: 'var(--text-color-primary, #ffffff)', fontWeight: 'bold' }}>
                                {friend.username}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <InfoSection message={t('profile_no_friends', 'No friends yet.')} />
            )}
        </div>
    );
};