import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaInstagram, FaYoutube, FaSpotify, FaShareAlt, FaPen } from 'react-icons/fa';
import { Play, MoreVertical } from 'lucide-react';
import './ArtistPage.css';

import MusicSectionWrapper from '../../components/MusicSectionWrapper/MusicSectionWrapper.jsx';
import TrackSection from '../../components/TrackSection/TrackSection.jsx';
import ArtistSection from '../../components/ArtistSection/ArtistSection.jsx';
import ArtistCard from '../../components/ArtistCard/ArtistCard.jsx';
import ArtistNotesTab from '../../components/ArtistNotesTab/ArtistNotesTab.jsx';
import { useAudioCore } from '../../context/AudioCoreContext.jsx';

import { useQuery } from '@tanstack/react-query';
import { getArtistById, getTracks } from '../../services/api.js'; // getTracks - для дискографії, поки немає API альбомів
import { normalizeArtistData, normalizeTrackData } from '../../constants/fallbacks.js';
import SectionSkeleton from '../../components/SectionSkeleton/SectionSkeleton.jsx';


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

function DiscographyTab({ albums, onPlayAlbum }) {
    const navigate = useNavigate();

    const handlePlayAlbumClick = (event, album) => {
        event.preventDefault();
        event.stopPropagation();
        onPlayAlbum(album); // Викликаємо передану функцію
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
    const { artistId } = useParams(); // Це slug або ID
    const [activeTab, setActiveTab] = useState('about');
    const { playTrack } = useAudioCore();
    const navigate = useNavigate();

    // --- ПОЧАТОК ЗМІН: Завантаження даних артиста ---
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

    // Тимчасово завантажуємо всі треки, щоб знайти треки для дискографії
    // В майбутньому це має бути окремий API запит (/api/v1/artists/{id}/tracks)
    const { data: allTracks } = useQuery({ queryKey: ['tracks'], queryFn: getTracks });

    // Нормалізуємо дані артиста
    const artist = rawArtistData ? normalizeArtistData(rawArtistData) : null;
    // --- КІНЕЦЬ ЗМІН ---

    // --- ЛОГІКА ДЛЯ ВКЛАДОК (тепер залежить від 'artist') ---
    const tabs = useMemo(() => {
        if (!artist) return [];

        const TABS = [
            { id: 'about', label: t('artist_about', 'Про артиста') },
        ];

        // (Припускаємо, що API згодом повертатиме ці поля, як у моках)
        if (artist.history) {
            TABS.push({ id: 'history', label: t('artist_history', 'Історія') });
        }
        if (artist.type === 'group' && artist.members?.length > 0) {
            TABS.push({ id: 'members', label: t('artist_members', 'Склад гурту') });
        }
        if (artist.discography?.length > 0) {
            TABS.push({ id: 'discography', label: t('artist_discography', 'Дискографія') });
        }
        TABS.push({ id: 'notes', label: t('artist_notes', 'Нотатки') });

        return TABS;
    }, [artist, t]);

    // Функція для відтворення альбому (з DiscographyTab)
    const handlePlayAlbum = (album) => {
        if (!allTracks) return;

        // Знаходимо треки, що належать альбому (поки що за ID з моків)
        const albumTracks = allTracks
            .filter(track => album.trackIds?.includes(track.slug)) // Використовуємо slug (який є trackId в API)
            .map(normalizeTrackData);

        if (albumTracks.length > 0) {
            const firstTrack = albumTracks[0];
            playTrack(firstTrack, albumTracks);
            navigate(`/track/${firstTrack.trackId}`);
        } else {
            console.log(`No tracks found for album "${album.title}"`);
        }
    };


    // --- ОБРОБКА СТАНІВ ЗАВАНТАЖЕННЯ ---
    if (isLoading) {
        // TODO: Створити кращий скелетон для сторінки артиста
        return (
            <MusicSectionWrapper spacing="top-only">
                <SectionSkeleton title={t('loading', 'Завантаження...')} />
            </MusicSectionWrapper>
        );
    }

    if (isError) {
        return (
            <MusicSectionWrapper spacing="top-only">
                <SectionSkeleton
                    title={t('artist_not_found', 'Виконавця не знайдено')}
                    isError={true}
                    error={error}
                />
            </MusicSectionWrapper>
        );
    }

    if (!artist) {
        return <div>{t('artist_not_found', 'Виконавця не знайдено')}</div>;
    }
    // --- КІНЕЦЬ ОБРОБКИ СТАНІВ ---


    return (
        <MusicSectionWrapper spacing="none">
            {/* ... (Хедер Hero - використовує дані 'artist') ... */}
            <div className="artist-hero" style={{ backgroundImage: `url(${artist.imageUrl})` }}>
                <div className="artist-hero-overlay"></div>
                <div className="artist-hero-content">
                    <img src={artist.imageUrl} alt={artist.name} className="artist-hero-avatar" />
                    <div className="artist-hero-info">
                        <h1 className="artist-hero-name">{artist.name}</h1>
                        {artist.listenersMonthy && (
                            <p className="artist-hero-listeners">
                                {artist.listenersMonthy} {t('artist_listeners', 'слухачів на місяць')}
                            </p>
                        )}
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

            {/* ... (Навігація вкладками - використовує 'tabs') ... */}
            <nav className="artist-tabs">
                {tabs.map(tab => (
                    <button key={tab.id} className={`artist-tab-button ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                        {tab.label}
                    </button>
                ))}
            </nav>

            {/* ... (Контент вкладок - використовує 'artist') ... */}
            <MusicSectionWrapper spacing="default">
                <div className="artist-tab-content">
                    {activeTab === 'about' && <AboutTab artist={artist} />}

                    {activeTab === 'history' && artist.history && <HistoryTab artist={artist} />}

                    {activeTab === 'members' && artist.members?.length > 0 && <MembersTab members={artist.members} />}

                    {activeTab === 'discography' && artist.discography?.length > 0 &&
                        <DiscographyTab
                            albums={artist.discography}
                            onPlayAlbum={handlePlayAlbum}
                        />
                    }

                    {activeTab === 'notes' &&
                        <ArtistNotesTab
                            initialNotes={artist.notes || []}
                            popularTracks={artist.popularTracks || []} // popularTracks також має завантажуватись
                        />
                    }
                </div>
            </MusicSectionWrapper>

            {/* ... (Популярні треки - використовує 'artist.popularTracks') ... */}
            {artist.popularTracks?.length > 0 && (
                <MusicSectionWrapper spacing="default">
                    <TrackSection
                        title={t('artist_popular_tracks', 'Популярні треки')}
                        tracks={artist.popularTracks}
                        onMoreClick={() => console.log('More popular tracks clicked')}
                    />
                </MusicSectionWrapper>
            )}

            {/* ... (Схожі артисти - використовує 'artist.similarArtists') ... */}
            {artist.similarArtists?.length > 0 && (
                <MusicSectionWrapper spacing="default">
                    <ArtistSection
                        title={t('artist_similar', 'Схожі артисти')}
                        artists={artist.similarArtists}
                        onMoreClick={() => console.log('More similar artists clicked')}
                    />
                </MusicSectionWrapper>
            )}

        </MusicSectionWrapper>
    );
}