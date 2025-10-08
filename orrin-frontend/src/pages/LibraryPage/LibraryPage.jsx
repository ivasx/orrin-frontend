import MusicSectionWrapper from '../../components/TrackSection/MusicSectionWrapper.jsx';
import TrackSection from '../../components/TrackSection/TrackSection.jsx';
import { ways } from '../../data.js';
import { useEffect, useState } from 'react';


export default function LibraryPage() {
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    setTracks(ways);
    // Майбутній API-запит: fetch('/api/library')...
  }, []);

  return (
    <MusicSectionWrapper spacing="top-only">
      <TrackSection
        title="Ваша бібліотека"
        tracks={tracks}
        onMoreClick={() => console.log('Більше натиснуто')}
      />
    </MusicSectionWrapper>
  );
}