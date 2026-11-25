// Self-Hosted SQLite Backend Client (Drop-in replacement for Supabase)
const API_BASE = ((import.meta as any).env?.VITE_API_URL || '') + '/api';
const TOKEN_KEY = 'rdk_access_token';
const listeners = new Set<(event: string, session: any) => void>();

function getStoredToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

function setStoredToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

function notifyAuth(event: string, session: any) {
  listeners.forEach((cb) => {
    try { cb(event, session); } catch {}
  });
}

async function apiFetch(path: string, opts: RequestInit = {}) {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> || {})
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  return res.json();
}

class QueryBuilder {
  private table: string;
  private action: 'select' | 'insert' | 'update' | 'upsert' | 'delete' = 'select';
  private payload: any = null;
  private filters: Array<{ col: string; val: any }> = [];
  private orderBy: { col: string; ascending: boolean } | null = null;
  private isSingle = false;
  private isMaybeSingle = false;

  constructor(table: string) {
    this.table = table;
  }

  select(_cols = '*') {
    if (this.action === 'select') this.action = 'select';
    return this;
  }

  insert(data: any) {
    this.action = 'insert';
    this.payload = data;
    return this;
  }

  update(data: any) {
    this.action = 'update';
    this.payload = data;
    return this;
  }

  upsert(data: any) {
    this.action = 'upsert';
    this.payload = data;
    return this;
  }

  delete() {
    this.action = 'delete';
    return this;
  }

  eq(col: string, val: any) {
    this.filters.push({ col, val });
    return this;
  }

  order(col: string, opts?: { ascending?: boolean }) {
    this.orderBy = { col, ascending: opts?.ascending !== false };
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  then(resolve: (val: any) => void, reject?: (err: any) => void) {
    return apiFetch(`/rest/${encodeURIComponent(this.table)}`, {
      method: 'POST',
      body: JSON.stringify({
        action: this.action,
        payload: this.payload,
        filters: this.filters,
        orderBy: this.orderBy,
        single: this.isSingle,
        maybeSingle: this.isMaybeSingle
      })
    }).then(resolve, reject);
  }
}

export const supabase = {
  from(table: string) {
    return new QueryBuilder(table);
  },
  auth: {
    async signUp({ email, password, options }: { email: string; password: string; options?: any }) {
      const res = await apiFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, fullName: options?.data?.full_name })
      });
      if (res?.data?.session?.access_token) {
        setStoredToken(res.data.session.access_token);
        notifyAuth('SIGNED_IN', res.data.session);
      }
      return res;
    },
    async signInWithPassword({ email, password }: { email: string; password: string }) {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (res?.data?.session?.access_token) {
        setStoredToken(res.data.session.access_token);
        notifyAuth('SIGNED_IN', res.data.session);
      }
      return res;
    },
    async signInWithOAuth(opts: any) {
      if (opts?.provider !== 'google') {
        return { data: null, error: { message: 'Unsupported OAuth provider.' } };
      }
      return new Promise((resolve) => {
        const popup = window.open('/api/auth/google/login', 'rdk_google_oauth', 'width=500,height=640');
        if (!popup) {
          resolve({ data: null, error: { message: 'Popup blocked. Please allow popups and try again.' } });
          return;
        }
        const onMessage = (event: MessageEvent) => {
          if (event.data?.type === 'RDK_GOOGLE_AUTH' && event.data.session?.access_token) {
            window.removeEventListener('message', onMessage);
            clearInterval(timer);
            setStoredToken(event.data.session.access_token);
            notifyAuth('SIGNED_IN', event.data.session);
            resolve({ data: { session: event.data.session }, error: null });
          }
        };
        const timer = setInterval(() => {
          if (popup.closed) {
            clearInterval(timer);
            window.removeEventListener('message', onMessage);
            resolve({ data: null, error: { message: 'Google sign-in window closed.' } });
          }
        }, 500);
        window.addEventListener('message', onMessage);
      });
    },
    async signOut() {
      setStoredToken(null);
      notifyAuth('SIGNED_OUT', null);
      return { error: null };
    },
    async getSession() {
      const token = getStoredToken();
      if (!token) return { data: { session: null }, error: null };
      return apiFetch('/auth/session');
    },
    onAuthStateChange(callback: (event: string, session: any) => void) {
      listeners.add(callback);
      this.getSession().then((res: any) => {
        callback('INITIAL_SESSION', res?.data?.session || null);
      }).catch(() => {
        callback('INITIAL_SESSION', null);
      });
      return {
        data: {
          subscription: {
            unsubscribe: () => { listeners.delete(callback); }
          }
        }
      };
    }
  }
};
