import {
    Play,
    Pause,
    VolumeX,
    Volume1,
    Volume2,
    Share2,
    Download,
    AlertCircle,
    ListStart,
    ListX,
} from 'lucide-react';
import { logger } from '../../../utils/logger.js';

/**
 * @typedef {Object} TrackMenuConfig
 * @property {Function} t                   - i18next translation function.
 * @property {boolean}  isPlaying           - Whether this track is currently playing.
 * @property {boolean}  isMuted             - Whether audio is muted.
 * @property {number}   volume              - Current volume 0–1.
 * @property {Function} handlePlayPause     - Toggle playback for this track.
 * @property {boolean}  isCurrentTrack      - Whether this is the active track.
 * @property {Function} toggleMute          - Toggle mute state.
 * @property {Function} updateVolume        - Set a new volume level.
 * @property {string}   title               - Track title.
 * @property {string}   artist              - Track artist name.
 * @property {string}   [audio]             - Audio file URL.
 * @property {boolean}  [hasValidAudio]     - Whether playable audio exists.
 * @property {boolean}  [isQueueContext]    - True when rendered inside QueueList.
 * @property {number}   [indexInQueue]      - Full-queue index (required when isQueueContext is true).
 * @property {string}   [trackId]           - Track ID (required for queue operations).
 * @property {Function} [onInsertNext]      - Callback: insert this track immediately after current.
 * @property {Function} [onRemoveFromQueue] - Callback: remove this track from the queue.
 */

/**
 * Builds the context-menu items for a TrackCard.
 * Queue-specific actions (Play Next, Remove from Queue) are injected only when
 * `isQueueContext` is `true`, keeping the menu clean in non-queue contexts.
 *
 * @param {TrackMenuConfig} config
 * @returns {Array<Object>} Array of menu item descriptors consumed by ContextMenu.
 */
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
                                     }) => {
    const menuItems = [
        {
            id: 'play',
            label: t('menu_play'),
            icon: <Play size={16} />,
            shortcut: 'Space',
            disabled: !hasValidAudio || isPlaying,
            action: () => !isPlaying && hasValidAudio && handlePlayPause(),
            tooltip: !hasValidAudio ? t('track_no_audio', 'Audio unavailable') : undefined,
        },
        {
            id: 'pause',
            label: t('menu_pause'),
            icon: <Pause size={16} />,
            shortcut: 'Space',
            disabled: !hasValidAudio || !isPlaying,
            action: () => isPlaying && hasValidAudio && handlePlayPause(),
            tooltip: !hasValidAudio ? t('track_no_audio', 'Audio unavailable') : undefined,
        },
        { type: 'separator' },
    ];

    if (hasValidAudio && isCurrentTrack) {
        menuItems.push(
            {
                id: 'mute',
                label: isMuted ? t('menu_unmute') : t('menu_mute'),
                icon: isMuted ? <Volume2 size={16} /> : <VolumeX size={16} />,
                disabled: !isCurrentTrack,
                action: () => isCurrentTrack && toggleMute(),
            },
            {
                id: 'volumeUp',
                label: t('menu_volume_up'),
                icon: <Volume2 size={16} />,
                shortcut: '↑',
                disabled: !isCurrentTrack || volume >= 1,
                action: () => isCurrentTrack && updateVolume(Math.min(1, volume + 0.1)),
            },
            {
                id: 'volumeDown',
                label: t('menu_volume_down'),
                icon: <Volume1 size={16} />,
                shortcut: '↓',
                disabled: !isCurrentTrack || volume <= 0,
                action: () => isCurrentTrack && updateVolume(Math.max(0, volume - 0.1)),
            },
            { type: 'separator' },
        );
    }

    menuItems.push({
        id: 'play-next',
        label: t('menu_play_next', 'Play next'),
        icon: <ListStart size={16} />,
        disabled: !hasValidAudio,
        action: () => {
            if (hasValidAudio && onInsertNext) onInsertNext();
        },
    });

    if (isQueueContext) {
        menuItems.push({
            id: 'remove-from-queue',
            label: t('menu_remove_from_queue', 'Remove from queue'),
            icon: <ListX size={16} />,
            variant: 'danger',
            action: () => {
                if (onRemoveFromQueue) onRemoveFromQueue();
            },
        });
    }

    menuItems.push(
        { type: 'separator' },
        {
            id: 'share',
            label: t('menu_share'),
            icon: <Share2 size={16} />,
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
                        .catch(err => {
                            if (err.name !== 'AbortError') logger.error('Share error:', err);
                        });
                } else {
                    navigator.clipboard
                        .writeText(`${title} by ${artist} - ${window.location.href}`)
                        .then(() => logger.log('Link copied to clipboard'))
                        .catch(err => logger.error('Copy error:', err));
                }
            },
        },
        {
            id: 'download',
            label: t('menu_download'),
            icon: <Download size={16} />,
            disabled: !audio || !hasValidAudio,
            action: () => {
                if (audio && hasValidAudio) {
                    const link = document.createElement('a');
                    link.href = audio;
                    link.download = `${title} - ${artist}.mp3`;
                    link.click();
                }
            },
            tooltip: !audio ? t('track_no_audio', 'Audio unavailable') : undefined,
        },
    );

    if (!hasValidAudio) {
        menuItems.unshift(
            {
                id: 'unavailable-info',
                label: t('track_unavailable', 'Track unavailable'),
                icon: <AlertCircle size={16} />,
                disabled: true,
                variant: 'danger',
                className: 'menu-item-info',
            },
            { type: 'separator' },
        );
    }

    return menuItems;
};