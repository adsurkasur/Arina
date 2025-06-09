// Centralized SpectraGrow API base URL resolver for frontend
// Usage: import { getSpectraGrowApiBaseUrl } from './apiBaseUrl';

export function getSpectraGrowApiBaseUrl() {
  // If running locally (localhost or 127.0.0.1), always use local SpectraGrow backend
  const isLocalhost = (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '[::1]'
  );
  if (isLocalhost) {
    // Use SPECTRAGROW_PORT from env if available, otherwise default to 8000
    const port = import.meta.env.SPECTRAGROW_PORT || '8000';
    return `http://127.0.0.1:${port}`;
  }
  // Otherwise, use VITE_API_SPECTRAGROW_URL if set (cloud)
  if (import.meta.env.VITE_API_SPECTRAGROW_URL) {
    return import.meta.env.VITE_API_SPECTRAGROW_URL;
  }
  // Fallback: use current host/port
  return `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
}
