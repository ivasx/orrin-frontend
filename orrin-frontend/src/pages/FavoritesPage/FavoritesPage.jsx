import MusicSectionWrapper from '../../components/MusicSectionWrapper/MusicSectionWrapper.jsx';
import TrackSection from '../../components/TrackSection/TrackSection.jsx';
import { ways } from '../../data.js';
import { useEffect, useState } from 'react';

export default function FavoritesPage() {
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    // Для улюблених треків
    const favoriteTracks = ways.slice(0, 5); // Наприклад, беремо перші 5
    setTracks(favoriteTracks);
    // Майбутній API-запит: fetch('/api/favorites')...
  }, []);

  return (
    <MusicSectionWrapper spacing="top-only">
      <TrackSection
        title="Улюблені треки"
        tracks={tracks}
        onMoreClick={() => console.log('Більше натиснуто')}
      />
    </MusicSectionWrapper>
  );
}