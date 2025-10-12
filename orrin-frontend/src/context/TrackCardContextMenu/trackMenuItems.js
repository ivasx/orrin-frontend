export const createTrackMenuItems = ({ isPlaying, isMuted, volume, title, artist, audio, handlePlayPause, setIsMuted, setVolume, audioRef }) => [
    {
        id: 'play',
        label: 'Play',
        icon: '▶',
        shortcut: 'Space',
        disabled: isPlaying,
        action: () => !isPlaying && handlePlayPause()
    },
    {
        id: 'pause',
        label: 'Pause',
        icon: '⸸',
        shortcut: 'Space',
        disabled: !isPlaying,
        action: () => isPlaying && handlePlayPause()
    },
    { type: 'separator' },
    {
        id: 'mute',
        label: isMuted ? 'Unmute' : 'Mute',
        icon: isMuted ? '🔊' : '🔇',
        action: () => {
            if (audioRef.current) {
                const newMuted = !isMuted;
                audioRef.current.muted = newMuted;
                setIsMuted(newMuted);
            }
        }
    },
    {
        id: 'volumeUp',
        label: 'Volume Up',
        icon: '🔊',
        shortcut: '↑',
        action: () => {
            if (audioRef.current) {
                const newVolume = Math.min(1, volume + 0.1);
                audioRef.current.volume = newVolume;
                setVolume(newVolume);
                if (isMuted) {
                    audioRef.current.muted = false;
                    setIsMuted(false);
                }
            }
        }
    },
    {
        id: 'volumeDown',
        label: 'Volume Down',
        icon: '🔉',
        shortcut: '↓',
        action: () => {
            if (audioRef.current) {
                const newVolume = Math.max(0, volume - 0.1);
                audioRef.current.volume = newVolume;
                setVolume(newVolume);
            }
        }
    },
    { type: 'separator' },
    {
        id: 'share',
        label: 'Share',
        icon: '📤',
        action: () => {
            if (navigator.share) {
                navigator.share({
                    title: `${title} by ${artist}`,
                    text: `Listen to ${title} by ${artist}`,
                    url: window.location.href,
                });
            } else {
                navigator.clipboard.writeText(`${title} by ${artist} - ${window.location.href}`);
            }
        }
    },
    {
        id: 'download',
        label: 'Download',
        icon: '💾',
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
