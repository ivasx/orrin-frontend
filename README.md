# Orrin Frontend

[![🇺🇦 Українська версія](https://img.shields.io/badge/🇺🇦_Мова-Українська-1565C0?style=flat-square)](./README-UK.md)

A high-fidelity music streaming application with integrated social networking and real-time direct messaging. Built on
React 19 with a modular, offline-capable architecture.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
    - [Audio Engine](#audio-engine)
    - [Real-Time WebSocket Layer](#real-time-websocket-layer)
    - [State Management](#state-management)
    - [Network Layer & Security](#network-layer--security)
    - [RBAC & Routing](#rbac--routing)
    - [Dual-Environment Mock System](#dual-environment-mock-system)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Pages & Features](#pages--features)
- [Context Providers](#context-providers)
- [Custom Hooks](#custom-hooks)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [Contact](#contact)
- [License](#license)

---

## Project Overview

Orrin is a web platform that combines music streaming with social features — users can follow artists, post to a social
feed with attached tracks, manage playlists, send direct messages in real time, and leave public/private notes on tracks
and artist profiles.

The frontend is engineered for performance, offline development, and maintainability. It supports two fully independent
runtime modes — live backend and a complete local mock system — switchable via a single environment variable.

---

## Architecture

### Audio Engine

Playback is managed by `AudioCoreContext`, a custom abstraction over the native HTML5 `<audio>` element. The engine is
intentionally decoupled from React's render cycle: high-frequency updates (seek position, buffering progress) are driven
by `requestAnimationFrame` rather than state changes, preventing unnecessary re-renders during continuous playback.

Key capabilities:

- **OS-level `MediaSession` API integration** — hardware media keys (play/pause/skip) and lock-screen controls work
  natively via `useMediaSession` and `useMediaSessionPosition`
- **Queue management** — full queue state lives in `QueueContext`, supporting add, remove, reorder (drag-and-drop safe),
  insert-next, shuffle (with original queue preservation), and repeat modes (off / track / queue)
- **Repeat & shuffle logic** — `useRepeatMode` and `useTrackEndHandler` coordinate automatic track advancement and
  single-track looping
- **Volume & mute** — persisted independently via `useAudioVolume`, never tied to playback state
- **Buffering state** — `useAudioLoading` tracks `waiting` / `canplay` events and surfaces `isLoading` / `loadError` to
  the UI

The `BottomPlayer` UI component consumes this context and renders sub-components (`TimeControls`, `VolumeControls`,
`FloatingMiniPlayer`) without owning any audio state.

### Real-Time WebSocket Layer

Direct messaging uses a custom singleton `SocketService` (`src/services/socket/socket.service.js`) implementing a clean
event-emitter interface (`on` / `off` / `emit`).

The real implementation (`RealSocket`) features:

- **Exponential backoff reconnection** — on unintentional close, retries up to 5 times with delays of `1s × 2^n`
- **JWT-secured handshake** — access token is appended to the WebSocket URL on connect
- **Intentional disconnect guard** — `_intentionalClose` flag prevents reconnection loops on manual teardown
- **Event dispatching** — incoming JSON messages are parsed and routed to registered listeners by `type` field

In mock mode, `MockSocket` simulates typing indicators and delayed incoming messages without a backend, enabling full
offline UI development of the chat interface.

### State Management

**Server state** is managed by TanStack React Query v5:

- Automatic background refetching and stale-data invalidation
- Optimistic UI updates for social actions (likes, reposts, saves, comments) with automatic cache rollback on mutation
  failure
- Infinite scrolling for feeds and discographies via `IntersectionObserver`
- Domain-specific query/mutation hooks: `useMusicQueries`, `usePostMutations`, `useArtistMutations`,
  `useUserProfileMutations`

**Client state** is distributed across eight focused React Context providers (
see [Context Providers](#context-providers)), composed without "context hell" via a `composeProviders` utility in
`AppProviders.jsx`.

### Network Layer & Security

The real API client (`api.real.js`) implements a production-grade fetch wrapper:

- **In-memory JWT storage** — the access token lives in a module-scoped variable, not `localStorage`, to reduce XSS
  exposure. Only the refresh token is persisted to `localStorage`
- **Silent token refresh with request queue** — on a `401` response, all in-flight requests are queued. A single refresh
  is negotiated in the background; on success, the queue is flushed and all requests are retried transparently. If the
  refresh fails, `onSessionExpiredCallback` triggers a forced logout
- **Structured error extraction** — `ApiError` carries `status`, `endpoint`, and parsed server error messages (
  field-level validation errors are joined into a readable string)
- **FormData-aware** — `Content-Type: application/json` is omitted automatically when `body` is a `FormData` instance

### RBAC & Routing

All routes are lazy-loaded via `React.lazy` with a `<Suspense>` boundary using the custom `VinylLoader` fallback (
`src/components/UI/Spinner/VinylLoader.jsx`).

Two levels of route protection are enforced by `ProtectedRoute`:

| Guard                            | Condition                                  | Redirect                                             |
|----------------------------------|--------------------------------------------|------------------------------------------------------|
| `requireArtistManagement: false` | User must be authenticated                 | `/login` (with `state.from` for post-login redirect) |
| `requireArtistManagement: true`  | User must manage the specific `artistSlug` | `/artist/:artistSlug` or `/`                         |

Artist management access is evaluated per-slug via `usePermissions` → `isArtistManager(slug)`, checking
`user.managed_artists` from the auth context. This means an artist manager for one profile cannot access the dashboard
of another.

### Dual-Environment Mock System

Setting `VITE_USE_MOCK_DATA=true` activates a complete parallel implementation:

| Layer     | Real                                | Mock                                                 |
|-----------|-------------------------------------|------------------------------------------------------|
| API       | `api.real.js` → Django REST backend | `api.mock.js` → in-memory data with simulated delays |
| Auth      | `auth.real.js` → JWT token endpoint | `auth.mock.js` → returns fake tokens                 |
| WebSocket | `RealSocket` → `ws://` connection   | `MockSocket` → simulates events locally              |

All mock data (`src/data/`) covers tracks, artists, users, posts, playlists, notifications, chat messages, and legal
content. Mutable mock state (history, messages, chats) supports write operations (create, delete, mark-as-read) within
the session.

---

## Tech Stack

| Component            | Technology                                     | Version         |
|----------------------|------------------------------------------------|-----------------|
| Core Framework       | React                                          | 19.1.1          |
| Build Tool           | Vite                                           | 7.1.7           |
| Server State         | TanStack React Query                           | 5.90.5          |
| Routing              | React Router DOM                               | 7.9.3           |
| Forms                | React Hook Form + `@hookform/resolvers`        | 7.65.0          |
| Schema Validation    | Yup                                            | 1.7.1           |
| Styling              | CSS Modules + CSS Custom Properties            | —               |
| Internationalization | i18next + react-i18next + browser detector     | 25.6.0          |
| Icons                | Lucide React + React Icons                     | 0.545.0 / 5.5.0 |
| Linting              | ESLint 9 + react-hooks + react-refresh plugins | 9.36.0          |

---

## Project Structure

```text
orrin-frontend/
├── public/                         # Static assets served at root (logo, default avatar)
├── src/
│   ├── assets/                     # Bundled static resources (images, SVGs)
│   ├── components/
│   │   ├── Layout/
│   │   │   └── BottomPlayer/       # Media player UI (TimeControls, VolumeControls, FloatingMiniPlayer)
│   │   ├── Shared/
│   │   │   ├── TrackCard/          # Reusable track entity component
│   │   │   ├── AlbumCard/          # Reusable album entity component
│   │   │   ├── FeedPost/           # Social feed post component
│   │   │   └── MusicLyrics/        # Synchronized lyrics renderer
│   │   └── UI/
│   │       └── Spinner/
│   │           └── VinylLoader.jsx # Suspense fallback — animated vinyl record
│   ├── constants/
│   │   └── fallbacks.js            # Data normalizers: normalizeTrackData, normalizeArtistData,
│   │                               # normalizeUserData, normalizePostData
│   ├── context/
│   │   ├── AppProviders.jsx        # Composes all providers via composeProviders()
│   │   ├── AudioCoreContext.jsx    # HTML5 audio engine, MediaSession, playback controls
│   │   ├── AuthContext.jsx         # Session state, login/logout, token lifecycle
│   │   ├── NotificationContext.jsx # Global notification state and actions
│   │   ├── PlayerUIContext.jsx     # Player expanded/collapsed/queue/volume panel state
│   │   ├── QueueContext.jsx        # Playback queue, shuffle, reorder, insert-next
│   │   ├── SettingsContext.jsx     # Theme (dark/light) and UI preferences, persisted to localStorage
│   │   ├── SidebarContext.jsx      # Navigation sidebar open/close state
│   │   └── ToastContext.jsx        # Global snackbar notifications (success/error/info)
│   ├── data/                       # Mock data payloads (tracks, artists, users, chats, etc.)
│   │   └── mocks/                  # Domain-specific mock files (notifications, legal)
│   ├── hooks/
│   │   ├── audio/                  # useAudioElement, useAudioPlayback, useAudioVolume,
│   │   │                           # useAudioLoading, useRepeatMode, useTrackNavigation,
│   │   │                           # useTrackEndHandler, useMediaSession, useMediaSessionPosition
│   │   ├── useMusicQueries.js      # React Query wrappers for music data fetching
│   │   ├── useArtistMutations.js   # Artist profile update mutations
│   │   ├── usePostMutations.js     # Feed post create/like/repost/save mutations
│   │   ├── useUserProfileMutations.js
│   │   ├── useChat.js              # WebSocket chat abstraction (send, receive, typing)
│   │   ├── useNotifications.js     # Notification fetching and mark-as-read
│   │   ├── usePermissions.js       # RBAC: isArtistManager(slug) evaluation
│   │   ├── useRequiresAuth.js      # Route guard redirect logic
│   │   ├── useTotalUnreadMessages.js
│   │   ├── useDebounce.js
│   │   ├── useGoogleAuth.js
│   │   ├── useMarquee.js           # Auto-scrolling overflowing text
│   │   └── useProgressBar.js       # Playback position percentage calculation
│   ├── i18n/                       # en.json, uk.json translation files + i18next config
│   ├── layouts/
│   │   ├── MainLayout.jsx          # Shell with sidebar, bottom player, toast container
│   │   └── HeaderOnlyLayout.jsx    # Minimal shell for 404
│   ├── pages/
│   │   ├── Auth/                   # Login, Register, ForgotPassword, ResetPassword
│   │   ├── ArtistDashboardPage/    # Artist manager: profile edit, track upload
│   │   ├── ArtistPage/             # Public artist profile: discography, members, notes
│   │   ├── BrowseAllPage/          # Generic paginated list (tracks / artists / friends)
│   │   ├── FavoritesPage/          # User's liked songs
│   │   ├── FeedPage/               # Social timeline with infinite scroll
│   │   ├── HistoryPage/            # Listening history with delete/clear
│   │   ├── HomePage/               # Authenticated landing dashboard
│   │   ├── LegalPages/             # TermsPage, PrivacyPage
│   │   ├── LibraryPage/            # Saved albums, playlists, followed artists
│   │   ├── MessagesPage/           # Real-time direct messaging
│   │   ├── NotFoundPage/           # 404 view
│   │   ├── PlaylistsPage/          # Playlist detail with track list
│   │   ├── RadioPage/              # Continuous algorithm-driven playback
│   │   ├── SearchResultsPage/      # Global search: tracks, artists, users
│   │   ├── SettingsPage/           # Language, theme, account preferences
│   │   ├── TopTracksPage/          # Trending tracks chart
│   │   ├── TrackPage/              # Track detail: comments, notes, lyrics tabs
│   │   └── UserProfilePage/        # Public user profile: posts, followers
│   ├── routes/
│   │   ├── AppRouter.jsx           # All route definitions, lazy imports, Suspense boundary
│   │   └── ProtectedRoute.jsx      # Auth guard + artist management guard
│   ├── services/
│   │   ├── api/
│   │   │   ├── api.real.js         # Production HTTP client (fetch + JWT refresh queue)
│   │   │   ├── api.mock.js         # Full mock implementation with mutable in-memory state
│   │   │   └── index.js            # Runtime selector: exports real or mock based on VITE_USE_MOCK_DATA
│   │   ├── auth/
│   │   │   ├── auth.real.js        # Real auth endpoints (login, register, /users/me/)
│   │   │   ├── auth.mock.js        # Mock auth with fake token generation
│   │   │   └── index.js            # Runtime selector based on VITE_USE_MOCK_AUTH
│   │   └── socket/
│   │       └── socket.service.js   # Singleton SocketService: RealSocket (exponential backoff)
│   │                               # or MockSocket (simulated events), same interface
│   ├── utils/
│   │   └── logger.js               # Dev-only console wrapper (suppressed in production)
│   ├── App.jsx                     # BrowserRouter + QueryClient + AppProviders + AppRouter
│   └── main.jsx                    # ReactDOM.createRoot entry point
├── .env.dist                       # Environment variable template
├── Dockerfile                      # Multi-stage build: node:20-alpine builder → nginx:alpine runner
├── nginx.conf                      # nginx SPA config (all routes → index.html)
├── vercel.json                     # Vercel SPA rewrite rule
├── i18next-parser.config.js        # i18n key extraction config (locales: en, uk)
├── eslint.config.js                # ESLint 9 flat config
├── package.json
└── vite.config.js                  # Vite dev server (host: true, port: 5173, polling)
```

---

## Pages & Features

| Page             | Route                                                        | Auth Required    | Notes                                     |
|------------------|--------------------------------------------------------------|------------------|-------------------------------------------|
| Home             | `/`                                                          | No               | Dashboard for authenticated users         |
| Feed             | `/feed`                                                      | No               | Social timeline, infinite scroll          |
| Track            | `/track/:trackId`                                            | No               | Comments, notes, lyrics tabs              |
| Search           | `/search`                                                    | No               | Global: tracks, artists, users            |
| Artist Profile   | `/artist/:artistSlug`                                        | No               | Discography, members, similar artists     |
| User Profile     | `/user/:userId`                                              | No               | Posts, followers                          |
| Browse           | `/tracks`, `/artists`, `/friends`                            | No               | Paginated list views                      |
| Library          | `/library`                                                   | ✓                | Playlists, saved albums, followed artists |
| Playlist         | `/playlist/:id`                                              | ✓                | Playlist detail and playback              |
| Favorites        | `/favorites`                                                 | ✓                | Liked songs                               |
| History          | `/history`                                                   | ✓                | Listening history, clearable              |
| Messages         | `/messages/:chatId`                                          | ✓                | Real-time WebSocket chat                  |
| Settings         | `/settings`                                                  | No               | Language, theme, preferences              |
| Artist Dashboard | `/artist/:artistSlug/manage`                                 | ✓ Artist Manager | Profile and track upload                  |
| Legal            | `/terms`, `/privacy`                                         | No               | Localized content from API                |
| Auth             | `/login`, `/register`, `/forgot-password`, `/reset-password` | No               | Full auth flows                           |

---

## Context Providers

All providers are composed in `AppProviders.jsx` using `composeProviders`, eliminating nested JSX. Provider order
matters — providers higher in the tree can be consumed by those below.

| Context               | Responsibility                                                                                                                                           |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| `AuthContext`         | User session, `isLoggedIn`, `login()`, `logout()`, token refresh callback registration                                                                   |
| `NotificationContext` | Notification list, unread count, `markAsRead`, `markAllAsRead`                                                                                           |
| `SettingsContext`     | Theme (`dark`/`light`) persisted to `localStorage`, `toggleTheme()`                                                                                      |
| `ToastContext`        | `showToast(message, type)` — auto-dismisses after 4s                                                                                                     |
| `SidebarContext`      | Sidebar `isOpen`, `toggle()`, `close()`                                                                                                                  |
| `QueueContext`        | Full playback queue array, `currentIndex`, shuffle state, all queue mutations                                                                            |
| `PlayerUIContext`     | `isExpanded`, `showQueue`, `showTrackInfo`, `showVolumeControl`, `isPlayerCollapsed`                                                                     |
| `AudioCoreContext`    | `playTrack()`, `pauseTrack()`, `seek()`, `seekToPercent()`, `nextTrack()`, `previousTrack()`, `toggleRepeat()`, `toggleMute()`, `isLoading`, `loadError` |

---

## Custom Hooks

**Audio (src/hooks/audio/)**

| Hook                      | Responsibility                                                                 |
|---------------------------|--------------------------------------------------------------------------------|
| `useAudioElement`         | Creates and configures the `HTMLAudioElement` ref; swaps `src` on track change |
| `useAudioPlayback`        | `play()`, `pause()`, `stop()` handlers with `isPlaying` state                  |
| `useAudioVolume`          | Volume level and mute state, applied directly to the audio element             |
| `useAudioLoading`         | Tracks `waiting` / `canplay` / `error` events → `isLoading`, `loadError`       |
| `useRepeatMode`           | Cycles through `off` → `queue` → `track` repeat modes                          |
| `useTrackNavigation`      | `nextTrack()`, `previousTrack()`, `playTrackByIndex()`                         |
| `useTrackEndHandler`      | Decides what happens at track end based on repeat mode                         |
| `useMediaSession`         | Registers `MediaSession` metadata and action handlers (OS-level)               |
| `useMediaSessionPosition` | Keeps OS lock-screen progress bar in sync via `setPositionState`               |

**Data & UI**

| Hook                      | Responsibility                                                  |
|---------------------------|-----------------------------------------------------------------|
| `useMusicQueries`         | React Query hooks for tracks, artists, feed, library, search    |
| `usePostMutations`        | Optimistic like / repost / save / comment mutations             |
| `useArtistMutations`      | Artist profile PATCH with cache invalidation                    |
| `useUserProfileMutations` | User profile PATCH                                              |
| `useChat`                 | WebSocket send/receive, typing indicator debounce, message list |
| `useNotifications`        | Fetch notifications, unread count calculation                   |
| `usePermissions`          | `isArtistManager(slug)` — checks `user.managed_artists`         |
| `useRequiresAuth`         | Redirects to `/login` if unauthenticated                        |
| `useTotalUnreadMessages`  | Aggregates unread count across all chats for nav badge          |
| `useProgressBar`          | Calculates `currentTime` percentage for the seek bar            |
| `useDebounce`             | Delays a value update (used for search input)                   |
| `useGoogleAuth`           | Handles Google One Tap / OAuth flow                             |
| `useMarquee`              | Auto-scrolls track title text when it overflows its container   |

---

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 8.x or higher

### Installation

```bash
git clone https://github.com/ivasx/orrin-frontend.git
cd orrin-frontend
npm install
```

### Environment Configuration

Copy the template and configure:

```bash
cp .env.dist .env
```

```env
# Backend API base URL
VITE_API_BASE_URL=http://127.0.0.1:8000

# WebSocket base URL
VITE_WS_URL=ws://127.0.0.1:8000

# 'true' = use local mock data (no backend needed)
# 'false' = connect to a live backend
VITE_USE_MOCK_DATA=true
```

> With `VITE_USE_MOCK_DATA=true`, the application runs fully offline — all API calls, authentication, and WebSocket
> events are handled by the local mock system. No backend is required.

### Running Locally

```bash
npm run dev
```

Available at `http://localhost:5173`

---

## Available Scripts

| Script                 | Description                                                          |
|------------------------|----------------------------------------------------------------------|
| `npm run dev`          | Start Vite development server with HMR                               |
| `npm run build`        | Compile and bundle for production output to `/dist`                  |
| `npm run preview`      | Serve the production build locally for verification                  |
| `npm run lint`         | Run ESLint across all `.js` / `.jsx` files                           |
| `npm run i18n:extract` | Scan source files and update `src/i18n/en.json` + `src/i18n/uk.json` |

---

## Deployment

**Docker (self-hosted)**

The `Dockerfile` uses a multi-stage build:

1. **Builder** — `node:20-alpine`: installs dependencies, runs `vite build`
2. **Runner** — `nginx:alpine`: copies `/dist` to nginx web root, serves on port 80

```bash
docker build -t orrin-frontend .
docker run -p 80:80 orrin-frontend
```

**Vercel**

The project is configured for Vercel via `vercel.json`. All routes are rewritten to `index.html` for client-side routing
support. Push to the connected branch to trigger a deployment automatically.

Live demo: [https://orrin-yl1x.onrender.com](https://orrin-yl1x.onrender.com)

---

## Contact

- **Email:** ambroziak.v.ivan@gmail.com
- **GitHub Issues:** [orrin-frontend/issues](https://github.com/ivasx/orrin-frontend/issues)

**Author:** Ivas — [@ivasx](https://github.com/ivasx)

---

## License

MIT License — see [LICENSE](./LICENSE) for details.