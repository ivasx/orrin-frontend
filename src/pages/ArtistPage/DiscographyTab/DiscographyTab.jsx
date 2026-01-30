import {Link} from 'react-router-dom';
import {Play} from 'lucide-react';
import styles from './DiscographyTab.module.css';

export default function DiscographyTab({albums, onPlayAlbum}) {
    const handlePlayAlbumClick = (event, album) => {
        event.preventDefault();
        event.stopPropagation();
        onPlayAlbum(album);
    };

    return (
        <div className={styles.grid}>
            {albums.map(album => (
                <Link key={album.id} to={`/album/${album.id}`} className={styles.card}>
                    <div className={styles.coverWrapper}>
                        <img src={album.cover} alt={album.title} className={styles.cover}/>
                        <div className={styles.overlay}>
                            <button
                                className={styles.playButton}
                                aria-label={`Play ${album.title}`}
                                onClick={(e) => handlePlayAlbumClick(e, album)}
                            >
                                <Play size={24} fill="currentColor" style={{marginLeft: '4px'}}/>
                            </button>
                        </div>
                    </div>
                    <div className={styles.info}>
                        <span className={styles.title} title={album.title}>{album.title}</span>
                        <span className={styles.meta}>{album.year}</span>
                    </div>
                </Link>
            ))}
        </div>
    );
}