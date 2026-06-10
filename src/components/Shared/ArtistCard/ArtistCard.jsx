import {memo} from 'react';
import {Link} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import styles from './ArtistCard.module.css';

function ArtistCard({id, name, genre, role, imageUrl, image_url, miniDescription, mini_description}) {
    const {t} = useTranslation();
    const src = imageUrl ?? image_url ?? null;
    const subtitle = miniDescription ?? mini_description ?? role ?? genre ?? null;

    return (
        <Link
            to={`/artist/${id}`}
            className={styles.link}
            aria-label={`${t('artist_label')} ${name}`}
        >
            <div className={styles.card}>
                <div className={styles.imageWrapper}>
                    <img src={src} alt={name} className={styles.image}/>
                </div>
                <div className={styles.info}>
                    <div className={styles.name}>{name}</div>
                    {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
                </div>
            </div>
        </Link>
    );
}

export default memo(ArtistCard);