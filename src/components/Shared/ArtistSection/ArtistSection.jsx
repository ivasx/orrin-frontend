import './ArtistSection.css';
import ArtistCard from '../ArtistCard/ArtistCard.jsx';
import SectionHeader from '../../UI/SectionHeader/SectionHeader.jsx';

export default function ArtistSection({title, artists, onMoreClick}) {
    return (
        <section className="artist-section">
            <SectionHeader title={title} onMoreClick={onMoreClick}/>
            <div className="artist-section-grid">
                {artists.map((artist) => (
                    <ArtistCard
                        key={artist.id}
                        id={artist.slug || artist.id}
                        name={artist.name}
                        imageUrl={artist.imageUrl}
                        image_url={artist.image_url}
                        miniDescription={artist.miniDescription}
                        mini_description={artist.mini_description}
                        genre={artist.genre}
                        role={artist.role}
                    />
                ))}
            </div>
        </section>
    );
}