import ArtistCard from '../../../components/Shared/ArtistCard/ArtistCard.jsx';
import styles from './MembersTab.module.css';

export default function MembersTab({ members }) {
    return (
        <div className={styles.grid}>
            {members.map(member => (
                <ArtistCard
                    key={member.id}
                    id={member.id}
                    name={member.name}
                    role={member.role}
                    imageUrl={member.imageUrl}
                />
            ))}
        </div>
    );
}