import type { ApiResponse, AppState } from '../types';

const API_BASE = '';

// ─────────────────────────────────────────────
// Base fetch helpers
// ─────────────────────────────────────────────

export async function apiAction<T = null>(
  action: string,
  data: Record<string, unknown> = {}
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_BASE}/api/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, data }),
    });
    if (!res.ok) {
      return {
        success: false,
        message: `API error (${res.status}): Server error. Please check backend log.`,
      };
    }
    return (await res.json()) as ApiResponse<T>;
  } catch (err: any) {
    console.warn('API connection error:', err);
    return {
      success: false,
      message: 'Failed to connect to RDK backend server (port 8000). Please make sure server is running.',
    };
  }
}

export async function apiGet<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// ─────────────────────────────────────────────
// State
// ─────────────────────────────────────────────

export async function fetchAppState(): Promise<AppState> {
  return apiGet<AppState>('/api/state');
}
