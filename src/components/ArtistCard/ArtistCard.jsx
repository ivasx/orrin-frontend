import './ArtistCard.css';
import { useTranslation } from "react-i18next";
import { Link } from 'react-router-dom';


export default function ArtistCard({ id, name, genre, role, imageUrl }) {
    const { t } = useTranslation();

    return (
        <Link to={`/artist/${id}`} className="artist-card-link" aria-label={`${t('artist_label')} ${name}`}>
            <div className="artist-card" role="button" tabIndex={0}>
                <div className="artist-card-image-wrapper">
                    <img src={imageUrl} alt={name} className="artist-card-image" />
                </div>
                <div className="artist-card-info">
                    <div className="artist-card-name">{name}</div>
                    <div className="artist-card-subtitle">{role || genre}</div>
                </div>
            </div>
        </Link>
    );
}