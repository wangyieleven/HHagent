;(function () {
  var TABLE_CODE = 'SOCIAL_DATA'
  var API_URL = '/portal/api/common/calling/page'
  var CACHE_KEY = 'social_industries_cache_v1'
  var CACHE_TTL_MS = 6 * 60 * 60 * 1000

  function now() {
    return Date.now ? Date.now() : new Date().getTime()
  }

  function toStr(v) {
    return v == null ? '' : String(v)
  }

  function safeJsonParse(text) {
    try {
      return JSON.parse(text)
    } catch (e) {
      return null
    }
  }

  function getCache() {
    try {
      var raw = sessionStorage.getItem(CACHE_KEY)
      if (!raw) return null
      var obj = safeJsonParse(raw)
      if (!obj || !obj.ts) return null
      if (now() - obj.ts > CACHE_TTL_MS) return null
      if (!obj.list || !obj.map) return null
      return obj
    } catch (e) {
      return null
    }
  }

  function setCache(payload) {
    try {
      sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          ts: now(),
          total: payload.total || 0,
          list: payload.list || [],
          map: payload.map || {}
        })
      )
    } catch (e) {}
  }

  function normalizeIndustry(record) {
    var value =
      (record && (record.goods_industry || record.industry)) ||
      (record && (record.goodsIndustry || record.goodsIndustryName)) ||
      ''
    value = toStr(value).trim()
    return value || '未知行业'
  }

  function requestPage(pageNum, pageSize) {
    return $.ajax({
      url: API_URL,
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        tableCode: TABLE_CODE,
        pageNum: pageNum,
        pageSize: pageSize,
        equalsParams: {},
        likeParams: {}
      })
    })
  }

  function extractPageData(response) {
    var data = (response && response.data) || {}
    var records = Array.isArray(data.records) ? data.records : []
    var total = Number(data.total) || 0
    var pages = Number(data.pages) || 0
    return { records: records, total: total, pages: pages }
  }

  var inFlight = null

  function collectIndustries(options) {
    var pageSize = (options && Number(options.pageSize)) || 200
    if (!isFinite(pageSize) || pageSize <= 0) pageSize = 200

    if (inFlight) return inFlight

    if (window._socialIndustryList && window._socialIndustryList.length) {
      return $.Deferred().resolve({
        total: window._socialTotalCount || 0,
        list: window._socialIndustryList,
        map: window._socialIndustryMap || {}
      })
    }

    var cached = getCache()
    if (cached && cached.list && cached.list.length) {
      window._socialIndustryMap = cached.map || {}
      window._socialIndustryList = cached.list || []
      window._socialTotalCount = cached.total || 0
      if (window.SocialData && typeof window.SocialData.onIndustryReady === 'function') {
        window.SocialData.onIndustryReady({
          total: window._socialTotalCount,
          list: window._socialIndustryList,
          map: window._socialIndustryMap
        })
      }
      return $.Deferred().resolve({
        total: window._socialTotalCount,
        list: window._socialIndustryList,
        map: window._socialIndustryMap
      })
    }

    var dfd = $.Deferred()
    inFlight = dfd.promise()

    requestPage(1, pageSize)
      .then(function (resp1) {
        var first = extractPageData(resp1)
        var total = first.total || 0
        var pages = first.pages || Math.ceil(total / pageSize) || 1

        var map = {}
        function addRecords(records) {
          for (var i = 0; i < records.length; i++) {
            var ind = normalizeIndustry(records[i])
            map[ind] = (map[ind] || 0) + 1
          }
        }

        addRecords(first.records)

        var page = 2
        function next() {
          if (page > pages) {
            var list = Object.keys(map).sort(function (a, b) {
              return (map[b] || 0) - (map[a] || 0)
            })
            window._socialIndustryMap = map
            window._socialIndustryList = list
            window._socialTotalCount = total
            setCache({ total: total, list: list, map: map })
            if (window.SocialData && typeof window.SocialData.onIndustryReady === 'function') {
              window.SocialData.onIndustryReady({ total: total, list: list, map: map })
            }
            dfd.resolve({ total: total, list: list, map: map })
            inFlight = null
            return
          }
          requestPage(page, pageSize)
            .then(function (resp) {
              var data = extractPageData(resp)
              addRecords(data.records)
              page += 1
              next()
            })
            .fail(function (err) {
              dfd.reject(err)
              inFlight = null
            })
        }

        next()
      })
      .fail(function (err) {
        dfd.reject(err)
        inFlight = null
      })

    return inFlight
  }

  function ensureCurrentIndustryProp() {
    try {
      var desc = Object.getOwnPropertyDescriptor(window, 'currentIndustry')
      if (desc && desc.configurable === false) return
      if (desc && (desc.get || desc.set)) return
      var internalValue = toStr(window.currentIndustry || '')
      Object.defineProperty(window, 'currentIndustry', {
        configurable: true,
        get: function () {
          return internalValue
        },
        set: function (v) {
          internalValue = toStr(v || '')
        }
      })
    } catch (e) {}
  }

  ensureCurrentIndustryProp()

  window.SocialData = window.SocialData || {}
  window.SocialData.collectIndustries = collectIndustries
  window.SocialData.getTotalCount = function () {
    return Number(window._socialTotalCount) || 0
  }
})()
