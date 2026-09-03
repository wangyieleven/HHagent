/* Privacy-preserving visit logging. Disabled by default in demo mode. */
(function (window, document) {
  'use strict';

  var config = window.__HH_RUNTIME_CONFIG__ || {};
  var state = {
    enabled: false,
    startedAt: Date.now(),
    sessionId: '',
    heartbeatId: 0
  };

  function sameOriginEndpoint(value) {
    if (!value || typeof value !== 'string') return '';
    try {
      var url = new URL(value, window.location.origin);
      return url.origin === window.location.origin ? url.pathname + url.search : '';
    } catch (error) {
      return '';
    }
  }

  function createSessionId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
    return 'hh-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }

  function buildPayload(reason) {
    return {
      sessionId: state.sessionId,
      pagePath: window.location.pathname,
      pageTitle: document.title || '',
      durationSeconds: Math.max(0, Math.round((Date.now() - state.startedAt) / 1000)),
      reason: reason,
      recordedAt: new Date().toISOString()
    };
  }

  function send(reason) {
    if (!state.enabled) return false;
    var payload = JSON.stringify(buildPayload(reason));

    if (reason === 'pagehide' && navigator.sendBeacon) {
      try {
        return navigator.sendBeacon(state.endpoint, new Blob([payload], {
          type: 'application/json; charset=UTF-8'
        }));
      } catch (error) {
        return false;
      }
    }

    fetch(state.endpoint, {
      method: 'POST',
      credentials: 'same-origin',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: payload
    }).catch(function (error) {
      console.warn('[HHagent] 访问日志发送失败。', error);
    });
    return true;
  }

  function stop() {
    if (state.heartbeatId) window.clearInterval(state.heartbeatId);
    state.heartbeatId = 0;
    state.enabled = false;
  }

  window.HHVisitLog = {
    get enabled() { return state.enabled; },
    send: send,
    stop: stop
  };

  var endpoint = sameOriginEndpoint(config.visitLogEndpoint);
  if (config.mode === 'demo' || config.enableVisitLog !== true || !endpoint) return;

  state.enabled = true;
  state.endpoint = endpoint;
  state.sessionId = createSessionId();
  state.heartbeatId = window.setInterval(function () { send('heartbeat'); }, 5 * 60 * 1000);

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') send('hidden');
  });
  window.addEventListener('pagehide', function () {
    send('pagehide');
    stop();
  }, { once: true });
})(window, document);
