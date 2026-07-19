import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/appStore';
import type { AppState } from '../types';

const RECONNECT_DELAY_MS = 3000;

export function useRealtime() {
  const setState = useAppStore((s) => s.setState);
  const esRef = useRef<EventSource | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
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
        // Exponential backoff reconnect
        timerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
      };
    }

    connect();

    return () => {
      esRef.current?.close();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [setState]);
}
