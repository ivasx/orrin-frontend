import MusicSectionWrapper from '../../components/MusicSectionWrapper/MusicSectionWrapper.jsx';
import TrackSection from '../../components/TrackSection/TrackSection.jsx';
import {ways} from '../../data.js';
import {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";


export default function LibraryPage() {
    const [tracks, setTracks] = useState([]);
    const {t} = useTranslation();

    useEffect(() => {
        setTracks(ways);
        // Майбутній API-запит: fetch('/api/library')...
    }, []);

    return (
        <MusicSectionWrapper spacing="top-only">
            <TrackSection
                title={t('your_library')}
                tracks={ways}
                onMoreClick={() => console.log(t('more_pressed'))}
            />
        </MusicSectionWrapper>
    );
}