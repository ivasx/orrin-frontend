import MusicSectionWrapper from '../../components/MusicSectionWrapper/MusicSectionWrapper.jsx';
import TrackSection from '../../components/TrackSection/TrackSection.jsx';
import {ways} from '../../data.js';
import {useTranslation} from "react-i18next";

export default function TopTracksPage() {
    const {t} = useTranslation();

    return (
        <MusicSectionWrapper spacing="top-only">
            <TrackSection
                title={t('top_tracks')}
                tracks={ways}
                onMoreClick={() => {
                    // TODO: Implement "More" functionality for top tracks
                }}
            />
        </MusicSectionWrapper>
    );
}