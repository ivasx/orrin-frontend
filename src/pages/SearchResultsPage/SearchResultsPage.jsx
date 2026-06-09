import {useState, useEffect} from 'react';
import {useSearchParams, useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {searchGlobal} from '../../services/api/index.js';
import {normalizeArtistData} from '../../constants/fallbacks.js';
import TrackSection from '../../components/Shared/TrackSection/TrackSection';
import ArtistSection from '../../components/Shared/ArtistSection/ArtistSection';
import UserSearchResults from '../../components/Shared/UserSearchResults/UserSearchResults';
import MusicSectionWrapper from '../../components/Shared/MusicSectionWrapper/MusicSectionWrapper';
import styles from './SearchResultsPage.module.css';

const TABS = ['all', 'tracks', 'artists', 'users'];
const PREVIEW_TRACKS = 6;
const PREVIEW_ARTISTS = 4;
const PREVIEW_USERS = 6;

export default function SearchResultsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const {t} = useTranslation();
    const navigate = useNavigate();

    const query = searchParams.get('q') || '';
    const activeTab = TABS.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'all';

    const [foundTracks, setFoundTracks] = useState([]);
    const [foundArtists, setFoundArtists] = useState([]);
    const [foundUsers, setFoundUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const searchTerm = query.trim();
        if (!searchTerm) {
            setFoundTracks([]);
            setFoundArtists([]);
            setFoundUsers([]);
            return;
        }

        let cancelled = false;
        setIsLoading(true);

        searchGlobal(searchTerm)
            .then(({tracks, artists, users = []}) => {
                if (cancelled) return;
                setFoundTracks(tracks);
                setFoundArtists(artists.map(normalizeArtistData).filter(Boolean));
                setFoundUsers(users);
            })
            .catch(() => {
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [query]);

    const setTab = (tab) => {
        const next = new URLSearchParams(searchParams);
        next.set('tab', tab);
        setSearchParams(next, {replace: true});
    };

    const hasResults = foundTracks.length > 0 || foundArtists.length > 0 || foundUsers.length > 0;

    const handleMoreTracks = () => navigate(`/search/tracks?q=${encodeURIComponent(query)}`);
    const handleMoreArtists = () => navigate(`/search/artists?q=${encodeURIComponent(query)}`);
    const handleMoreUsers = () => setTab('users');

    const showTracks = activeTab === 'all' || activeTab === 'tracks';
    const showArtists = activeTab === 'all' || activeTab === 'artists';
    const showUsers = activeTab === 'all' || activeTab === 'users';

    return (
        <MusicSectionWrapper spacing="top-only">
            <div className={styles.page}>
                {query && (
                    <h1 className={styles.title}>
                        {t('search_results_for')} &ldquo;{query}&rdquo;
                    </h1>
                )}

                {query && (
                    <div className={styles.tabs} role="tablist">
                        {TABS.map((tab) => (
                            <button
                                key={tab}
                                role="tab"
                                aria-selected={activeTab === tab}
                                className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                                onClick={() => setTab(tab)}
                            >
                                {t(`search_tab_${tab}`, tab)}
                            </button>
                        ))}
                    </div>
                )}

                {isLoading && <p>{t('searching')}</p>}

                {!isLoading && (
                    <>
                        {showArtists && foundArtists.length > 0 && (
                            <ArtistSection
                                title={t('found_artists')}
                                artists={foundArtists.slice(0, PREVIEW_ARTISTS)}
                                onMoreClick={foundArtists.length > PREVIEW_ARTISTS ? handleMoreArtists : undefined}
                            />
                        )}

                        {showTracks && foundTracks.length > 0 && (
                            <TrackSection
                                title={t('found_tracks')}
                                tracks={foundTracks.slice(0, PREVIEW_TRACKS)}
                                onMoreClick={foundTracks.length > PREVIEW_TRACKS ? handleMoreTracks : undefined}
                            />
                        )}

                        {showUsers && foundUsers.length > 0 && (
                            <UserSearchResults
                                title={t('found_users')}
                                users={foundUsers.slice(0, PREVIEW_USERS)}
                                onMoreClick={
                                    activeTab === 'all' && foundUsers.length > PREVIEW_USERS
                                        ? handleMoreUsers
                                        : undefined
                                }
                            />
                        )}

                        {query && !hasResults && (
                            <p className={styles.noResults}>
                                {t('no_results_found_for_request')} &ldquo;{query}&rdquo;
                            </p>
                        )}

                        {!query && <p>{t('type_something_in_search_field')}</p>}
                    </>
                )}
            </div>
        </MusicSectionWrapper>
    );
}