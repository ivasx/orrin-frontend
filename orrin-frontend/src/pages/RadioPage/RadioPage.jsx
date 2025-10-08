import MusicSectionWrapper from '../../components/TrackSection/MusicSectionWrapper.jsx';
import TrackSection from '../../components/TrackSection/TrackSection.jsx';
import { ways } from '../../data.js';

export default function RadioPage() {
  return (
    <MusicSectionWrapper spacing="top-only">
      <TrackSection
        title="Радіо"
        tracks={ways}
        onMoreClick={() => console.log('Більше натиснуто')}
      />
    </MusicSectionWrapper>
  );
}