import {useState, useEffect} from 'react';
import TrackSection from '../../components/TrackSection/TrackSection.jsx';
import MusicSectionWrapper from '../../components/MusicSectionWrapper/MusicSectionWrapper.jsx';
import {ways} from '../../data';
import {useTranslation} from "react-i18next";

export default function FeedPage() {
    const [tracks, setTracks] = useState([]);
    const {t} = useTranslation();

    // Цей хук імітує завантаження даних при відкритті сторінки
    useEffect(() => {
        // Зараз ми просто беремо дані з файлу
        setTracks(ways);

        // В майбутньому, коли буде API:
        // fetch('https://your-api.com/feed')
        //   .then(res => res.json())
        //   .then(data => setTracks(data));
    }, []); // Пустий масив означає, що це виконається 1 раз

    return (
        <MusicSectionWrapper spacing="top-only">
            <TrackSection
                title={t('your_feed')}
                tracks={tracks}
                onMoreClick={() => console.log(t('more_pressed'))}
            />
        </MusicSectionWrapper>
    );
}