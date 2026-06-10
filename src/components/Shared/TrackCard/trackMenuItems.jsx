import {
    Play, Pause,
    VolumeX, Volume1, Volume2,
    Share2, Download, AlertCircle,
    ListStart, ListX, Trash2, Send,
} from 'lucide-react';
import {logger} from '../../../utils/logger.js';

export const createTrackMenuItems = ({
                                         t,
                                         isPlaying,
                                         isMuted,
                                         volume,
                                         handlePlayPause,
                                         isCurrentTrack,
                                         toggleMute,
                                         updateVolume,
                                         title,
                                         artist,
                                         audio,
                                         hasValidAudio = true,
                                         isQueueContext = false,
                                         indexInQueue,
                                         trackId,
                                         onInsertNext,
                                         onRemoveFromQueue,
                                         onRemoveFromHistory,
                                         onShareToChat,
                                     }) => {
    const menuItems = [
        {
            id: 'play',
            label: t('menu_play'),
            icon: <Play size={16}/>,
            shortcut: 'Space',
            disabled: !hasValidAudio || isPlaying,
            action: () => !isPlaying && hasValidAudio && handlePlayPause(),
            tooltip: !hasValidAudio ? t('track_no_audio') : undefined,
        },
        {
            id: 'pause',
            label: t('menu_pause'),
            icon: <Pause size={16}/>,
            shortcut: 'Space',
            disabled: !hasValidAudio || !isPlaying,
            action: () => isPlaying && hasValidAudio && handlePlayPause(),
            tooltip: !hasValidAudio ? t('track_no_audio') : undefined,
        },
        {type: 'separator'},
    ];

    if (hasValidAudio && isCurrentTrack) {
        menuItems.push(
            {
                id: 'mute',
                label: isMuted ? t('menu_unmute') : t('menu_mute'),
                icon: isMuted ? <Volume2 size={16}/> : <VolumeX size={16}/>,
                disabled: !isCurrentTrack,
                action: () => isCurrentTrack && toggleMute(),
            },
            {
                id: 'volumeUp',
                label: t('menu_volume_up'),
                icon: <Volume2 size={16}/>,
                shortcut: '↑',
                disabled: !isCurrentTrack || volume >= 1,
                action: () => isCurrentTrack && updateVolume(Math.min(1, volume + 0.1)),
            },
            {
                id: 'volumeDown',
                label: t('menu_volume_down'),
                icon: <Volume1 size={16}/>,
                shortcut: '↓',
                disabled: !isCurrentTrack || volume <= 0,
                action: () => isCurrentTrack && updateVolume(Math.max(0, volume - 0.1)),
            },
            {type: 'separator'},
        );
    }

    menuItems.push({
        id: 'play-next',
        label: t('menu_play_next'),
        icon: <ListStart size={16}/>,
        disabled: !hasValidAudio,
        action: () => hasValidAudio && onInsertNext?.(),
    });

    if (isQueueContext) {
        menuItems.push({
            id: 'remove-from-queue',
            label: t('menu_remove_from_queue'),
            icon: <ListX size={16}/>,
            variant: 'danger',
            action: () => onRemoveFromQueue?.(),
        });
    }

    menuItems.push(
        {type: 'separator'},
        {
            id: 'share-to-chat',
            label: t('menu_share_to_chat'),
            icon: <Send size={16}/>,
            disabled: !hasValidAudio,
            action: () => hasValidAudio && trackId && onShareToChat?.(trackId),
        },
        {
            id: 'share',
            label: t('menu_share'),
            icon: <Share2 size={16}/>,
            disabled: !hasValidAudio,
            action: () => {
                if (!hasValidAudio) return;
                if (navigator.share) {
                    navigator
                        .share({
                            title: `${title} by ${artist}`,
                            text: `Listen to ${title} by ${artist}`,
                            url: window.location.href,
                        })
                        .catch((err) => {
                            if (err.name !== 'AbortError') logger.error('Share error:', err);
                        });
                } else {
                    navigator.clipboard
                        .writeText(`${title} by ${artist} - ${window.location.href}`)
                        .catch((err) => logger.error('Copy error:', err));
                }
            },
        },
        {
            id: 'download',
            label: t('menu_download'),
            icon: <Download size={16}/>,
            disabled: !audio || !hasValidAudio,
            action: () => {
                if (!audio || !hasValidAudio) return;
                const link = document.createElement('a');
                link.href = audio;
                link.download = `${title} - ${artist}.mp3`;
                link.click();
            },
            tooltip: !audio ? t('track_no_audio') : undefined,
        },
    );

    if (onRemoveFromHistory) {
        menuItems.push(
            {type: 'separator'},
            {
                id: 'remove-from-history',
                label: t('menu_remove_from_history'),
                icon: <Trash2 size={16}/>,
                isDanger: true,
                action: () => onRemoveFromHistory(),
            },
        );
    }

    if (!hasValidAudio) {
        menuItems.unshift(
            {
                id: 'unavailable-info',
                label: t('track_unavailable'),
                icon: <AlertCircle size={16}/>,
                disabled: true,
                variant: 'danger',
            },
            {type: 'separator'},
        );
    }

    return menuItems;
};