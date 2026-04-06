import { mockTracks } from './tracks.mock.js';

const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
const daysAgo  = (d) => new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();

export const mockHistory = [
    { ...mockTracks[1], historyEntryId: 'he-1',  playedAt: hoursAgo(1) },
    { ...mockTracks[4], historyEntryId: 'he-2',  playedAt: hoursAgo(2) },
    { ...mockTracks[0], historyEntryId: 'he-3',  playedAt: hoursAgo(3) },
    { ...mockTracks[6], historyEntryId: 'he-4',  playedAt: hoursAgo(4) },
    { ...mockTracks[2], historyEntryId: 'he-5',  playedAt: hoursAgo(5) },
    { ...mockTracks[7], historyEntryId: 'he-6',  playedAt: hoursAgo(7) },
    { ...mockTracks[3], historyEntryId: 'he-7',  playedAt: daysAgo(1)  },
    { ...mockTracks[5], historyEntryId: 'he-8',  playedAt: daysAgo(1)  },
    { ...mockTracks[1], historyEntryId: 'he-9',  playedAt: daysAgo(1)  },
    { ...mockTracks[0], historyEntryId: 'he-10', playedAt: daysAgo(1)  },
    { ...mockTracks[4], historyEntryId: 'he-11', playedAt: daysAgo(1)  },
    { ...mockTracks[6], historyEntryId: 'he-12', playedAt: daysAgo(3)  },
    { ...mockTracks[2], historyEntryId: 'he-13', playedAt: daysAgo(3)  },
    { ...mockTracks[7], historyEntryId: 'he-14', playedAt: daysAgo(3)  },
    { ...mockTracks[3], historyEntryId: 'he-15', playedAt: daysAgo(3)  },
    { ...mockTracks[5], historyEntryId: 'he-16', playedAt: daysAgo(3)  },
];