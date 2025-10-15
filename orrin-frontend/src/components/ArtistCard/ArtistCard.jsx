import './ArtistCard.css';
import {useTranslation} from "react-i18next";

export default function ArtistCard({name, subtitle, imageUrl, onClick}) {
    const {t, i18n} = useTranslation();

    return (
        <div className="artist-card" onClick={onClick} role="button" tabIndex={0}
             aria-label={`${t('artist_label')} ${name}`}>
            <div className="artist-card-image-wrapper">
                <img src={imageUrl} alt={name} className="artist-card-image"/>
            </div>
            <div className="artist-card-info">
                <div className="artist-card-name">{name}</div>
                <div className="artist-card-subtitle">{subtitle}</div>
            </div>
        </div>
    );
}