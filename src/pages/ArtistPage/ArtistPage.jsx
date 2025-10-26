import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaInstagram, FaYoutube, FaSpotify, FaShareAlt, FaPen } from 'react-icons/fa';
import { Play, MoreVertical } from 'lucide-react'; // Переконайтесь, що MoreVertical імпортовано
import './ArtistPage.css';
import { popularArtists, ways } from '../../data.js';
import MusicSectionWrapper from '../../components/MusicSectionWrapper/MusicSectionWrapper.jsx';
import TrackSection from '../../components/TrackSection/TrackSection.jsx';
import ArtistSection from '../../components/ArtistSection/ArtistSection.jsx';
import ArtistCard from '../../components/ArtistCard/ArtistCard.jsx';
// Важливо: Правильний шлях до ArtistNotesTab!
// Якщо він у тій же папці: import ArtistNotesTab from './ArtistNotesTab.jsx';
// Якщо він у components:
import ArtistNotesTab from '../../components/ArtistNotesTab/ArtistNotesTab.jsx';
import { useAudioPlayer } from '../../context/AudioPlayerContext.jsx';


// --- Внутрішні компоненти вкладок ---
function AboutTab({ artist }) {
    const { t } = useTranslation();
    return (
        <div className="artist-about-section">
            <p className="artist-description">{artist.description}</p>
            <div className="artist-meta">
                {artist.location && <p><strong>{t('artist_city', 'Місто')}:</strong> {artist.location}</p>}
                {artist.joinDate && <p><strong>{t('artist_active_since', 'Активний з')}:</strong> {artist.joinDate}</p>}
            </div>
            {artist.socials && (
                <div className="artist-socials">
                    {artist.socials.instagram && <a href={artist.socials.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>}
                    {artist.socials.youtube && <a href={artist.socials.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube"><FaYoutube /></a>}
                    {artist.socials.spotify && <a href={artist.socials.spotify} target="_blank" rel="noopener noreferrer" aria-label="Spotify"><FaSpotify /></a>}
                </div>
            )}
        </div>
    );
}

function HistoryTab({ artist }) {
    return (
        <div className="artist-history-section">
            <p>{artist.history}</p>
        </div>
    );
}

function MembersTab({ members }) {
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

function DiscographyTab({ albums }) {
    const { playTrack } = useAudioPlayer();
    const navigate = useNavigate();

    const handlePlayAlbumClick = (event, album) => {
        event.preventDefault();
        event.stopPropagation();
        const albumTracks = ways.filter(track => album.trackIds?.includes(track.trackId));
        if (albumTracks.length > 0) {
            const firstTrack = albumTracks[0];
            playTrack(firstTrack, albumTracks);
            navigate(`/track/${firstTrack.trackId}`);
        } else {
            console.log(`No tracks found for album "${album.title}"`);
        }
    };

    const handleMoreOptionsClick = (event, albumId) => {
        event.preventDefault();
        event.stopPropagation();
        console.log(`More options for album ${albumId} clicked`);
        // TODO: Implement options menu logic
    };

    return (
        <div className="artist-discography-grid">
            {albums.map(album => (
                <Link key={album.id} to={`/album/${album.id}`} className="discography-album-link">
                    <div className="discography-album-item">
                        <div className="discography-album-cover-wrapper">
                            <img src={album.cover} alt={album.title} className="discography-album-cover" />
                            <div className="album-hover-overlay">
                                <button className="album-more-options-button" aria-label={`Більше опцій для ${album.title}`} onClick={(e) => handleMoreOptionsClick(e, album.id)}>
                                    <MoreVertical size={20} />
                                </button>
                                <button className="album-play-button" aria-label={`Грати ${album.title}`} onClick={(e) => handlePlayAlbumClick(e, album)}>
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

// --- ОСНОВНИЙ КОМПОНЕНТ ---
export default function ArtistPage() {
    const { t } = useTranslation();
    const { artistId } = useParams();
    const [activeTab, setActiveTab] = useState('about');

    const artist = useMemo(() => {
        return popularArtists.find(a => a.id.toString() === artistId);
    }, [artistId]);

    if (!artist) {
        return <div>{t('artist_not_found', 'Виконавця не знайдено')}</div>;
    }

    const tabs = [
        { id: 'about', label: t('artist_about', 'Про артиста') },
        { id: 'history', label: t('artist_history', 'Історія') },
    ];
    if (artist.type === 'group' && artist.members?.length > 0) {
        tabs.push({ id: 'members', label: t('artist_members', 'Склад гурту') });
    }
    if (artist.discography?.length > 0) {
        tabs.push({ id: 'discography', label: t('artist_discography', 'Дискографія') });
    }
    tabs.push({ id: 'notes', label: t('artist_notes', 'Нотатки') });

    return (
        <MusicSectionWrapper spacing="none">
            {/* ... (Хедер Hero) ... */}
            <div className="artist-hero" style={{ backgroundImage: `url(${artist.imageUrl})` }}>
                <div className="artist-hero-overlay"></div>
                <div className="artist-hero-content">
                    <img src={artist.imageUrl} alt={artist.name} className="artist-hero-avatar" />
                    <div className="artist-hero-info">
                        <h1 className="artist-hero-name">{artist.name}</h1>
                        <p className="artist-hero-listeners">{artist.listenersMonthy} {t('artist_listeners', 'слухачів на місяць')}</p>
                        <div className="artist-hero-actions">
                            <button className="btn-primary-custom play-button">
                                <Play size={20} /> {t('artist_listen', 'Слухати')}
                            </button>
                            <button className="btn-outline-light">{t('artist_follow', 'Підписатись')}</button>
                            <button className="control-btn" aria-label={t('artist_share', 'Поділитися')}><FaShareAlt size={20} /></button>
                            <button className="control-btn" aria-label={t('artist_add_note', 'Додати нотатку')}><FaPen size={20} /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ... (Навігація вкладками) ... */}
            <nav className="artist-tabs">
                {tabs.map(tab => (
                    <button key={tab.id} className={`artist-tab-button ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                        {tab.label}
                    </button>
                ))}
            </nav>

            {/* ... (Контент вкладок) ... */}
            <MusicSectionWrapper spacing="default">
                <div className="artist-tab-content">
                    {activeTab === 'about' && <AboutTab artist={artist} />}
                    {activeTab === 'history' && <HistoryTab artist={artist} />}
                    {activeTab === 'members' && artist.members && <MembersTab members={artist.members} />}
                    {activeTab === 'discography' && artist.discography && <DiscographyTab albums={artist.discography} />}
                    {/* 👇 Ось тут викликається компонент нотаток 👇 */}
                    {activeTab === 'notes' &&
                        <ArtistNotesTab
                            initialNotes={artist.notes || []}
                            popularTracks={artist.popularTracks || []}
                        />
                    }
                </div>
            </MusicSectionWrapper>

            {/* ... (Популярні треки) ... */}
            {artist.popularTracks?.length > 0 && (
                <MusicSectionWrapper spacing="default">
                    <TrackSection title={t('artist_popular_tracks', 'Популярні треки')} tracks={artist.popularTracks} onMoreClick={() => console.log('More popular tracks clicked')} />
                </MusicSectionWrapper>
            )}

            {/* ... (Схожі артисти) ... */}
            {artist.similarArtists?.length > 0 && (
                <MusicSectionWrapper spacing="default">
                    <ArtistSection title={t('artist_similar', 'Схожі артисти')} artists={artist.similarArtists} onMoreClick={() => console.log('More similar artists clicked')} />
                </MusicSectionWrapper>
            )}

        </MusicSectionWrapper>
    );
}