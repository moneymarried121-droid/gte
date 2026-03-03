(function () {
  const TRACK_URL = window.__ADMIN_TRACK_URL || '/track';
  const USER_LEFT_URL = '/user-left';
  const HEARTBEAT_MS = 10000;
  const CLIENT_ID_KEY = 'adminLiveClientId';

  const getClientId = () => {
    const existing = window.localStorage.getItem(CLIENT_ID_KEY);
    if (existing) return existing;
    let nextId = '';
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      nextId = window.crypto.randomUUID();
    } else {
      nextId = `client_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    }
    window.localStorage.setItem(CLIENT_ID_KEY, nextId);
    return nextId;
  };

  const clientId = getClientId();

  const basePayload = () => ({
    ts: Date.now(),
    path: window.location.pathname || '/',
    title: document.title || '',
    referrer: document.referrer || '',
    clientId,
  });

  const sanitizeData = (data) => {
    if (!data || typeof data !== 'object') return undefined;
    const safe = {};
    Object.keys(data).forEach((key) => {
      const value = data[key];
      if (typeof value === 'number') {
        safe[key] = value;
      } else if (typeof value === 'string') {
        safe[key] = value.slice(0, 160);
      }
    });
    return safe;
  };

  const send = (payload) => {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(TRACK_URL, body);
      return;
    }

    fetch(TRACK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {
      // Ignore network errors for passive analytics.
    });
  };

  const track = (type, data) => {
    const payload = {
      ...basePayload(),
      type,
    };

    const safeData = sanitizeData(data);
    if (safeData) {
      payload.data = safeData;
    }

    send(payload);
  };

  const trackVisibility = () => {
    track('visibility', { visibility: document.visibilityState });
  };

  const trackPageView = () => {
    track('page_view', { source: 'load' });
  };

  const trackHeartbeat = () => {
    track('heartbeat', { visibility: document.visibilityState });
  };

  const trackUserLeft = () => {
    const payload = { clientId };
    const body = JSON.stringify(payload);
    
    // Use sendBeacon for reliable delivery when leaving page
    if (navigator.sendBeacon) {
      navigator.sendBeacon(USER_LEFT_URL, body);
    } else {
      // Fallback to synchronous XHR (not recommended but works)
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', USER_LEFT_URL, false); // synchronous
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(body);
      } catch (e) {
        // Ignore errors during page unload
      }
    }
  };

  window.SafeAdminAnalytics = { track };

  window.addEventListener('error', (event) => {
    track('js_error', {
      message: event.message || 'Script error',
      filename: event.filename || '',
      line: event.lineno || 0,
      col: event.colno || 0,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason ? String(event.reason) : 'Unhandled rejection';
    track('js_error', { message: reason.slice(0, 160), source: 'promise' });
  });

  document.addEventListener('visibilitychange', trackVisibility);

  // Track when user leaves the site
  window.addEventListener('beforeunload', trackUserLeft);
  window.addEventListener('pagehide', trackUserLeft);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', trackPageView, { once: true });
  } else {
    trackPageView();
  }

  setInterval(trackHeartbeat, HEARTBEAT_MS);
})();
