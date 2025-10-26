import {
    Play,
    Pause,
    VolumeX,
    Volume1,
    Volume2,
    Share2,
    Download
} from 'lucide-react';


export const createTrackMenuItems = ({
                                         t, isPlaying, isMuted, volume, handlePlayPause, isCurrentTrack, audioRef,
                                         toggleMute,
                                         updateVolume,
                                         title, artist, audio
                                     }) => [
    {
        id: 'play',
        label: t('menu_play'),
        icon: <Play size={16}/>,
        shortcut: 'Space',
        disabled: isPlaying,
        action: () => !isPlaying && handlePlayPause()
    },
    {
        id: 'pause',
        label: t('menu_pause'),
        icon: <Pause size={16}/>,
        shortcut: 'Space',
        disabled: !isPlaying,
        action: () => isPlaying && handlePlayPause()
    },
    {type: 'separator'},
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
    {type: 'separator'},
    {
        id: 'share',
        label: t('menu_share'),
        icon: <Share2 size={16}/>,
        action: () => {
            // ... (код без змін)
            if (navigator.share) {
                navigator.share({
                    title: `${title} by ${artist}`,
                    text: `Listen to ${title} by ${artist}`,
                    url: window.location.href
                });
            } else {
                navigator.clipboard.writeText(`${title} by ${artist} - ${window.location.href}`);
            }
        }
    },
    {
        id: 'download',
        label: t('menu_download'),
        icon: <Download size={16}/>,
        action: () => {
            if (audio) {
                const link = document.createElement('a');
                link.href = audio;
                link.download = `${title} - ${artist}.mp3`;
                link.click();
            }
        }
    }
];