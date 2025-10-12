import './ArtistCard.css';

export default function ArtistCard({ name, subtitle, imageUrl, onClick }) {
    return (
        <div className="artist-card" onClick={onClick} role="button" tabIndex={0} aria-label={`Виконавець ${name}`}>
            <div className="artist-card-image-wrapper">
                <img src={imageUrl} alt={name} className="artist-card-image" />
            </div>
            <div className="artist-card-info">
                <div className="artist-card-name">{name}</div>
                <div className="artist-card-subtitle">{subtitle}</div>
            </div>
        </div>
    );
}