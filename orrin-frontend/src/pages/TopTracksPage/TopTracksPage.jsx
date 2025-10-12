import MusicSectionWrapper from '../../components/MusicSectionWrapper/MusicSectionWrapper.jsx';
import TrackSection from '../../components/TrackSection/TrackSection.jsx';
import { ways } from '../../data.js';

export default function TopTracksPage() {
  return (
    <MusicSectionWrapper spacing="top-only">
      <TrackSection
        title="Топ треки"
        tracks={ways}
        onMoreClick={() => console.log('Більше натиснуто')}
      />
    </MusicSectionWrapper>
  );
}