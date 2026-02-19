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
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';

export const NETWORK_CONFIG = {
    API_URL,
    WS_URL,
};
