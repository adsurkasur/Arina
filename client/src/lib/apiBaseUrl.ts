// Centralized API base URL resolver for frontend
// Usage: import { getApiBaseUrl } from './apiBaseUrl';

export function getApiBaseUrl() {
  // If running locally (localhost or 127.0.0.1), always use local backend
  const isLocalhost = (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '[::1]'
  );
  if (isLocalhost) {
    // Use BACKEND_PORT from env if available, otherwise default to 8080
    const port = import.meta.env.BACKEND_PORT || '8080';
    return `http://localhost:${port}`;
  }
  // Otherwise, use VITE_API_URL if set (cloud)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Fallback: use current host/port
  return `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
}
