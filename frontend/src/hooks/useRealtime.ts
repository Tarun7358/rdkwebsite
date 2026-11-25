import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/appStore';
import type { AppState } from '../types';

const RECONNECT_DELAY_MS = 3000;
const POLL_INTERVAL_MS = 8000;

export function useRealtime() {
  const setState = useAppStore((s) => s.setState);
  const esRef = useRef<EventSource | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchState() {
      try {
        const res = await fetch('/api/state');
        if (!res.ok) return;
        const msg = (await res.json()) as { type: string; state?: AppState };
        if (active && msg.type === 'UPDATE_STATE' && msg.state) {
          setState(msg.state);
        }
      } catch {
        // Ignore transient network errors
      }
    }

    function connect() {
      if (esRef.current) {
        esRef.current.close();
      }
      const es = new EventSource('/api/events');
      esRef.current = es;

      es.onmessage = (event: MessageEvent) => {
        try {
          const msg = JSON.parse(event.data as string) as {
            type: string;
            state?: AppState;
          };
          if (msg.type === 'UPDATE_STATE' && msg.state) {
            setState(msg.state);
          }
        } catch {
          // Ignore malformed messages
        }
      };

      es.onerror = () => {
        es.close();
        esRef.current = null;
        if (active) {
          timerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
        }
      };
    }

    fetchState();
    connect();
    const poll = setInterval(fetchState, POLL_INTERVAL_MS);

    return () => {
      active = false;
      clearInterval(poll);
      esRef.current?.close();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [setState]);
}
