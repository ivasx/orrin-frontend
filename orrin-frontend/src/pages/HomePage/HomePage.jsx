import { useState, useEffect } from 'react';
import TrackSection from '../../components/TrackSection/TrackSection.jsx';
import MusicSectionWrapper from '../../components/TrackSection/MusicSectionWrapper.jsx';
import { ways } from '../../data.js';

// У майбутньому тут буде функція для запиту до API
// const api = {
//   getListenNowTracks: () => fetch('https://your-api.com/listen-now').then(res => res.json()),
//   getPopularArtists: () => fetch('https://your-api.com/popular-artists').then(res => res.json()),
// }

export default function HomePage() {
  const [listenNowTracks, setListenNowTracks] = useState([]);
  const [popularArtists, setPopularArtists] = useState([]);

  useEffect(() => {
    // Імітуємо завантаження даних з API
    setListenNowTracks(ways);
    setPopularArtists(ways.slice(0, 5)); // Наприклад, для артистів беремо перші 5

    // КОЛИ БУДЕ API:
    // api.getListenNowTracks().then(data => setListenNowTracks(data));
    // api.getPopularArtists().then(data => setPopularArtists(data));
  }, []); // Пустий масив означає, що цей ефект виконається один раз при завантаженні сторінки

  return (
    <>
      <MusicSectionWrapper spacing="top-only">
        <TrackSection
          title="Слухати зараз"
          tracks={listenNowTracks}
          onMoreClick={() => console.log('Більше натиснуто')}
        />
      </MusicSectionWrapper>
      <MusicSectionWrapper spacing="top-only">
        <TrackSection
          title="Популярні виконавці"
          tracks={popularArtists}
          onMoreClick={() => console.log('Більше натиснуто')}
        />
      </MusicSectionWrapper>
    </>
  );
}