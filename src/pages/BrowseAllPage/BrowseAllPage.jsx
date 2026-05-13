import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {ArrowLeft} from 'lucide-react';
import {
    getTracks,
    getArtists,
    getFriendsActivity,
    searchGlobal,
} from '../../services/api/index.js';
import TrackSection from '../../components/Shared/TrackSection/TrackSection';
import ArtistSection from '../../components/Shared/ArtistSection/ArtistSection';
import MusicSectionWrapper from '../../components/Shared/MusicSectionWrapper/MusicSectionWrapper';
import InfoSection from '../../components/Shared/InfoSection/InfoSection';
import styles from './BrowseAllPage.module.css';

const PAGE_CONFIG = {
    tracks: {
        titleKey: 'listen_now',
        fetchFn: () => getTracks(),
        render: (items) => <TrackSection title="" tracks={items}/>,
    },
    artists: {
        titleKey: 'popular_artists',
        fetchFn: () => getArtists(),
        render: (items) => <ArtistSection title="" artists={items}/>,
    },
    friends: {
        titleKey: 'from_friends',
        fetchFn: () => getFriendsActivity(),
        render: (items) => <TrackSection title="" tracks={items}/>,
    },
    'search/tracks': {
        titleKey: 'found_tracks',
        fetchFn: (query) => searchGlobal(query).then(({tracks}) => tracks),
        render: (items) => <TrackSection title="" tracks={items}/>,
    },
    'search/artists': {
        titleKey: 'found_artists',
        fetchFn: (query) => searchGlobal(query).then(({artists}) => artists),
        render: (items) => <ArtistSection title="" artists={items}/>,
    },
};

export default function BrowseAllPage({type, query}) {
    const {t} = useTranslation();
    const navigate = useNavigate();

    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    const config = PAGE_CONFIG[type];

    useEffect(() => {
        if (!config) return;

        let cancelled = false;
        setIsLoading(true);
        setIsError(false);

        config.fetchFn(query)
            .then((result) => {
                if (cancelled) return;
                setItems(result);
            })
            .catch(() => {
                if (!cancelled) setIsError(true);
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [type, query]);

    const handleBack = () => navigate(-1);

    if (!config) return null;

    return (
        <MusicSectionWrapper spacing="top-only">
            <div className={styles.page}>
                <button className={styles.backBtn} onClick={handleBack}>
                    <ArrowLeft size={16}/>
                    {t('back')}
                </button>

                <h1 className={styles.title}>
                    {t(config.titleKey)}
                    {query && `: "${query}"`}
                </h1>

                {isLoading && <InfoSection isLoading/>}

                {isError && (
                    <InfoSection
                        message={t('error_loading_tracks')}
                        action={{label: t('retry'), onClick: () => setIsError(false), variant: 'outline'}}
                    />
                )}

                {!isLoading && !isError && items.length > 0 && config.render(items)}

                {!isLoading && !isError && items.length === 0 && (
                    <InfoSection message={t('no_results_found_for_request')}/>
                )}
            </div>
        </MusicSectionWrapper>
    );
}