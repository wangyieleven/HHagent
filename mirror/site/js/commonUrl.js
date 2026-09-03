/* Runtime API configuration for the static HHagent prototype. */
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
})(window, document);
