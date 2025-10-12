import MusicSectionWrapper from '../../components/MusicSectionWrapper/MusicSectionWrapper.jsx';
import TrackSection from '../../components/TrackSection/TrackSection.jsx';
import { ways } from '../../data.js';

export default function HistoryPage() {
  return (
    <MusicSectionWrapper spacing="top-only">
      <TrackSection
        title="Історія прослуховування"
        tracks={ways}
        onMoreClick={() => console.log('Більше натиснуто')}
      />
    </MusicSectionWrapper>
  );
}