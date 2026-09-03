/* Safe authentication shell for the static mirror. */
(function (window, document) {
  'use strict';

  var LEGACY_LOCAL_KEYS = ['isLoggedIn', 'tokenId', 'IdList', 'userId'];
  var LEGACY_SESSION_KEYS = ['userId', 'userName'];

  function clearLegacyAuthStorage() {
    LEGACY_LOCAL_KEYS.forEach(function (key) {
      try { localStorage.removeItem(key); } catch (error) {}
    });
    LEGACY_SESSION_KEYS.forEach(function (key) {
      try { sessionStorage.removeItem(key); } catch (error) {}
    });
  }

  function setLoggedOut(isDemo) {
    var loginLink = document.querySelector('.login');
    var userTitle = document.querySelector('#userTtile');
    if (loginLink) {
      loginLink.textContent = isDemo ? '登录（演示）' : '登 录';
      loginLink.setAttribute('data-auth-state', 'anonymous');
    }
    if (userTitle) userTitle.textContent = '';
    document.documentElement.setAttribute('data-authenticated', 'false');
  }

  function setLoggedIn(user) {
    var loginLink = document.querySelector('.login');
    var userTitle = document.querySelector('#userTtile');
    var realName = user && typeof user.realName === 'string' ? user.realName.trim() : '';
    if (loginLink) {
      loginLink.textContent = '个人中心';
      loginLink.setAttribute('data-auth-state', 'authenticated');
    }
    if (userTitle) userTitle.textContent = realName ? '欢迎您，' + realName : '欢迎您';
    document.documentElement.setAttribute('data-authenticated', 'true');
  }

  document.addEventListener('DOMContentLoaded', function () {
    clearLegacyAuthStorage();

    var config = window.__HH_RUNTIME_CONFIG__ || {};
    if (config.mode === 'demo' || config.enableAuth !== true) {
      setLoggedOut(true);
      return;
    }

    var endpoint = config.currentUserEndpoint || '/portal/oauth/currentUser';
    var controller = typeof AbortController === 'function' ? new AbortController() : null;
    var timeout = controller ? window.setTimeout(function () { controller.abort(); }, 8000) : 0;

    fetch(endpoint, {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
      signal: controller ? controller.signal : undefined
    })
      .then(function (response) {
        if (!response.ok) throw new Error('获取登录状态失败：' + response.status);
        return response.json();
      })
      .then(function (payload) {
        if (payload && payload.code === 0 && payload.data) setLoggedIn(payload.data);
        else setLoggedOut(false);
      })
      .catch(function (error) {
        if (!error || error.name !== 'AbortError') console.warn('[HHagent] 获取登录状态失败。', error);
        setLoggedOut(false);
      })
      .finally(function () {
        if (timeout) window.clearTimeout(timeout);
      });
  });
})(window, document);
