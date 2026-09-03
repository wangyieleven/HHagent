/* Runtime API configuration and Demo network isolation for HHagent. */
(function (window, document) {
  'use strict';

  var defaults = {
    mode: 'demo',
    enableLiveApi: false,
    enableAuth: false,
    enableVisitLog: false,
    apiBase: '',
    currentUserEndpoint: '/portal/oauth/currentUser',
    visitLogEndpoint: ''
  };
  var supplied = window.__HH_RUNTIME_CONFIG__ || {};
  var config = Object.assign({}, defaults, supplied);

  if (!['demo', 'sandbox', 'production'].includes(config.mode)) config.mode = 'demo';
  config.apiBase = typeof config.apiBase === 'string' ? config.apiBase.replace(/\/+$/, '') : '';
  config.enableLiveApi = config.mode !== 'demo' && config.enableLiveApi === true && !!config.apiBase;
  config.enableAuth = config.mode !== 'demo' && config.enableAuth === true;
  config.enableVisitLog = config.mode !== 'demo' && config.enableVisitLog === true;

  var currentScript = document.currentScript;
  var mockUrl = currentScript
    ? new URL('../mock/legacy-api-disabled.json', currentScript.src).href
    : new URL('/mock/legacy-api-disabled.json', window.location.origin).href;

  function endpoint(path) {
    return config.enableLiveApi ? config.apiBase + path : mockUrl;
  }

  function isLegacyBusinessUrl(value) {
    if (config.mode !== 'demo' || !value) return false;
    try {
      var url = new URL(String(value), window.location.href);
      if (url.origin !== window.location.origin) return true;
      return /^(?:\/portal\/(?:api|oauth)\/|\/ChuangXinApi\/|\/wms-search\/|\/api\/)/.test(url.pathname);
    } catch (error) {
      return false;
    }
  }

  function demoEnvelope(value) {
    var path = '';
    try { path = new URL(String(value || ''), window.location.href).pathname; } catch (error) {}
    var empty = [];
    empty.records = [];
    empty.rows = [];
    empty.list = [];
    empty.content = [];
    empty.total = 0;
    empty.current = 1;
    empty.pages = 0;
    empty.size = 0;
    return {
      code: 0,
      isSuccess: true,
      success: true,
      msg: 'HHagent demo mode: live API disabled',
      message: 'HHagent demo mode: live API disabled',
      data: /\/page\/?$/.test(path) ? empty : null,
      rows: [],
      total: 0
    };
  }

  function installJQueryGuard() {
    var jq = window.jQuery || window.$;
    if (!jq || typeof jq.ajax !== 'function' || jq.__hhDemoAjaxGuard) return false;
    var nativeAjax = jq.ajax;
    jq.ajax = function (url, options) {
      var settings = typeof url === 'string'
        ? Object.assign({}, options || {}, { url: url })
        : Object.assign({}, url || {});
      if (!isLegacyBusinessUrl(settings.url)) return nativeAjax.apply(this, arguments);

      var deferred = jq.Deferred();
      var response = demoEnvelope(settings.url);
      var context = settings.context || settings;
      var promise = deferred.promise();
      promise.readyState = 4;
      promise.status = 200;
      promise.statusText = 'success';
      promise.responseJSON = response;
      promise.abort = function () { return promise; };

      window.setTimeout(function () {
        if (typeof settings.success === 'function') settings.success.call(context, response, 'success', promise);
        deferred.resolveWith(context, [response, 'success', promise]);
        if (typeof settings.complete === 'function') settings.complete.call(context, promise, 'success');
      }, 0);
      return promise;
    };
    Object.defineProperty(jq, '__hhDemoAjaxGuard', { value: true, configurable: false });
    return true;
  }

  function installFetchGuard() {
    if (typeof window.fetch !== 'function' || window.fetch.__hhDemoFetchGuard) return;
    var nativeFetch = window.fetch.bind(window);
    var guardedFetch = function (input, init) {
      var value = typeof input === 'string' || input instanceof URL ? String(input) : input && input.url;
      if (!isLegacyBusinessUrl(value)) return nativeFetch(input, init);
      var body = JSON.stringify(demoEnvelope(value));
      return Promise.resolve(new Response(body, {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=UTF-8', 'X-HH-Demo-Mock': '1' }
      }));
    };
    Object.defineProperty(guardedFetch, '__hhDemoFetchGuard', { value: true, configurable: false });
    window.fetch = guardedFetch;
  }

  function installDemoNetworkGuard() {
    if (config.mode !== 'demo') return;
    installFetchGuard();
    if (installJQueryGuard()) return;
    var attempts = 0;
    var timer = window.setInterval(function () {
      attempts += 1;
      if (installJQueryGuard() || attempts >= 100) window.clearInterval(timer);
    }, 25);
  }

  var ApiModules = Object.freeze({
    changj: config.enableLiveApi ? config.apiBase + '/ChuangXinApi/v1/changj' : mockUrl
  });

  var ApiUrls = Object.freeze({
    getChangjingReqMana: endpoint('/ChuangXinApi/v1/changj/getChangjingReqMana'),
    getPublishList: endpoint('/ChuangXinApi/v1/changj/getPublishList'),
    getChengGuoList: endpoint('/ChuangXinApi/v1/changj/getChengGuoList'),
    getPublishReqCnt: endpoint('/ChuangXinApi/v1/changj/getPublishReqCnt'),
    getPublishListByType: function (type) {
      if (!config.enableLiveApi) return mockUrl;
      return endpoint('/ChuangXinApi/v1/changj/getPublishList?changjingType=' + encodeURIComponent(type));
    }
  });

  window.__HH_RUNTIME_CONFIG__ = Object.freeze(config);
  window.HH_DEMO_MODE = config.mode === 'demo';
  window.BASE_HOST = config.enableLiveApi ? config.apiBase : '';
  window.ApiModules = ApiModules;
  window.ApiUrls = ApiUrls;
  window.HHDemoNetwork = Object.freeze({
    enabled: config.mode === 'demo',
    isLegacyBusinessUrl: isLegacyBusinessUrl,
    demoEnvelope: demoEnvelope
  });

  installDemoNetworkGuard();
})(window, document);
