(function (window, document) {
  'use strict';

//   http://172.25.169.103
  var DEFAULT_ENDPOINT = '/wms-search/api/visit/log';
  var HEARTBEAT_INTERVAL = 5 * 60 * 1000;
  var DATA_BEIJING_URL = 'https://data.beijing.gov.cn/';
  var DATA_BEIJING_COLUMN_NAME = '北京市公共数据开放平台';
  var ONDATA_URL = 'https://ondata.dibj.cn:6689/';
  var ONDATA_COLUMN_NAME = 'OnData';
  var enterTime = Date.now();
  var pageVisitUuid = createUuid();
  var lastReportedDuration = 0;
  var heartbeatTimer = null;
  var hasLeftPage = false;
  var visitRequestQueue = Promise.resolve(true);
  var visitRequestInFlight = false;
  var lastQueuedSignature = '';
  var lastQueuedAt = 0;

  function createUuid() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (char) {
      var random = Math.random() * 16 | 0;
      var value = char === 'x' ? random : (random & 0x3 | 0x8);
      return value.toString(16);
    });
  }

  function getPathParts() {
    return window.location.pathname.split('/').filter(Boolean);
  }

  function getGlobalValue(name) {
    return typeof window[name] !== 'undefined' ? window[name] : '';
  }

  function getMetaContent(name) {
    var meta = document.querySelector('meta[name="' + name + '"]');
    return meta ? (meta.getAttribute('content') || '') : '';
  }

  function resolveSiteId(pathParts) {
    var currentSiteId = getGlobalValue('siteId');

    if (!currentSiteId && pathParts.length > 0) {
      if (pathParts[0] === 'cxds') {
        currentSiteId = 11;
      } else if (pathParts[0] === 'portal_in') {
        currentSiteId = 41;
      }
    }

    return currentSiteId;
  }

  function resolveColumnId(pathParts) {
    var currentColumnId = getGlobalValue('_yfx_nodeid') ||
      getGlobalValue('columnId') ||
      getGlobalValue('currentColumnId') ||
      getGlobalValue('__COLUMN_ID__') ||
      getMetaContent('columnId');
    var globalArticleId = getGlobalValue('_yfx_contentid');
    var columnData = typeof window.columnData !== 'undefined' ? window.columnData : null;
    var pathname = window.location.pathname;
    var isHtmlPage = pathname.slice(-5).toLowerCase() === '.html';

    if (!currentColumnId && globalArticleId) {
      if (pathParts.length >= 2) {
        var articleDirPath = '/' + pathParts.slice(0, pathParts.length - 1).join('/') + '/';
        if (columnData && columnData[articleDirPath]) {
          currentColumnId = columnData[articleDirPath];
        }
      }
    } else if (!currentColumnId && pathParts.length > 0 && !isHtmlPage) {
      var listDirPath = pathname.charAt(pathname.length - 1) === '/' ? pathname : pathname + '/';
      if (columnData && columnData[listDirPath]) {
        currentColumnId = columnData[listDirPath];
      }
    }

    return currentColumnId || '';
  }

  function resolveAccessType() {
    var globalArticleId = getGlobalValue('_yfx_contentid');
    var isHtmlPage = window.location.pathname.slice(-5).toLowerCase() === '.html';
    return (globalArticleId || isHtmlPage) ? 'ARTICLE' : 'COLUMN';
  }

  function resolveFromDataSite() {
    var referrer = document.referrer || '';
    return referrer.indexOf('https://data.beijing.gov.cn/') === 0;
  }

  function getDurationMilliseconds() {
    var duration = Date.now() - enterTime;
    return duration > 0 ? duration : 0;
  }

  function buildPayload() {
    var pathParts = getPathParts();
    var resolvedColumnId = resolveColumnId(pathParts);
    var articleId = getGlobalValue('_yfx_contentid');

    var payload = {
      siteId:'c8cbc1d238c049bb9dd997dd3f61069e',
      uuid: pageVisitUuid,
      columnId: resolvedColumnId || '86f6fbcc5e0541a19a06f8493ba11595',
      accessType: resolveAccessType(),
      visitDuration: String(getDurationMilliseconds()),
      visitPage: window.location.href,
      fromDataSite: resolveFromDataSite()
    };

    if (articleId) {
      payload.articleId = articleId;
    }

    return payload;
  }

  function buildOutLinkPayload(outUrl, columnName) {
    var payload = buildPayload();
    payload.columnId = outUrl || DATA_BEIJING_URL;
    payload.columnName = columnName || DATA_BEIJING_COLUMN_NAME;
    if ((outUrl || '').indexOf(ONDATA_URL) === 0) {
      payload.onUrl = ONDATA_URL;
      delete payload.outUrl;
    } else {
      payload.outUrl = outUrl || DATA_BEIJING_URL;
    }
    // 外链跳转记录不需要 articleId
    delete payload.articleId;
    return payload;
  }

  function sendByFetch(payload) {
    if (typeof window.fetch !== 'function') {
      return Promise.resolve(false);
    }

    return window.fetch(DEFAULT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      keepalive: true,
      credentials: 'include'
    }).then(function () {
      return true;
    }).catch(function () {
      return false;
    });
  }

  function getPayloadSignature(payload) {
    return [
      payload && payload.uuid ? payload.uuid : '',
      payload && payload.visitDuration ? payload.visitDuration : '',
      payload && payload.columnId ? payload.columnId : '',
      payload && payload.outUrl ? payload.outUrl : '',
      payload && payload.accessType ? payload.accessType : ''
    ].join('|');
  }

  function sendVisitWithRetry(payload, useBeaconFallback) {
    var maxAttempts = 2;
    var attempt = 1;
    visitRequestInFlight = true;

    function run() {
      return sendByFetch(payload).then(function (success) {
        if (success) {
          return true;
        }
        if (useBeaconFallback && sendByBeacon(payload)) {
          return true;
        }
        if (attempt < maxAttempts) {
          attempt += 1;
          return run();
        }
        return false;
      });
    }

    return run().then(function (success) {
      visitRequestInFlight = false;
      return success;
    }).catch(function () {
      visitRequestInFlight = false;
      return false;
    });
  }

  // 串行化 visit 接口调用：前一个未完成时后一个排队，避免偶发并发重复调用
  function enqueueVisitRequest(payload, useBeaconFallback) {
    var now = Date.now();
    var signature = getPayloadSignature(payload);
    if (signature && signature === lastQueuedSignature && (now - lastQueuedAt) < 800) {
      return Promise.resolve(true);
    }
    lastQueuedSignature = signature;
    lastQueuedAt = now;

    visitRequestQueue = visitRequestQueue.then(function () {
      return sendVisitWithRetry(payload, useBeaconFallback);
    }, function () {
      return sendVisitWithRetry(payload, useBeaconFallback);
    });

    return visitRequestQueue;
  }

  function sendByBeacon(payload) {
    if (!navigator.sendBeacon) {
      return false;
    }

    try {
      var blob = new Blob([JSON.stringify(payload)], { type: 'application/json; charset=UTF-8' });
      return navigator.sendBeacon(DEFAULT_ENDPOINT, blob);
    } catch (error) {
      return false;
    }
  }

  function reportVisit(force) {
    var payload = buildPayload();
    var duration = Number(payload.visitDuration || 0);

    if (!force && duration <= lastReportedDuration) {
      return;
    }

    if (force && duration === lastReportedDuration && lastReportedDuration !== 0) {
      return;
    }

    lastReportedDuration = duration;

    enqueueVisitRequest(payload, true);
  }

  function startHeartbeat() {
    heartbeatTimer = window.setInterval(function () {
      reportVisit(false);
    }, HEARTBEAT_INTERVAL);
  }

  function stopHeartbeat() {
    if (heartbeatTimer) {
      window.clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  }

  function handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      reportVisit(false);
    }
  }

  function handlePageLeave() {
    if (hasLeftPage) {
      return;
    }

    hasLeftPage = true;
    stopHeartbeat();
    reportVisit(true);
  }

  function init() {
    startHeartbeat();
    document.addEventListener('visibilitychange', handleVisibilityChange, false);
    window.addEventListener('pagehide', handlePageLeave, false);
    window.addEventListener('beforeunload', handlePageLeave, false);
    bindDataBeijingOutLink();
  }

  function reportOutLink(outUrl, columnName) {
    var payload = buildOutLinkPayload(outUrl, columnName);
    enqueueVisitRequest(payload, true);

    // 跳转 data.beijing 前，除 visit 外再调用一次 access 接口
    if ((outUrl || '').indexOf(DATA_BEIJING_URL) === 0) {
      sendAccessForOutLink(payload);
    }
  }

  function sendAccessForOutLink(payload) {
    var visitPayload = payload || buildPayload();
    var siteId = visitPayload.siteId || '';
    var columnId = visitPayload.columnId || '';
    // 与 visit 记录保持一致：使用当前 visitPage 作为 referer 值
    var referer = visitPayload.visitPage || window.location.href || '';
    var query =
      '?siteId=' + encodeURIComponent(siteId) +
      '&columnId=' + encodeURIComponent(columnId) +
      '&terminalDeviceId=' + encodeURIComponent('null') +
      '&referer=' + encodeURIComponent(referer);
    var url = '/api/access' + query;

    if (typeof window.fetch === 'function') {
      window.fetch(url, {
        method: 'GET',
        credentials: 'include',
        keepalive: true
      }).catch(function () {
      });
      return;
    }

    var img = new Image(1, 1);
    img.src = url;
  }

  function bindDataBeijingOutLink() {
    document.addEventListener('click', function (event) {
      var target = event.target;
      if (!target || typeof target.closest !== 'function') {
        return;
      }

      var link = target.closest('a[href]');
      if (!link) {
        return;
      }

      var href = link.getAttribute('href') || '';
      if (!href) {
        return;
      }

      // 兼容相对路径/协议相对路径，统一解析后判断
      var absoluteHref = '';
      try {
        absoluteHref = new URL(href, window.location.href).href;
      } catch (e) {
        return;
      }

      if (absoluteHref.indexOf(DATA_BEIJING_URL) === 0) {
        reportOutLink(DATA_BEIJING_URL, DATA_BEIJING_COLUMN_NAME);
      } else if (absoluteHref.indexOf(ONDATA_URL) === 0) {
        reportOutLink(ONDATA_URL, ONDATA_COLUMN_NAME);
      }
    }, true);
  }

  init();

  window.visitLogTracker = {
    reportNow: function () {
      reportVisit(true);
    },
    reportOutLink: function (outUrl, columnName) {
      reportOutLink(outUrl, columnName);
    },
    getPayload: buildPayload,
    getUuid: function () {
      return pageVisitUuid;
    },
    isVisitRequestInFlight: function () {
      return visitRequestInFlight;
    }
  };
})(window, document);
