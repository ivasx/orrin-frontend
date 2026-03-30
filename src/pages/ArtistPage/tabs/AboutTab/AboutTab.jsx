import {useTranslation} from 'react-i18next';
import {FaInstagram, FaYoutube, FaSpotify} from 'react-icons/fa';
import styles from './AboutTab.module.css';

export default function AboutTab({artist}) {
    const {t} = useTranslation();

    return (
        <div className={styles.container}>
            <p className={styles.description}>{artist.description}</p>

            <div className={styles.meta}>
                {artist.location && (
                    <p>
                        <strong>{t('artist_city')}:</strong> {artist.location}
                    </p>
                )}
                {artist.joinDate && (
                    <p>
                        <strong>{t('artist_active_since')}:</strong> {artist.joinDate}
                    </p>
                )}
            </div>

            {artist.socials && (
                <div className={styles.socials}>
                    {artist.socials.instagram && (
                        <a href={artist.socials.instagram} target="_blank" rel="noopener noreferrer"
                           className={styles.socialLink} aria-label="Instagram">
                            <FaInstagram/>
                        </a>
                    )}
                    {artist.socials.youtube && (
                        <a href={artist.socials.youtube} target="_blank" rel="noopener noreferrer"
                           className={styles.socialLink} aria-label="YouTube">
                            <FaYoutube/>
                        </a>
                    )}
                    {artist.socials.spotify && (
                        <a href={artist.socials.spotify} target="_blank" rel="noopener noreferrer"
                           className={styles.socialLink} aria-label="Spotify">
                            <FaSpotify/>
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}