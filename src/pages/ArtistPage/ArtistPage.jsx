import {useState, useMemo} from 'react';
import {useParams, Link, useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {FaInstagram, FaYoutube, FaSpotify, FaShareAlt, FaPen} from 'react-icons/fa';
import {Play, MoreVertical} from 'lucide-react';
import './ArtistPage.css';

import MusicSectionWrapper from '../../components/MusicSectionWrapper/MusicSectionWrapper.jsx';
import TrackSection from '../../components/TrackSection/TrackSection.jsx';
import ArtistSection from '../../components/ArtistSection/ArtistSection.jsx';
import ArtistCard from '../../components/ArtistCard/ArtistCard.jsx';
import ArtistNotesTab from '../../components/ArtistNotesTab/ArtistNotesTab.jsx';
import {useAudioCore} from '../../context/AudioCoreContext.jsx';

import {useQuery} from '@tanstack/react-query';
import {getArtistById, getTracksByIds} from '../../services/api.js'; // getTracks for discography, until there is an album API
import {normalizeArtistData, normalizeTrackData} from '../../constants/fallbacks.js';
import SectionSkeleton from '../../components/SectionSkeleton/SectionSkeleton.jsx';


function AboutTab({artist}) {
    const {t} = useTranslation();
    return (
        <div className="artist-about-section">
            <p className="artist-description">{artist.description}</p>
            <div className="artist-meta">
                {artist.location && <p><strong>{t('artist_city', 'Місто')}:</strong> {artist.location}</p>}
                {artist.joinDate && <p><strong>{t('artist_active_since', 'Активний з')}:</strong> {artist.joinDate}</p>}
            </div>
            {artist.socials && (
                <div className="artist-socials">
                    {artist.socials.instagram &&
                        <a href={artist.socials.instagram} target="_blank" rel="noopener noreferrer"
                           aria-label="Instagram"><FaInstagram/></a>}
                    {artist.socials.youtube &&
                        <a href={artist.socials.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube"><FaYoutube/></a>}
                    {artist.socials.spotify &&
                        <a href={artist.socials.spotify} target="_blank" rel="noopener noreferrer" aria-label="Spotify"><FaSpotify/></a>}
                </div>
            )}
        </div>
    );
}

function HistoryTab({artist}) {
    return (
        <div className="artist-history-section">
            <p>{artist.history}</p>
        </div>
    );
}

function MembersTab({members}) {
    return (
        <div className="artist-members-grid">
            {members.map(member => (
                <ArtistCard
                    key={member.id}
                    id={member.id}
                    name={member.name}
                    role={member.role}
                    imageUrl={member.imageUrl}
                />
            ))}
        </div>
    );
}

function DiscographyTab({albums, onPlayAlbum}) {
    const navigate = useNavigate();

    const handlePlayAlbumClick = (event, album) => {
        event.preventDefault();
        event.stopPropagation();
        onPlayAlbum(album);
    };

    const handleMoreOptionsClick = (event, albumId) => {
        event.preventDefault();
        event.stopPropagation();
        console.log(`More options for album ${albumId} clicked`);
    };

    return (
        <div className="artist-discography-grid">
            {albums.map(album => (
                <Link key={album.id} to={`/album/${album.id}`} className="discography-album-link">
                    <div className="discography-album-item">
                        <div className="discography-album-cover-wrapper">
                            <img src={album.cover} alt={album.title} className="discography-album-cover"/>
                            <div className="album-hover-overlay">
                                <button className="album-more-options-button"
                                        aria-label={`Більше опцій для ${album.title}`}
                                        onClick={(e) => handleMoreOptionsClick(e, album.id)}>
                                    <MoreVertical size={20}/>
                                </button>
                                <button className="album-play-button" aria-label={`Грати ${album.title}`}
                                        onClick={(e) => handlePlayAlbumClick(e, album)}>
                                    <Play size={24} fill="currentColor"/>
                                </button>
                            </div>
                        </div>
                        <div className="discography-album-info">
                            <span className="discography-album-title" title={album.title}>{album.title}</span>
                            <span className="discography-album-meta">{album.year}</span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}


export default function ArtistPage() {
    const {t} = useTranslation();
    const {artistId} = useParams();
    const [activeTab, setActiveTab] = useState('about');
    const {playTrack} = useAudioCore();
    const navigate = useNavigate();

    const {
        data: rawArtistData,
        isLoading,
        isError,
        error
    } = useQuery({
        queryKey: ['artist', artistId],
        queryFn: () => getArtistById(artistId),
        enabled: !!artistId,
    });


    const artist = rawArtistData ? normalizeArtistData(rawArtistData) : null;

    const tabs = useMemo(() => {
        if (!artist) return [];

        const TABS = [
            {id: 'about', label: t('artist_about', 'Про артиста')},
        ];

        if (artist.history) {
            TABS.push({id: 'history', label: t('artist_history', 'Історія')});
        }
        if (artist.type === 'group' && artist.members?.length > 0) {
            TABS.push({id: 'members', label: t('artist_members', 'Склад гурту')});
        }
        if (artist.discography?.length > 0) {
            TABS.push({id: 'discography', label: t('artist_discography', 'Дискографія')});
        }
        TABS.push({id: 'notes', label: t('artist_notes', 'Нотатки')});

        return TABS;
    }, [artist, t]);

    const handlePlayAlbum = async (album) => {
        if (!album.trackIds || album.trackIds.length === 0) {
            console.log(`Album "${album.title}" has no tracks listed.`);
            return;
        }

        try {
            const rawTracks = await getTracksByIds(album.trackIds);

            const albumTracks = rawTracks
                .map(normalizeTrackData)
                .filter(track => track !== null);

            if (albumTracks.length > 0) {
                const firstTrack = albumTracks[0];
                playTrack(firstTrack, albumTracks);
                navigate(`track/${firstTrack.trackId}`);
            } else {
                console.log(`No tracks found for album "${album.title}"`)
            }
        } catch (error) {
            console.error(`Error fetching album tracks: ${error.message}`);
        }
    };


    if (isLoading) {
        // TODO: Create better skeleton for artist page
        return (
            <MusicSectionWrapper spacing="top-only">
                <SectionSkeleton title={t('loading', 'Завантаження...')}/>  // TODO: Add translation for 'Loading...'
            </MusicSectionWrapper>
        );
    }

    if (isError) {
        return (
            <MusicSectionWrapper spacing="top-only">
                <SectionSkeleton
                    title={t('artist_not_found', 'Виконавця не знайдено')}  // TODO: Add translation for 'Artist not found'
                    isError={true}
                    error={error}
                />
            </MusicSectionWrapper>
        );
    }

    if (!artist) {
        return <div>{t('artist_not_found', 'Виконавця не знайдено')}</div>; // TODO: Add translation for 'Artist not found'
    }


    return (
        <MusicSectionWrapper spacing="none">
            <div className="artist-hero" style={{backgroundImage: `url(${artist.imageUrl})`}}>
                <div className="artist-hero-overlay"></div>
                <div className="artist-hero-content">
                    <img src={artist.imageUrl} alt={artist.name} className="artist-hero-avatar"/>
                    <div className="artist-hero-info">
                        <h1 className="artist-hero-name">{artist.name}</h1>
                        {artist.listenersMonthy && (
                            <p className="artist-hero-listeners">
                                {artist.listenersMonthy} {t('artist_listeners', 'слухачів на місяць')}  // TODO: Add translation for 'listeners per month'
                            </p>
                        )}
                        <div className="artist-hero-actions">
                            <button className="btn-primary-custom play-button">
                                <Play size={20}/> {t('artist_listen', 'Слухати')}   // TODO: Add translation for 'Listen'
                            </button>
                            <button className="btn-outline-light">{t('artist_follow', 'Підписатись')}</button>  // TODO: Add translation for 'Follow'
                            <button className="control-btn" aria-label={t('artist_share', 'Поділитися')}><FaShareAlt    // TODO: Add translation for 'Share'
                                size={20}/></button>
                            <button className="control-btn" aria-label={t('artist_add_note', 'Додати нотатку')}><FaPen  // TODO: Add translation for 'Add note'
                                size={20}/></button>
                        </div>
                    </div>
                </div>
            </div>

            <nav className="artist-tabs">
                {tabs.map(tab => (
                    <button key={tab.id} className={`artist-tab-button ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}>
                        {tab.label}
                    </button>
                ))}
            </nav>

            <MusicSectionWrapper spacing="default">
                <div className="artist-tab-content">
                    {activeTab === 'about' && <AboutTab artist={artist}/>}

                    {activeTab === 'history' && artist.history && <HistoryTab artist={artist}/>}

                    {activeTab === 'members' && artist.members?.length > 0 && <MembersTab members={artist.members}/>}

                    {activeTab === 'discography' && artist.discography?.length > 0 &&
                        <DiscographyTab
                            albums={artist.discography}
                            onPlayAlbum={handlePlayAlbum}
                        />
                    }

                    {activeTab === 'notes' &&
                        <ArtistNotesTab
                            initialNotes={artist.notes || []}
                            popularTracks={artist.popularTracks || []}
                        />
                    }
                </div>
            </MusicSectionWrapper>

            {artist.popularTracks?.length > 0 && (
                <MusicSectionWrapper spacing="default">
                    <TrackSection
                        title={t('artist_popular_tracks', 'Популярні треки')}   // TODO: Add translation for 'Popular tracks'
                        tracks={artist.popularTracks}
                        onMoreClick={() => console.log('More popular tracks clicked')}
                    />
                </MusicSectionWrapper>
            )}

            {artist.similarArtists?.length > 0 && (
                <MusicSectionWrapper spacing="default">
                    <ArtistSection
                        title={t('artist_similar', 'Схожі артисти')}    // TODO: Add translation for 'Similar artists'
                        artists={artist.similarArtists}
                        onMoreClick={() => console.log('More similar artists clicked')}
                    />
                </MusicSectionWrapper>
            )}

        </MusicSectionWrapper>
    );
}