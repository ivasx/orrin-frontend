import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaInstagram, FaYoutube, FaSpotify, FaShareAlt, FaPen } from 'react-icons/fa';
import { Play } from 'lucide-react';
import './ArtistPage.css'; // Створимо цей файл наступним
import { popularArtists } from '../../data.js';
import MusicSectionWrapper from '../../components/MusicSectionWrapper/MusicSectionWrapper.jsx';
import TrackSection from '../../components/TrackSection/TrackSection.jsx';
import ArtistSection from '../../components/ArtistSection/ArtistSection.jsx';
import ArtistCard from '../../components/ArtistCard/ArtistCard.jsx';

// Внутрішній компонент для вкладки "Про артиста"
function AboutTab({ artist }) {
    return (
        <div className="artist-about-section">
            <p className="artist-description">{artist.description}</p>
            <div className="artist-meta">
                {artist.location && <p><strong>Місто:</strong> {artist.location}</p>}
                {artist.joinDate && <p><strong>Активний з:</strong> {artist.joinDate}</p>}
            </div>
            {artist.socials && (
                <div className="artist-socials">
                    {artist.socials.instagram && <a href={artist.socials.instagram} target="_blank" rel="noopener noreferrer"><FaInstagram /></a>}
                    {artist.socials.youtube && <a href={artist.socials.youtube} target="_blank" rel="noopener noreferrer"><FaYoutube /></a>}
                    {artist.socials.spotify && <a href={artist.socials.spotify} target="_blank" rel="noopener noreferrer"><FaSpotify /></a>}
                </div>
            )}
        </div>
    );
}

// Внутрішній компонент для вкладки "Історія"
function HistoryTab({ artist }) {
    return (
        <div className="artist-history-section">
            <p>{artist.history}</p>
        </div>
    );
}

// Внутрішній компонент для вкладки "Склад гурту"
function MembersTab({ members }) {
    const { t } = useTranslation();
    return (
        <div className="artist-members-grid">
            {members.map(member => (
                // Використовуємо ArtistCard для відображення учасників
                <ArtistCard
                    key={member.id}
                    id={member.id} // TODO: Потрібно мати ID артиста, якщо це інший артист
                    name={member.name}
                    role={member.role} // Передаємо 'role' замість 'subtitle'
                    imageUrl={member.imageUrl}
                />
            ))}
        </div>
    );
}

// Внутрішній компонент для вкладки "Дискографія"
function DiscographyTab({ albums }) {
    return (
        <div className="artist-discography-list">
            {albums.map(album => (
                <div key={album.id} className="album-card">
                    <img src={album.cover} alt={album.title} className="album-cover" />
                    <div className="album-info">
                        <span className="album-title">{album.title}</span>
                        <span className="album-meta">{album.year} • {album.type}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function ArtistPage() {
    const { t } = useTranslation();
    const { artistId } = useParams();
    const [activeTab, setActiveTab] = useState('about');

    // Знаходимо артиста.
    // Використовуємо useMemo, щоб уникнути повторного пошуку при кожному рендері.
    const artist = useMemo(() => {
        // `artistId` з URL - це рядок, `artist.id` у нас число
        return popularArtists.find(a => a.id.toString() === artistId);
    }, [artistId]);

    if (!artist) {
        // TODO: Замінити на компонент NotFoundPage
        return <div>{t('artist_not_found', 'Виконавця не знайдено')}</div>;
    }

    // Вкладки, які будуть рендеритись
    const tabs = [
        { id: 'about', label: t('artist_about', 'Про артиста') },
        { id: 'history', label: t('artist_history', 'Історія') },
    ];

    // Динамічно додаємо вкладку "Склад гурту"
    if (artist.type === 'group' && artist.members.length > 0) {
        tabs.push({ id: 'members', label: t('artist_members', 'Склад гурту') });
    }

    tabs.push({ id: 'discography', label: t('artist_discography', 'Дискографія') });


    return (
        <MusicSectionWrapper spacing="none">
            {/* --- 1. Хедер (Hero) --- */}
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
                            <button className="control-btn"><FaShareAlt size={20} /></button>
                            <button className="control-btn"><FaPen size={20} /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 2. Кнопки (Вкладки) --- */}
            <nav className="artist-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`artist-tab-button ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            {/* --- 3. Контент вкладок --- */}
            <MusicSectionWrapper spacing="default">
                <div className="artist-tab-content">
                    {activeTab === 'about' && <AboutTab artist={artist} />}
                    {activeTab === 'history' && <HistoryTab artist={artist} />}
                    {activeTab === 'members' && <MembersTab members={artist.members} />}
                    {activeTab === 'discography' && <DiscographyTab albums={artist.discography} />}
                </div>
            </MusicSectionWrapper>

            {/* --- 4. Популярні треки --- */}
            <MusicSectionWrapper spacing="default">
                <TrackSection
                    title={t('artist_popular_tracks', 'Популярні треки')}
                    tracks={artist.popularTracks}
                    onMoreClick={() => console.log('More popular tracks')}
                />
            </MusicSectionWrapper>

            {/* --- 5. Нотатки (Mockup) --- */}
            <MusicSectionWrapper spacing="default">
                <div className="section-header">
                    <h3 className="section-title">{t('artist_notes', 'Нотатки')}</h3>
                    <button className="section-more">{t('more')}</button>
                </div>
                <div className="notes-mockup">
                    <p>Тут будуть публічні та приватні нотатки...</p>
                </div>
            </MusicSectionWrapper>

            {/* --- 8. Схожі артисти --- */}
            <MusicSectionWrapper spacing="default">
                <ArtistSection
                    title={t('artist_similar', 'Схожі артисти')}
                    artists={artist.similarArtists}
                    onMoreClick={() => console.log('More similar artists')}
                />
            </MusicSectionWrapper>

        </MusicSectionWrapper>
    );
}