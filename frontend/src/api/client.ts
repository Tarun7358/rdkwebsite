import type { ApiResponse, AppState } from '../types';

const API_BASE = '';

// ─────────────────────────────────────────────
// Base fetch helpers
// ─────────────────────────────────────────────

export async function apiAction<T = null>(
  action: string,
  data: Record<string, unknown> = {}
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE}/api/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, data }),
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<ApiResponse<T>>;
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
