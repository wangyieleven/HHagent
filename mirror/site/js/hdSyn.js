(function () {
    function getCurrentScriptElement() {
        if (document.currentScript) {
            return document.currentScript;
        }
        var scripts = document.getElementsByTagName('script');
        for (var i = scripts.length - 1; i >= 0; i--) {
            var src = scripts[i] && scripts[i].getAttribute('src');
            if (src && src.indexOf('hdSyn.js') !== -1) {
                return scripts[i];
            }
        }
        return null;
    }

    function getUserFromScript() {
        function normalizeUserInfo(input) {
            var obj = input && typeof input === 'object' ? input : {};
            return {
                user_id: obj.user_id || '',
                user_account: obj.user_account || '',
                user_name: obj.user_name || '',
                user_properties: obj.user_properties && typeof obj.user_properties === 'object' ? obj.user_properties : {}
            };
        }

        function getStorageValue(key) {
            try {
                var sessionValue = window.sessionStorage ? window.sessionStorage.getItem(key) : '';
                if (sessionValue) return String(sessionValue).trim();
            } catch (e) {}
            try {
                var localValue = window.localStorage ? window.localStorage.getItem(key) : '';
                if (localValue) return String(localValue).trim();
            } catch (e2) {}
            return '';
        }

        var userId = getStorageValue('userId');
        var userName = getStorageValue('userName');
        var userAccount = getStorageValue('userAccount');
        return normalizeUserInfo({
            user_id: userId,
            user_account: userAccount,
            user_name: userName,
            user_properties: {}
        });
    }

    var scriptUserData = getUserFromScript();
    var currentUserSyncPromise = null;
    var currentUserSyncDone = false;

    function refreshUserData() {
        scriptUserData = getUserFromScript();
        return scriptUserData;
    }

    function setStorageValue(key, value) {
        var stringValue = value == null ? '' : String(value);
        try {
            if (window.sessionStorage) {
                if (stringValue) {
                    window.sessionStorage.setItem(key, stringValue);
                } else {
                    window.sessionStorage.removeItem(key);
                }
            }
        } catch (e) {}
        try {
            if (window.localStorage) {
                if (stringValue) {
                    window.localStorage.setItem(key, stringValue);
                } else {
                    window.localStorage.removeItem(key);
                }
            }
        } catch (e2) {}
    }

    function persistCurrentUser(userId, userName, userAccount) {
        setStorageValue('userId', userId);
        setStorageValue('userName', userName);
        setStorageValue('userAccount', userAccount);
        return refreshUserData();
    }

    function getCurrentUserUrl() {
        var scriptEl = getCurrentScriptElement();
        var scriptUrl = scriptEl ? String(scriptEl.getAttribute('data-current-user-url') || '').trim() : '';
        var globalUrl = typeof window.hdSynCurrentUserUrl === 'string' ? window.hdSynCurrentUserUrl.trim() : '';
        return scriptUrl || globalUrl || '/portal/oauth/currentUser';
    }

    function syncCurrentUser(force) {
        if (!force && currentUserSyncPromise) {
            return currentUserSyncPromise;
        }

        if (typeof window.fetch !== 'function') {
            currentUserSyncDone = true;
            return Promise.resolve(refreshUserData());
        }

        var currentUserUrl = getCurrentUserUrl();
        if (!currentUserUrl) {
            currentUserSyncDone = true;
            return Promise.resolve(refreshUserData());
        }

        currentUserSyncPromise = fetch(currentUserUrl, {
            method: 'GET',
            credentials: 'include',
            mode: 'cors',
            cache: 'no-store',
            headers: {
                'Accept': 'application/json, text/plain, */*'
            }
        }).then(function (response) {
            if (!response.ok) {
                throw new Error('currentUser request failed: ' + response.status);
            }
            return response.json();
        }).then(function (data) {
            currentUserSyncDone = true;
            if (data && data.code === 0 && data.data) {
                return persistCurrentUser(
                    data.data.userIdCode || '',
                    data.data.realName || '',
                    data.data.userName || ''
                );
            }
            return persistCurrentUser('', '', '');
        }).catch(function () {
            currentUserSyncDone = true;
            return refreshUserData();
        }).then(function (result) {
            currentUserSyncPromise = null;
            return result;
        });

        return currentUserSyncPromise;
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

    function resolveColumnName() {
        return getGlobalValue('_yfx_nodeName') ||
            getGlobalValue('columnName') ||
            getGlobalValue('currentColumnName') ||
            getGlobalValue('__COLUMN_NAME__') ||
            getMetaContent('columnName') ||
            '';
    }

    function resolveArticleName() {
        return getGlobalValue('_yfx_title') ||
            getGlobalValue('articleName') ||
            getGlobalValue('currentArticleName') ||
            getGlobalValue('__ARTICLE_NAME__') ||
            getMetaContent('articleName') ||
            '';
    }

    function resolveFromDataSite() {
        var referrer = document.referrer || '';
        return referrer.indexOf('https://data.beijing.gov.cn/') === 0;
    }

    function resolveVisitFields() {
        var pathParts = getPathParts();
        return {
            siteId: 'c8cbc1d238c049bb9dd997dd3f61069e',
            columnId: resolveColumnId(pathParts) || '86f6fbcc5e0541a19a06f8493ba11595',
            articleId: getGlobalValue('_yfx_contentid') || '',
            accessType: resolveAccessType()
        };
    }

    /**
     * 标识一个pageView-pageLeave
     */
    function createPageViewId() {
        var d = new Date().getTime();
        return 'pv-' + 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    /**
     * 生成事件唯一ID（用于去重）
     */
    function createEventId() {
        var d = new Date().getTime();
        return 'evt_' + 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    function debugLog(message, data) {
        if (!window || !window.console || typeof window.console.log !== 'function') return;
        if (data !== undefined) {
            window.console.log('[埋点 hdSyn] ' + message, data);
            return;
        }
        window.console.log('[埋点 hdSyn] ' + message);
    }

    function getDurationNow() {
        if (window && window.performance && typeof window.performance.now === 'function') {
            return window.performance.now();
        }
        return new Date().getTime();
    }

    function getStayDuration() {
        var duration = stayDurationAccumulated;
        if (stayDurationVisibleStart) {
            duration += getDurationNow() - stayDurationVisibleStart;
        }
        if (!isFinite(duration) || duration < 0) {
            duration = 0;
        } else {
            duration = Math.round(duration);
        }
        // 心跳兜底：如果实时计算值为0，使用心跳快照值
        if (duration === 0 && lastHeartbeatDuration > 0) {
            debugLog('访问时长计算为0，使用心跳快照值', { 心跳快照: lastHeartbeatDuration });
            return lastHeartbeatDuration;
        }
        return duration;
    }

    /**
     * 获取访问终端类型
     */
    function getTerminalType() {
        var ua = (navigator && navigator.userAgent ? navigator.userAgent : '').toLowerCase();
        if (/ipad|tablet|playbook|silk/.test(ua) || (/android/.test(ua) && !/mobile/.test(ua))) {
            return 'mobile';
        }
        if (/mobile|iphone|ipod|android|blackberry|iemobile|opera mini|windows phone/.test(ua)) {
            return 'mobile';
        }
        return 'PC';
    }

    /**
     * 获取操作系统类型
     */
    function getOsType() {
        var ua = navigator && navigator.userAgent ? navigator.userAgent : '';
        if (/Windows NT/i.test(ua)) return 'Windows';
        if (/Android/i.test(ua)) return 'Android';
        if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
        if (/Mac OS X/i.test(ua)) return 'macOS';
        if (/Linux/i.test(ua)) return 'Linux';
        return getTerminalType();
    }

    // 获取或生成设备ID (持久化)
    function getDeviceId() {
        var key = 'hd_device_id';
        var uuid = '';
        try {
            uuid = localStorage.getItem(key);
            if (!uuid) {
                // 生成简单的 UUID
                var d = new Date().getTime();
                uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    var r = (d + Math.random()*16)%16 | 0;
                    d = Math.floor(d/16);
                    return (c=='x' ? r : (r&0x3|0x8)).toString(16);
                });
                localStorage.setItem(key, uuid);
            }
        } catch(e) { }
        return uuid;
    }

    /**
     * 访问时长记录
     */
    var pageEnterTime = new Date().getTime();
    var pageEnterDurationStart = getDurationNow();
    var stayDurationAccumulated = 0;
    var stayDurationVisibleStart = (document && document.visibilityState === 'hidden') ? 0 : getDurationNow();
    var lastHeartbeatDuration = 0;

    function pauseStayDuration() {
        if (!stayDurationVisibleStart) {
            return;
        }
        var now = getDurationNow();
        var delta = now - stayDurationVisibleStart;
        if (isFinite(delta) && delta > 0) {
            stayDurationAccumulated += delta;
        }
        stayDurationVisibleStart = 0;
    }

    function resumeStayDuration() {
        if (stayDurationVisibleStart) {
            return;
        }
        stayDurationVisibleStart = getDurationNow();
    }

    function resetStayDuration() {
        pageEnterTime = new Date().getTime();
        pageEnterDurationStart = getDurationNow();
        stayDurationAccumulated = 0;
        stayDurationVisibleStart = (document && document.visibilityState === 'hidden') ? 0 : getDurationNow();
        lastHeartbeatDuration = 0;
    }

    /**
     * 访问标识，用来标识一次pageView和pageLeave
     */
    var pageViewIdValue = createPageViewId();
    var leaveLogSent = false;

    // 记录最近一次鼠标点击坐标
    var lastClickX = 0;
    var lastClickY = 0;
    if (document) {
        document.addEventListener('mousedown', function(e) {
            lastClickX = e.clientX;
            lastClickY = e.clientY;
        });
    }

    // 心跳机制：每5秒快照一次当前访问时长，防止 pageleave 时偶发获取不到
    setInterval(function() {
        var d = stayDurationAccumulated;
        if (stayDurationVisibleStart) {
            d += getDurationNow() - stayDurationVisibleStart;
        }
        if (isFinite(d) && d > 0) {
            lastHeartbeatDuration = Math.round(d);
        }
    }, 5000);

    // 核心发送逻辑
    function sendLog(customParams) {
        function toSafeHeaderValue(value) {
            var s = value == null ? '' : String(value);
            s = s.replace(/[\r\n]+/g, ' ');
            if (/[^\x00-\xFF]/.test(s)) {
                return encodeURIComponent(s);
            }
            return s;
        }

        function normalizeEventName(value) {
            var text = value == null ? '' : String(value).trim();
            if (!text) return '';
            var lowerText = text.toLowerCase();
            if (lowerText === 'pageleave') return 'pageLeave';
            if (lowerText === 'pageview') return 'pageView';
            return text;
        }

        // 基础日志参数对象
        const h = {
            'X-Log-User-Id':   '',              // 空，不再传值 
            'X-Log-Url':       location.href, 
            'X-Log-Local-Time': new Date().toISOString(),
            'X-Log-Button-Id': '' 
        };

        // 核心逻辑：合并customParams到h对象，再赋值给params
        // 使用Object.assign实现合并（customParams优先级更高，会覆盖h中同名属性）
        var params = Object.assign({}, h, customParams || {});
        
        //referrer数据
        var referrer = document.referrer;
        if(referrer === '') {
            try {
                referrer = window.top.document.referrer;
            } catch(e) {
                if(window.parent) {
                    try {
                        referrer = window.parent.document.referrer;
                    } catch(e2) {
                        referrer = '';
                    }
                }
            }
        }

        //Document对象数据
        if(document) {
            params['X-Log-Domain'] = params.domain || document.domain || ''; 
            params['X-Log-Url'] = params.url || document.URL || ''; 
            params['X-Log-Title'] = params.title || getGlobalValue('_yfx_title') || document.title || ''; 
            params['X-Log-Referrer'] = params.referrer || referrer; 
        }   
        //Window对象数据
        if(window && window.screen) {
            params['X-Log-Height'] = params.sh || window.screen.height || 0;
            params['X-Log-Width'] = params.sw || window.screen.width || 0;
            params['X-Log-Color-Depth'] = params.cd || window.screen.colorDepth || 0;
        }   
        //navigator对象数据
        if(navigator) {
            params['X-Log-Language'] = params.lang || navigator.language || ''; 
            params['X-Log-User-Agent'] = params.ua || navigator.userAgent || '';
        }

        // 自定义上下文字段整合到 my-obj，统一以 URL 参数方式发送
        var visitFields = resolveVisitFields();
        var fromDataSite = resolveFromDataSite();
        params['my-obj'] = JSON.stringify({
            siteId: visitFields.siteId,
            columnId: visitFields.columnId,
            columnName: resolveColumnName(),
            articleId: visitFields.articleId,
            articleName: resolveArticleName(),
            accessType: visitFields.accessType,
            outUrl: fromDataSite ? 'https://data.beijing.gov.cn/' : '',
            referer: fromDataSite
        });
        params['System-Id'] = 'portal_system';
        params['Page-View-Id'] = params['Page-View-Id'] || pageViewIdValue;
        params['Terminal-Type'] = params['Terminal-Type'] || getTerminalType();
        params['Os-Type'] = params['Os-Type'] || getOsType();

        // 构建 event 字段
        var eventObj = {
            event_id: createEventId(),
            event_name: normalizeEventName(params['event_name'] || params['X-Log-Event']) || 'pageView',
            event_time: new Date().getTime(),
            event_properties: params['event_properties'] || {}
        };
        params['event'] = JSON.stringify(eventObj);

        // 构建 user 字段
        var latestUserData = refreshUserData();
        var userObj = {
            user_id: params['user_id'] || latestUserData.user_id || '',
            user_account: params['user_account'] || latestUserData.user_account || '',
            user_name: params['user_name'] || latestUserData.user_name || '',
            user_properties: params['user_properties'] && typeof params['user_properties'] === 'object' ? params['user_properties'] : (latestUserData.user_properties || {})
        };
        params['user'] = JSON.stringify(userObj);

        // 构建 item 字段
        var itemObj = {
            item_id: params['item_id'] || '',
            item_type: params['item_type'] || '',
            item_properties: params['item_properties'] || {}
        };
        params['item'] = JSON.stringify(itemObj);

        if (params['Stay-Duration'] !== undefined || eventObj.event_name === 'pageLeave' || params['X-Log-Event'] === 'pageleave') {
            params['Stay-Duration'] = params['Stay-Duration'] !== undefined ? params['Stay-Duration'] : getStayDuration();
        }

        // 添加鼠标坐标 (优先使用传入的，否则使用最近一次点击的)
        if (params['X-Log-Click-X'] === undefined) params['X-Log-Click-X'] = lastClickX;
        if (params['X-Log-Click-Y'] === undefined) params['X-Log-Click-Y'] = lastClickY;
        
        // 添加设备ID
        params['X-Log-Device-Id'] = getDeviceId();

        var logUrl = '../log.gif';
        var requestHeaders = {};
        for (var k in params) {
            if (Object.prototype.hasOwnProperty.call(params, k)) {
                requestHeaders[k] = toSafeHeaderValue(params[k]);
            }
        }

        requestHeaders['System-Id'] = toSafeHeaderValue(params['System-Id']);
        requestHeaders['Page-View-Id'] = toSafeHeaderValue(params['Page-View-Id']);
        requestHeaders['Terminal-Type'] = toSafeHeaderValue(params['Terminal-Type']);
        requestHeaders['Os-Type'] = toSafeHeaderValue(params['Os-Type']);
        requestHeaders['X-Log-Event-Data'] = toSafeHeaderValue(params['event']);
        requestHeaders['X-Log-User-Data'] = toSafeHeaderValue(params['user']);
        requestHeaders['X-Log-Item-Data'] = toSafeHeaderValue(params['item']);
        if (params['Stay-Duration'] !== undefined) {
            requestHeaders['Stay-Duration'] = toSafeHeaderValue(params['Stay-Duration']);
        }

        // 优先使用 fetch 发送请求头
        if (typeof window.fetch === 'function') {
            fetch(logUrl, {
                method: 'GET',
                headers: requestHeaders,
                mode: 'cors',
                credentials: 'omit',
                cache: 'no-store',
                keepalive: true
            }).catch(function () {
                if (typeof XMLHttpRequest === 'function') {
                    try {
                        var xhr = new XMLHttpRequest();
                        xhr.open('GET', logUrl, true);
                        for (var headerName in requestHeaders) {
                            if (Object.prototype.hasOwnProperty.call(requestHeaders, headerName)) {
                                xhr.setRequestHeader(headerName, requestHeaders[headerName]);
                            }
                        }
                        xhr.send(null);
                    } catch (e) { }
                }
            });
            return;
        }

        // 低版本浏览器使用 XHR 兜底，保持请求头传参
        if (typeof XMLHttpRequest === 'function') {
            try {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', logUrl, true);
                for (var headerKey in requestHeaders) {
                    if (Object.prototype.hasOwnProperty.call(requestHeaders, headerKey)) {
                        xhr.setRequestHeader(headerKey, requestHeaders[headerKey]);
                    }
                }
                xhr.send(null);
            } catch (e) { }
        }
		
    }

    /**
     * 可靠发送日志 - 页面离开/关闭时的多重保障发送机制
     * 双策略全部执行（不互斥），确保 pageleave 数据必达：
     *   策略1: fetch keepalive + GET Headers（与sendLog一致的数据格式）
     *   策略2: 同步XHR + GET Headers（阻塞至请求完成，最可靠）
     */
    function sendBeaconLog(customParams) {
        function toSafeHeaderValue(value) {
            var s = value == null ? '' : String(value);
            s = s.replace(/[\r\n]+/g, ' ');
            if (/[^\x00-\xFF]/.test(s)) return encodeURIComponent(s);
            return s;
        }
        function normalizeEventName(value) {
            var text = value == null ? '' : String(value).trim();
            if (!text) return '';
            var lowerText = text.toLowerCase();
            if (lowerText === 'pageleave') return 'pageLeave';
            if (lowerText === 'pageview') return 'pageView';
            return text;
        }

        // ===== 1. 构建完整参数（与 sendLog 保持一致） =====
        var h = {
            'X-Log-User-Id': '', 'X-Log-Url': location.href,
            'X-Log-Local-Time': new Date().toISOString(),
            'X-Log-Button-Id': ''
        };
        var params = Object.assign({}, h, customParams || {});
        var referrer = document.referrer;
        if (referrer === '') {
            try { referrer = window.top.document.referrer; } catch (e) {
                if (window.parent) { try { referrer = window.parent.document.referrer; } catch (e2) { referrer = ''; } }
            }
        }
        if (document) {
            params['X-Log-Domain'] = params.domain || document.domain || '';
            params['X-Log-Url'] = params.url || document.URL || '';
            params['X-Log-Title'] = params.title || getGlobalValue('_yfx_title') || document.title || '';
            params['X-Log-Referrer'] = params.referrer || referrer;
        }
        if (window && window.screen) {
            params['X-Log-Height'] = params.sh || window.screen.height || 0;
            params['X-Log-Width'] = params.sw || window.screen.width || 0;
            params['X-Log-Color-Depth'] = params.cd || window.screen.colorDepth || 0;
        }
        if (navigator) {
            params['X-Log-Language'] = params.lang || navigator.language || '';
            params['X-Log-User-Agent'] = params.ua || navigator.userAgent || '';
        }
        var visitFields = resolveVisitFields();
        var fromDataSite = resolveFromDataSite();
        params['my-obj'] = JSON.stringify({
            siteId: visitFields.siteId, columnId: visitFields.columnId,
            columnName: resolveColumnName(), articleId: visitFields.articleId,
            articleName: resolveArticleName(), accessType: visitFields.accessType,
            outUrl: fromDataSite ? 'https://data.beijing.gov.cn/' : '', referer: fromDataSite
        });
        params['System-Id'] = 'portal_system';
        params['Page-View-Id'] = params['Page-View-Id'] || pageViewIdValue;
        params['Terminal-Type'] = params['Terminal-Type'] || getTerminalType();
        params['Os-Type'] = params['Os-Type'] || getOsType();
        var eventObj = {
            event_id: createEventId(),
            event_name: normalizeEventName(params['event_name'] || params['X-Log-Event']) || 'pageView',
            event_time: new Date().getTime(),
            event_properties: params['event_properties'] || {}
        };
        params['event'] = JSON.stringify(eventObj);
        var latestUserData = refreshUserData();
        var userObj = {
            user_id: params['user_id'] || latestUserData.user_id || '',
            user_account: params['user_account'] || latestUserData.user_account || '',
            user_name: params['user_name'] || latestUserData.user_name || '',
            user_properties: params['user_properties'] && typeof params['user_properties'] === 'object' ? params['user_properties'] : (latestUserData.user_properties || {})
        };
        params['user'] = JSON.stringify(userObj);
        var itemObj = {
            item_id: params['item_id'] || '', item_type: params['item_type'] || '',
            item_properties: params['item_properties'] || {}
        };
        params['item'] = JSON.stringify(itemObj);
        if (params['Stay-Duration'] !== undefined || eventObj.event_name === 'pageLeave' || params['X-Log-Event'] === 'pageleave') {
            params['Stay-Duration'] = params['Stay-Duration'] !== undefined ? params['Stay-Duration'] : getStayDuration();
        }
        if (params['X-Log-Click-X'] === undefined) params['X-Log-Click-X'] = lastClickX;
        if (params['X-Log-Click-Y'] === undefined) params['X-Log-Click-Y'] = lastClickY;
        params['X-Log-Device-Id'] = getDeviceId();

        // ===== 2. 构建查询字符串和请求头 =====
        var queryStringParts = [];
        var requestHeaders = {};
        for (var k in params) {
            if (Object.prototype.hasOwnProperty.call(params, k)) {
                requestHeaders[k] = toSafeHeaderValue(params[k]);
                queryStringParts.push(encodeURIComponent(k) + '=' + encodeURIComponent(toSafeHeaderValue(params[k])));
            }
        }
        requestHeaders['System-Id'] = toSafeHeaderValue(params['System-Id']);
        requestHeaders['Page-View-Id'] = toSafeHeaderValue(params['Page-View-Id']);
        requestHeaders['Terminal-Type'] = toSafeHeaderValue(params['Terminal-Type']);
        requestHeaders['Os-Type'] = toSafeHeaderValue(params['Os-Type']);
        requestHeaders['X-Log-Event-Data'] = toSafeHeaderValue(params['event']);
        requestHeaders['X-Log-User-Data'] = toSafeHeaderValue(params['user']);
        requestHeaders['X-Log-Item-Data'] = toSafeHeaderValue(params['item']);
        if (params['Stay-Duration'] !== undefined) {
            requestHeaders['Stay-Duration'] = toSafeHeaderValue(params['Stay-Duration']);
        }

        var logUrl = '../log.gif';
        var queryString = queryStringParts.join('&');

        // ===== 策略1: fetch keepalive + GET Headers（与sendLog一致的数据格式） =====
        if (typeof window.fetch === 'function') {
            try {
                fetch(logUrl, {
                    method: 'GET',
                    headers: requestHeaders,
                    mode: 'cors',
                    credentials: 'omit',
                    cache: 'no-store',
                    keepalive: true
                }).catch(function() {});
                debugLog('策略1 fetch keepalive 已发起');
            } catch (e) { debugLog('策略1 异常', e); }
        }

        // ===== 策略2: 同步XHR + GET Headers（阻塞至请求完成，最可靠） =====
        if (typeof XMLHttpRequest === 'function') {
            try {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', logUrl, false);
                for (var hk in requestHeaders) {
                    if (Object.prototype.hasOwnProperty.call(requestHeaders, hk)) {
                        xhr.setRequestHeader(hk, requestHeaders[hk]);
                    }
                }
                xhr.send(null);
                debugLog('策略2 同步XHR 完成', { status: xhr.status });
            } catch (e) { debugLog('策略2 异常', e); }
        }
    }

    function sendLeaveLog(e) {
        if (leaveLogSent) return;
        pauseStayDuration();
        leaveLogSent = true;
        var stayDuration = getStayDuration();
        debugLog('页面离开，发送 pageleave 埋点', {
            事件类型: e && e.type ? e.type : 'manual',
            当前页面: location.href,
            页面访问标识: pageViewIdValue,
            停留时长毫秒: stayDuration
        });
        sendBeaconLog({
            'X-Log-Event': 'pageleave',
            'event_name': 'pageLeave',
            'Stay-Duration': stayDuration
        });
    }

    // 处理单页应用(SPA)或局部刷新的路由跳转
    function onRouteJump(e) {
        // 1. 先发送老页面的离开埋点
        sendLeaveLog(e);

        // 2. 延迟一点点等 URL 真正变化后，重置状态并发送新页面的进入埋点
        setTimeout(function() {
            resetStayDuration();
            pageViewIdValue = createPageViewId();
            leaveLogSent = false;
            
            if (window.commonHdSyn) {
                window.commonHdSyn.pageViewId = pageViewIdValue;
            }
            
            debugLog('检测到路由跳转，生成新 pageViewId 并发送 pageview', {
                url: location.href,
                pageViewId: pageViewIdValue
            });
            sendLog();
        }, 100);
    }

    if (window) {
        // 1. 传统多页应用离开事件
        window.addEventListener('pagehide', sendLeaveLog);
        window.addEventListener('beforeunload', sendLeaveLog);
        
        // 2. 页面可见性变化 - 切后台/切标签页/关闭页面时立即发送 pageleave
        document.addEventListener('visibilitychange', function(e) {
            if (document.visibilityState === 'hidden') {
                sendLeaveLog(e);
            } else if (document.visibilityState === 'visible') {
                // 从后台切回来，如果已发送过 leave 则视为一次新访问
                if (leaveLogSent) {
                    onRouteJump(e);
                } else {
                    resumeStayDuration();
                }
            }
        });

        // 3. 拦截 History API (Vue/React 等 History 路由，或原生无刷新跳转)
        var originalPushState = window.history.pushState;
        var originalReplaceState = window.history.replaceState;
        
        if (originalPushState) {
            window.history.pushState = function() {
                var res = originalPushState.apply(this, arguments);
                onRouteJump({ type: 'pushState' });
                return res;
            };
        }
        if (originalReplaceState) {
            window.history.replaceState = function() {
                var res = originalReplaceState.apply(this, arguments);
                onRouteJump({ type: 'replaceState' });
                return res;
            };
        }

        // 4. 监听 popstate 和 hashchange (浏览器前进后退、Hash 路由)
        window.addEventListener('popstate', onRouteJump);
        window.addEventListener('hashchange', onRouteJump);

        debugLog('页面离开及路由跳转事件监听已注册', {
            监听事件: ['pagehide', 'beforeunload', 'visibilitychange', 'pushState', 'replaceState', 'popstate', 'hashchange'],
            当前页面: location.href,
            页面访问标识: pageViewIdValue
        });
    }

    // 暴露全局发送方法
    window.xSend = sendLog;
    window.commonHdSyn = {
        send: sendLog,
        pageViewId: pageViewIdValue
    };

    // 默认执行一次
    syncCurrentUser().then(function () {
        sendLog();
    }).catch(function () {
        sendLog();
    });
})();

