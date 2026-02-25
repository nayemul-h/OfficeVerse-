/**
 * Central configuration for backend connectivity.
 * Uses Vite environment variables so the URL can be swapped
 * between local dev and the Render production server automatically.
 *
 * Create a .env.local file (not committed) for local dev:
 *   VITE_API_URL=http://localhost:8080
 *   VITE_WS_URL=ws://localhost:8080
 *
 * Set the same variables as environment variables in your Netlify site settings
 * (Site Settings → Environment Variables) for production.
 */
const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const rawWsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';

// Handle Mixed Content by upgrading protocols if running on HTTPS
const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

export const API_URL = isHttps ? rawApiUrl.replace('http://', 'https://') : rawApiUrl;
export const WS_URL = isHttps ? rawWsUrl.replace('ws://', 'wss://') : rawWsUrl;

export const NETWORK_CONFIG = {
    API_URL,
    WS_URL,
};
