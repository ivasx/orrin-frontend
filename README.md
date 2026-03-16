# Orrin Frontend

## Project Overview

Orrin is an enterprise-grade web application that merges high-fidelity music streaming with advanced social networking capabilities. This repository houses the highly optimized frontend architecture, engineered to deliver a seamless, high-performance user experience. Moving beyond a standard minimum viable product, the Orrin frontend leverages modern web technologies to handle complex state management, secure authentication flows, and latency-sensitive media playback.

## Core Architecture & Technical Highlights

The Orrin frontend has been significantly refactored to implement robust architectural patterns suitable for scale and maintainability.

### High-Performance Audio Engine

To prevent UI thread blocking during continuous audio playback, the application utilizes a zero-rerender Pub/Sub architecture. The media player's UI components, specifically the time controls and progress indicators, utilize `requestAnimationFrame` for 60FPS tracking. This approach completely bypasses the standard React render cycle for high-frequency updates, ensuring smooth animations and uninterrupted audio playback regardless of concurrent DOM mutations.

### Enterprise Network Layer

Security and session continuity are managed via a custom, robust network layer. Authentication relies on in-memory JSON Web Token (JWT) storage to mitigate Cross-Site Scripting (XSS) attack vectors. The application utilizes an advanced fetch interceptor equipped with a failed-request queue. Upon encountering a `401 Unauthorized` response, the interceptor pauses outgoing requests, silently negotiates a token refresh in the background, and subsequently flushes and retries the queued requests without user disruption.

### State Management & Optimistic UI

Global server state, caching, and data synchronization are orchestrated using TanStack React Query v5. This provides built-in mechanisms for background refetching and stale data invalidation. For heavy data loads such as activity feeds and discographies, the application implements infinite scrolling via the Intersection Observer API. To ensure perceived zero-latency interactions for social features (e.g., likes, reposts, and comments), Optimistic UI updates are heavily employed. These updates instantly mutate the local cache while the network request is pending, complete with automated rollback mechanisms if the mutation fails.

### Advanced RBAC & Routing

Application routing is deeply integrated with a strict Resource-Based Access Control (RBAC) system. Utilizing React Router, the architecture enforces strict route protection that evaluates permissions before rendering. The system accurately distinguishes between different user roles, specifically restricting features and data access among Unauthenticated Guests, Standard Users, and Artist Managers. This resource-based validation ensures that users only interact with authorized endpoints and UI views.

## Tech Stack

The application is built on a modern, strictly typed, and highly performant foundation:

| Dependency | Version |
|---|---|
| **Core Framework:** React | 19.1.1 |
| **Build Tool:** Vite | 7.1.7 |
| **State Management (Server):** TanStack React Query | 5.90.5 |
| **Routing:** React Router DOM | 7.9.3 |
| **Forms & Validation:** React Hook Form | 7.65.0 |
| **Schema Validation:** Yup | 1.7.1 |
| **Styling:** CSS Modules with CSS Custom Properties | — |
| **Internationalization:** i18next | 25.6.0 |
| **Icons:** Lucide React | 0.545.0 |
| **Icons:** React Icons | 5.5.0 |

## Project Structure

The codebase is organized into a modular, feature-centric directory structure to support enterprise scalability.

```text
orrin-frontend/
├── public/                 # Static assets and media files
├── src/
│   ├── assets/             # Bundled static resources (images, vectors)
│   ├── components/         # Reusable, domain-agnostic UI components
│   ├── constants/          # Application-wide constants and configuration values
│   ├── context/            # React Context providers for global client state (Audio, Settings)
│   ├── data/               # Mock data payloads for offline development
│   ├── hooks/              # Custom React hooks (Audio processing, Layout logic, Observers)
│   ├── i18n/               # Localization dictionaries and configuration
│   ├── layouts/            # Structural page wrappers (MainLayout, HeaderOnlyLayout)
│   ├── pages/              # Routable page components representing specific views
│   ├── routes/             # Route definitions and RBAC protection logic
│   ├── services/           # Network layer, API clients, and interceptor configurations
│   ├── utils/              # Pure utility functions and formatters
│   ├── App.jsx             # Root application component
│   └── main.jsx            # Application entry point and provider injection
├── .env.dist               # Environment variable template
├── Dockerfile              # Production containerization specification
├── package.json            # Dependency manifest and scripts
└── vite.config.js          # Vite build and development configuration
```

## Getting Started

Follow these instructions to set up the Orrin frontend environment for local development.

### Prerequisites

Ensure your local development environment meets the following requirements:

- Node.js (version 20.x or higher)
- npm (version 8.x or higher)

### Installation

Clone the repository to your local machine:

```bash
git clone https://github.com/ivasx/orrin-frontend.git
cd orrin-frontend
```

Install the required dependencies:

```bash
npm install
```

### Environment Variables Setup

The application requires specific environment variables to function correctly.

Create a `.env` file in the root directory. You can use `.env.dist` as a template.

Configure the required variables:

```env
# Define the target API backend.
VITE_API_BASE_URL=http://127.0.0.1:8000

# Set to 'false' to communicate with a live backend. Set to 'true' to use local mock data.
VITE_USE_MOCK_DATA=false
```

### Running Locally

To start the development server with Vite:

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173`.

### Production Build

To compile the application for production deployment:

```bash
npm run build
```

To preview the compiled production build locally:

```bash
npm run preview
```

## Authors

- **Ivas** — [@ivasx](https://github.com/ivasx)

## Contact

If you have any questions or suggestions, please reach out:

- **Email:** ambroziak.v.ivan@gmail.com
- **GitHub Issues:** [orrin-frontend/issues](https://github.com/ivasx/orrin-frontend/issues)

## License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.