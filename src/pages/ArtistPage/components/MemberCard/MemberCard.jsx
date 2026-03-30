import { Link } from 'react-router-dom';
import styles from './MemberCard.module.css';

export default function MemberCard({ member }) {
    return (
        <Link
            to={`/user/${member.username || member.id}`}
            className={styles.memberCard}
        >
            <img
                src={member.imageUrl || '/default-avatar.png'}
                alt={member.name}
                className={styles.memberAvatar}
            />
            <div className={styles.memberInfo}>
                <span className={styles.memberName}>{member.name}</span>
                {member.role && <span className={styles.memberRole}>{member.role}</span>}
            </div>
        </Link>
    );
}