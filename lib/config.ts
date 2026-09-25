/**
 * Centralized API Configuration for NETHRA
 * Stores the backend base URL in a single configuration variable so it can
 * easily be configured or swapped between deployed services (Render) and local environments.
 */

export const DEFAULT_BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'https://nethra-api-aemt.onrender.com';

export const API_ENDPOINTS = {
  STATUS: '/api/status',
  NAVIGATION: '/api/navigation',
  TELEMETRY: '/api/telemetry',
  MISSION_START: '/api/mission/start',
  MISSION_STOP: '/api/mission/stop',
  MISSION_EMERGENCY_STOP: '/api/mission/emergency-stop',
  MISSION_RESUME: '/api/mission/resume',
} as const;

export const POLLING_INTERVAL_MS = 3000;
export const ACTIVE_POLLING_INTERVAL_MS = 1000;
export const REQUEST_TIMEOUT_MS = 8000;
export const FAILED_REQUESTS_THRESHOLD = 3;
