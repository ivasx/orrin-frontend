import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import sitemap from 'vite-plugin-sitemap';
import { ways } from './src/data';
const dynamicRoutes = ways.map(track => `/track/${track.trackId}`);

export default defineConfig({
    plugins: [
        react(),
        sitemap({
            hostname: 'https://orrin-yl1x.onrender.com',
            exclude: ['/login', '/register'],
            dynamicRoutes: dynamicRoutes,

        })
    ],
    server: {
        watch: {
            usePolling: true,
        },
        host: true,
        strictPort: true,
        port: 5173,
    }
})