import './ArtistCard.css';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';
import {memo} from 'react';

function ArtistCard({id, name, genre, role, imageUrl, image_url, miniDescription, mini_description}) {
    const {t} = useTranslation();
    const src = imageUrl ?? image_url ?? null;
    const subtitle = miniDescription ?? mini_description ?? role ?? genre ?? null;

    return (
        <Link to={`/artist/${id}`} className="artist-card-link" aria-label={`${t('artist_label')} ${name}`}>
            <div className="artist-card">
                <div className="artist-card-image-wrapper">
                    <img src={src} alt={name} className="artist-card-image"/>
                </div>
                <div className="artist-card-info">
                    <div className="artist-card-name">{name}</div>
                    {subtitle && <div className="artist-card-subtitle">{subtitle}</div>}
                </div>
            </div>
        </Link>
    );
}

export default memo(ArtistCard);