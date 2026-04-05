import AlbumCard from '../AlbumCard/AlbumCard.jsx';
import SectionHeader from '../../UI/SectionHeader/SectionHeader.jsx';
import styles from './AlbumSection.module.css';

export default function AlbumSection({ title, albums, onMoreClick }) {
    return (
        <section className={styles.section}>
            <SectionHeader title={title} onMoreClick={onMoreClick} />
            <div className={styles.grid}>
                {albums.map((album) => (
                    <AlbumCard
                        key={album.id}
                        id={album.id}
                        title={album.title}
                        artist={album.artist}
                        cover={album.cover}
                        year={album.year}
                    />
                ))}
            </div>
        </section>
    );
}