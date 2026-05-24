import {useNavigate} from 'react-router-dom';
import SectionHeader from '../../UI/SectionHeader/SectionHeader.jsx';
import styles from './UserSearchResults.module.css';

export default function UserSearchResults({title, users, onMoreClick}) {
    const navigate = useNavigate();

    if (!users?.length) return null;

    return (
        <section className={styles.section}>
            <SectionHeader title={title} onMoreClick={onMoreClick}/>
            <ul className={styles.list}>
                {users.map((user) => (
                    <UserCard key={user.id ?? user.username} user={user} navigate={navigate}/>
                ))}
            </ul>
        </section>
    );
}

function UserCard({user, navigate}) {
    const handleClick = () => navigate(`/user/${user.username}`);

    return (
        <li className={styles.card} onClick={handleClick} role="button" tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleClick()}>
            <div className={styles.avatar}>
                {user.avatar || user.avatarUrl ? (
                    <img src={user.avatar || user.avatarUrl} alt={user.username}/>
                ) : (
                    <span className={styles.avatarFallback}>
                        {(user.username?.[0] ?? '?').toUpperCase()}
                    </span>
                )}
            </div>
            <div className={styles.info}>
                <span className={styles.name}>{user.name || user.username}</span>
                <span className={styles.username}>@{user.username}</span>
            </div>
        </li>
    );
}