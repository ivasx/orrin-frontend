# Orrin Frontend

[🇺🇦 Українська](README.md) | **[🇬🇧 English](README-ENG.md)**

Frontend part of **Orrin** web application — a music service with social network elements.

[![React](https://img.shields.io/badge/React-19.1.1-61dafb?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.7-646cff?logo=vite)](https://vitejs.dev/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5.90.5-ff4154?logo=react-query)](https://tanstack.com/query)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 📋 Project Description

Orrin is an innovative web application that combines the functionality of a music service and a social network. Users can not only listen to music, but also interact with friends, share impressions and get interesting information about their favorite tracks.

### ✨ Key Features

- ✅ **Music Playback** — high-quality track playback with intuitive player
- ✅ **Social Interaction** — follow friends' activity and share tracks
- ✅ **Comments and Notes** — discuss tracks and create personal notes for artists
- ✅ **Information Pages** — detailed information about artists, history, discography
- ✅ **Smart Search** — search for tracks and artists with suggestions and history
- ✅ **Playback Queue** — manage track list with shuffle and repeat support
- ✅ **Media Session API** — integration with system media controls
- ✅ **Context Menus** — quick access to track functions
- ✅ **Multilingual** — support for Ukrainian and English
- ✅ **Responsive Design** — optimization for all device types
- 🔄 **Achievements and Gamification** — rewards for activity (in development)
- 🔄 **Offline Mode** — download tracks for listening without internet (in development)

## 🛠 Technologies

The project is built on a modern technology stack:

### Core
- **React 19.1.1** — library for building user interfaces
- **Vite 7.1.7** — fast development and build tool
- **React Router DOM 7.9.3** — client-side routing

### State Management & Data Fetching
- **Context API** — global state management
    - `AudioCoreContext` — audio player management
    - `QueueContext` — playback queue management
    - `PlayerUIContext` — player UI management
    - `SettingsContext` — app settings
- **TanStack Query 5.90.5** — server state management, caching and data synchronization

### Forms & Validation
- **React Hook Form 7.65.0** — form management
- **Yup 1.7.1** — schema validation
- **@hookform/resolvers 5.2.2** — validation integration with forms

### Internationalization
- **i18next 25.6.0** — internationalization
- **react-i18next 16.0.1** — React integration for i18next
- **i18next-browser-languagedetector 8.2.0** — automatic language detection

### UI & Icons
- **Lucide React 0.545.0** — icon library
- **React Icons 5.5.0** — additional icons

### Styling
- **CSS3** — component styling with CSS modules
- **CSS Custom Properties** — dynamic themes
- **Responsive Design** — adaptive design

### Development Tools
- **ESLint 9.36.0** — code linting
- **Docker** — application containerization
- **TanStack Query DevTools** — developer tools for Query

## 📁 Project Structure

```
orrin-frontend/
├── public/                          # Public static files
│   ├── orrin-logo.svg              # App logo
│   └── songs/                       # Audio files (demo)
├── src/
│   ├── assets/                      # Resources (images, audio)
│   ├── components/                  # Reusable UI components
│   │   ├── ArtistCard/             # Artist card
│   │   ├── ArtistNotesTab/         # Artist notes tab
│   │   ├── ArtistSection/          # Artists section
│   │   ├── BottomPlayer/           # Bottom player
│   │   ├── CreatePost/             # Create post
│   │   ├── Dropdown/               # Dropdown menu
│   │   ├── EmptyStateSection/      # Empty state
│   │   ├── FeedFilters/            # Feed filters
│   │   ├── FeedPost/               # Feed post
│   │   ├── Header/                 # Site header
│   │   ├── LoginPromptSection/     # Login prompt
│   │   ├── MusicLyrics/            # Music lyrics
│   │   ├── MusicSectionWrapper/    # Music section wrapper
│   │   ├── NoteCard/               # Note card
│   │   ├── OptionsMenu/            # Context menu
│   │   ├── SectionHeader/          # Section header
│   │   ├── SectionSkeleton/        # Loading skeleton
│   │   ├── Sidebar/                # Sidebar
│   │   ├── Spinner/                # Loading indicator
│   │   ├── TrackCard/              # Track card
│   │   └── TrackSection/           # Tracks section
│   ├── constants/                   # Constants and fallback values
│   │   └── fallbacks.js            # Data normalization
│   ├── context/                     # React Contexts
│   │   ├── AudioCoreContext.jsx    # Audio system core
│   │   ├── PlayerUIContext.jsx     # Player UI state
│   │   ├── QueueContext.jsx        # Playback queue
│   │   └── SettingsContext.jsx     # Settings
│   ├── data/                        # Mock data
│   │   └── mockData.js             # Development data
│   ├── hooks/                       # Custom React Hooks
│   │   ├── audio/                   # Audio hooks
│   │   ├── useMarquee.jsx          # Text scroll animation
│   │   └── useProgressBar.jsx      # Progress bar
│   ├── i18n/                        # Localization
│   │   ├── i18n.js                 # i18n configuration
│   │   ├── en.json                 # English translations
│   │   └── uk.json                 # Ukrainian translations
│   ├── layouts/                     # Page layouts
│   │   ├── HeaderOnlyLayout.jsx    # Header-only layout
│   │   └── MainLayout.jsx          # Main layout
│   ├── pages/                       # Page components
│   │   ├── ArtistPage/             # Artist page
│   │   ├── Auth/                    # Authentication
│   │   ├── FavoritesPage/          # Favorites
│   │   ├── FeedPage/               # Feed
│   │   ├── HistoryPage/            # History
│   │   ├── HomePage/               # Home
│   │   ├── LibraryPage/            # Library
│   │   ├── NotFoundPage/           # 404
│   │   ├── PlaylistsPage/          # Playlists
│   │   ├── RadioPage/              # Radio
│   │   ├── SearchResultsPage/      # Search results
│   │   ├── SettingsPage/           # Settings
│   │   ├── TopTracksPage/          # Top tracks
│   │   └── TrackPage/              # Track page
│   ├── services/                    # API services
│   │   └── api.js                  # HTTP requests to backend
│   ├── App.jsx                      # Main component
│   ├── App.css                      # App styles
│   ├── data.js                      # Test data (mock)
│   ├── main.jsx                     # Entry point
│   └── index.css                    # Global styles
├── .dockerignore                    # Docker exclusions
├── Dockerfile                       # Production build
├── Dockerfile.dev                   # Development build
├── nginx.conf                       # Nginx configuration
├── eslint.config.js                 # ESLint configuration
├── vite.config.js                   # Vite configuration
├── package.json                     # Project dependencies
└── README.md                        # This file
```

## 🚀 Installation and Setup

### Requirements

- Node.js (version 20 or higher)
- npm (version 8 or higher)

### ⚠️ Important: Backend API

**For correct operation of the application, you need to run the backend server!**

The backend is located in a separate repository: [orrin-backend](https://github.com/ivasx/orrin-backend)

Make sure the backend is running at `http://127.0.0.1:8000` or update the `VITE_API_BASE_URL` environment variable in the `.env` file:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/ivasx/orrin-frontend.git
cd orrin-frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env` file (optional):**
```bash
VITE_API_BASE_URL=http://127.0.0.1:8000
```

4. **Run the project in development mode:**
```bash
npm run dev
```

5. **Open browser at:**
```
http://localhost:5173
```

### Production Build

```bash
npm run build
```

The finished files will be in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## 🐳 Docker

### Development

```bash
# Build dev image
docker build -f Dockerfile.dev -t orrin-frontend-dev .

# Run dev container
docker run -p 5173:5173 -v $(pwd):/app orrin-frontend-dev
```

### Production

```bash
# Build production image
docker build -t orrin-frontend .

# Run production container
docker run -p 80:80 orrin-frontend
```

## 🎯 Main Components

### Header
Website header with logo, smart search, and navigation. Supports:
- Responsive design with mobile menu
- Search with suggestions and history
- Automatic language detection

### TrackCard
Track card component with the following features:
- Play/pause with ripple effect
- Context menu (play, pause, mute, volume, share, download)
- Visual effects (animated playback indicators)
- Adaptation for touch and desktop devices
- Navigation to track and artist pages

### AudioCoreContext
Global context for music playback management:
- Centralized player status management
- Synchronization between components
- Playlist and queue support
- Repeat modes (off, all, one)
- Integration with Media Session API

### TanStack Query Integration
Server state management:
- Automatic request caching
- Background data updates
- Optimistic updates
- Error handling and retry logic
- DevTools for debugging

## 💡 Implementation Features

### State Management
- Using React Context API for global UI state
- TanStack Query for server state and caching
- Separating logic into separate contexts (Audio, Queue, UI, Settings)
- Local component state via useState and useEffect
- Memoization of callback functions via useCallback and useMemo

### API Integration
- Centralized API requests through `src/services/api.js`
- Data normalization through `src/constants/fallbacks.js`
- Fallback to mock data when API is unavailable
- Automatic loading error handling

### Responsiveness
- Mobile-first approach
- Touch gesture support
- Optimization for different screen sizes
- Adaptive context menus

### Accessibility
- Semantic HTML
- ARIA attributes for all interactive elements
- Keyboard navigation in menus
- Screen reader support

### Performance
- Lazy loading of images
- Re-render optimization via React.memo and useMemo
- Efficient event management
- Throttling for drag operations
- Debouncing for search
- Request caching via TanStack Query

### Internationalization
- Support for Ukrainian and English languages
- Automatic browser language detection
- Saving language selection in localStorage
- Language switching without reloading

### Media Session API
- Integration with system media controls
- Display of cover art, title, and artist
- Playback progress updates
- Command processing (play, pause, previous, next)

## 🎨 Customization

### Themes
The app uses CSS Custom Properties for customization. Main variables:
```css
:root {
  --player-height: 84px; /* Player height */
}
```

### Localization
To add a new language:
1. Create a file `src/i18n/{language_code}.json`
2. Add translations following the example of existing files
3. Import and register in `src/i18n/i18n.js`

## 🔧 API Integration

The application integrates with the backend API through `src/services/api.js`.

### Main endpoints:
- `GET /api/v1/tracks/` — get list of tracks
- `GET /api/v1/tracks/{slug}/` — track details
- `GET /api/v1/artists/` — list of artists
- `GET /api/v1/artists/{slug}/` — artist details

### Fallback Mechanism
When the API is unavailable, the application automatically uses mock data from `src/data.js` and `src/data/mockData.js`.

## 🤝 Contributing

We are open to contributions! If you want to help:

1. Fork the project
2. Create a branch for your feature:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit the changes:
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. Push the changes:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open Pull Request

### Coding Guidelines
- Use ESLint to check your code
- Follow the existing component structure
- Add comments for complex logic
- Create separate CSS files for component styles
- Use functional components and hooks
- Use TanStack Query for API requests

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Authors

- **Ivas** - [@ivasx](https://github.com/ivasx)

## 📞 Contact

If you have any questions or suggestions, please contact us:
- **Email:** ambroziak.v.ivan@gmail.com
- **GitHub Issues:** [orrin-frontend/issues](https://github.com/ivasx/orrin-frontend/issues)

## 🙏 Acknowledgements

- [React](https://reactjs.org/) for the excellent library
- [Vite](https://vitejs.dev/) for the fast dev server
- [TanStack Query](https://tanstack.com/query) for server state management
- [Lucide](https://lucide.dev/) for the beautiful icons
- [i18next](https://www.i18next.com/) for internationalization

---

**Orrin** — music that brings people together! 🎵