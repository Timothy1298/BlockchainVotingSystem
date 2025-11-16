/*
  useResultsSocket hook
  - Connects to a WebSocket endpoint to receive live results updates for a given electionId
  - Endpoint can be provided by VITE_WS_URL environment variable, otherwise defaults to ws(s)://<host>/ws/results
  - Calls onMessage callback with parsed JSON when messages arrive
*/
import { useEffect, useRef, useState } from 'react';

export default function useResultsSocket(electionId, onMessage) {
  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!electionId) return;

    // Prefer explicit env var for WebSocket. If not provided, try deriving from VITE_API_BASE_URL
    // Example: VITE_API_BASE_URL=http://localhost:5000/api -> ws://localhost:5000/ws/results
    let base = import.meta.env.VITE_WS_URL;
    if (!base) {
      const apiBase = import.meta.env.VITE_API_BASE_URL || `${window.location.protocol}//${window.location.host}`;
      // strip trailing /api if present
      const stripped = apiBase.replace(/\/api\/?$/i, '');
      base = stripped.replace(/^https?:/i, window.location.protocol === 'https:' ? 'wss:' : 'ws:');
    }
    // default path
    const url = base.endsWith('/') ? `${base}ws/results` : `${base}/ws/results`;
    const wsUrl = `${url}?electionId=${encodeURIComponent(electionId)}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      let opened = false;
      const openTimer = setTimeout(() => {
        if (!opened) {
          console.warn('Results WebSocket did not open in time, falling back to polling/refresh');
          // notify caller to fall back to a refresh
          onMessage && onMessage({ type: 'refresh', reason: 'ws_open_timeout' });
        }
      }, 3000);

      ws.onopen = () => {
        opened = true;
        clearTimeout(openTimer);
        setConnected(true);
        console.debug('Results WebSocket connected', wsUrl);
      };

      ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          onMessage && onMessage(data);
        } catch (e) {
          console.warn('Invalid WS message', e);
        }
      };

      ws.onclose = (ev) => {
        clearTimeout(openTimer);
        setConnected(false);
        console.debug('Results WebSocket closed', ev.code, ev.reason);
        // signal a refresh so UI can poll for latest results when WS disconnects
        onMessage && onMessage({ type: 'refresh', reason: 'ws_closed', code: ev.code });
      };

      ws.onerror = (err) => {
        clearTimeout(openTimer);
        setConnected(false);
        console.error('Results WebSocket error', err);
        onMessage && onMessage({ type: 'refresh', reason: 'ws_error', error: String(err) });
      };

      return () => {
        try { ws.close(); } catch (e) {}
        wsRef.current = null;
        setConnected(false);
      };
    } catch (err) {
      console.error('Failed to open Results WebSocket', err);
      setConnected(false);
    }
  }, [electionId, onMessage]);

  return { connected };
}
