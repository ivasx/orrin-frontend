import './ArtistSection.css';
import ArtistCard from '../ArtistCard/ArtistCard.jsx';
import SectionHeader from '../SectionHeader/SectionHeader.jsx'; // 👈 Імпортуємо новий компонент

export default function ArtistSection({ title, artists, onMoreClick }) {
    return (
        <section className="artist-section">
            {/* 👇 Замінюємо старий блок заголовка на новий компонент */}
            <SectionHeader title={title} onMoreClick={onMoreClick} />

            <div className="artist-section-grid">
                {artists.map((artist) => (
                    <ArtistCard
                        key={artist.id}
                        {...artist}
                        onClick={() => console.log(`Clicked on ${artist.name}`)}
                    />
                ))}
            </div>
        </section>
    );
}