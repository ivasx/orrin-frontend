// src/components/TrackCard/trackMenuItems.jsx
import {
    Play,
    Pause,
    VolumeX,
    Volume1,
    Volume2,
    Share2,
    Download,
    AlertCircle
} from 'lucide-react';

export const createTrackMenuItems = ({
                                         t, isPlaying, isMuted, volume, handlePlayPause, isCurrentTrack,
                                         toggleMute, updateVolume, title, artist, audio, isPlayable = true
                                     }) => {
    // Базові пункти меню
    const menuItems = [
        {
            id: 'play',
            label: t('menu_play'),
            icon: <Play size={16}/>,
            shortcut: 'Space',
            disabled: !isPlayable || isPlaying,
            action: () => !isPlaying && isPlayable && handlePlayPause(),
            tooltip: !isPlayable ? t('track_no_audio', 'Аудіо недоступне') : undefined
        },
        {
            id: 'pause',
            label: t('menu_pause'),
            icon: <Pause size={16}/>,
            shortcut: 'Space',
            disabled: !isPlayable || !isPlaying,
            action: () => isPlaying && isPlayable && handlePlayPause(),
            tooltip: !isPlayable ? t('track_no_audio', 'Аудіо недоступне') : undefined
        },
        {type: 'separator'},
    ];

    // Додаємо контроли гучності тільки якщо трек доступний та є поточним
    if (isPlayable && isCurrentTrack) {
        menuItems.push(
            {
                id: 'mute',
                label: isMuted ? t('menu_unmute') : t('menu_mute'),
                icon: isMuted ? <Volume2 size={16}/> : <VolumeX size={16}/>,
                disabled: !isCurrentTrack,
                action: () => {
                    if (isCurrentTrack) {
                        toggleMute();
                    }
                }
            },
            {
                id: 'volumeUp',
                label: t('menu_volume_up'),
                icon: <Volume2 size={16}/>,
                shortcut: '↑',
                disabled: !isCurrentTrack || volume >= 1,
                action: () => {
                    if (isCurrentTrack) {
                        const newVolume = Math.min(1, volume + 0.1);
                        updateVolume(newVolume);
                    }
                }
            },
            {
                id: 'volumeDown',
                label: t('menu_volume_down'),
                icon: <Volume1 size={16}/>,
                shortcut: '↓',
                disabled: !isCurrentTrack || volume <= 0,
                action: () => {
                    if (isCurrentTrack) {
                        const newVolume = Math.max(0, volume - 0.1);
                        updateVolume(newVolume);
                    }
                }
            },
            {type: 'separator'}
        );
    }

    // Додаємо пункти поширення та завантаження
    menuItems.push(
        {
            id: 'share',
            label: t('menu_share'),
            icon: <Share2 size={16}/>,
            disabled: !isPlayable,
            action: () => {
                if (!isPlayable) return;

                if (navigator.share) {
                    navigator.share({
                        title: `${title} by ${artist}`,
                        text: `Listen to ${title} by ${artist}`,
                        url: window.location.href
                    }).catch(err => {
                        if (err.name !== 'AbortError') {
                            console.error('Share error:', err);
                        }
                    });
                } else {
                    // Fallback: копіюємо в буфер обміну
                    navigator.clipboard.writeText(
                        `${title} by ${artist} - ${window.location.href}`
                    ).then(() => {
                        // Можна показати toast повідомлення
                        console.log('Link copied to clipboard');
                    }).catch(err => {
                        console.error('Copy error:', err);
                    });
                }
            }
        },
        {
            id: 'download',
            label: t('menu_download'),
            icon: <Download size={16}/>,
            disabled: !audio || !isPlayable,
            action: () => {
                if (audio && isPlayable) {
                    const link = document.createElement('a');
                    link.href = audio;
                    link.download = `${title} - ${artist}.mp3`;
                    link.click();
                }
            },
            tooltip: !audio ? t('track_no_audio', 'Аудіо недоступне') : undefined
        }
    );

    // Якщо трек недоступний, додаємо інформаційний пункт
    if (!isPlayable) {
        menuItems.unshift(
            {
                id: 'unavailable-info',
                label: t('track_unavailable', 'Трек недоступний'),
                icon: <AlertCircle size={16}/>,
                disabled: true,
                variant: 'danger',
                className: 'menu-item-info'
            },
            {type: 'separator'}
        );
    }

    return menuItems;
};