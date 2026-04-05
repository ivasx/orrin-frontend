import AlbumCard from '../../../../components/Shared/AlbumCard/AlbumCard.jsx';
import styles from './DiscographyTab.module.css';

export default function DiscographyTab({ albums, onPlayAlbum }) {
    return (
        <div className={styles.grid}>
            {albums.map((album) => (
                <AlbumCard
                    key={album.id}
                    id={album.id}
                    title={album.title}
                    artist={album.artist}
                    cover={album.cover}
                    year={album.year}
                    to={`/album/${album.id}`}
                />
            ))}
        </div>
    );
}