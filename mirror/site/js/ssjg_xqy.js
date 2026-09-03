;(function () {
  var STORAGE_KEYS = ['ssjg_detail_record', 'szzyxq_lastDetail']

  // ==================== 工具函数 ====================
  function escapeHtml(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  // 去除HTML标签和换行符
  function stripHtml(str) {
    if (!str) return ''
    return String(str)
      .replace(/<[^>]+>/g, '')
      .replace(/\\n/g, ' ')
      .replace(/\\r/g, ' ')
      .replace(/\\t/g, ' ')
      .replace(/[\r\n\t]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  // 行业编码转汉字（A-T编码 → 中文行业名称，中文原样返回）
  function convertIndustryCode(val) {
    if (!val) return val
    var industryMap = {
      A: '农、林、牧、渔业',
      B: '采矿业',
      C: '制造业',
      D: '电力、热力、燃气及水生产和供应业',
      E: '建筑业',
      F: '批发和零售业',
      G: '交通运输、仓储和邮政业',
      H: '住宿和餐饮业',
      I: '信息传输、软件和信息技术服务业',
      J: '金融业',
      K: '房地产业',
      L: '租赁和商务服务业',
      M: '科学研究和技术服务业',
      N: '水利、环境和公共设施管理业',
      O: '居民服务、修理和其他服务业',
      P: '教育',
      Q: '卫生和社会工作',
      R: '文化、体育和娱乐业',
      S: '公共管理、社会保障和社会组织',
      T: '国际组织'
    }
    var str = String(val).trim()
    // 如果包含中文，说明是历史数据，直接返回
    if (/[一-龥]/.test(str)) return str
    // 否则按编码转换（支持逗号分隔的多个编码）
    return str
      .split(',')
      .map(function (code) {
        code = code.trim()
        return industryMap[code] || code
      })
      .join('，')
  }

  addEventListener('click', function (e) {
    if (e.target.id === 'closeFetchModal') {
      e.preventDefault()
      hideFetchModal()
    }
  })
  function hideFetchModal() {
    var modal = document.getElementById('fetchModal')
    if (modal) modal.classList.remove('is-active')
  }

  function getVal(obj, snakeKey) {
    if (!obj || !snakeKey) return ''
    if (obj[snakeKey]) return obj[snakeKey]
    var camel = snakeKey.replace(/_([a-z])/g, function (m, c) {
      return c.toUpperCase()
    })
    return obj[camel] || ''
  }

  function getUrlParam(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
    var r = window.location.search.substr(1).match(reg)
    return r ? decodeURIComponent(r[2]) : ''
  }

  function infoItem(label, value) {
    return (
      '<div class="info-item"><span class="info-label">' +
      escapeHtml(label) +
      '：</span><span class="info-value">' +
      escapeHtml(value || '暂无数据') +
      '</span></div>'
    )
  }

  function truncate(str, len) {
    if (!str) return ''
    return str.length > len ? str.substring(0, len) : str
  }

  function normalizeFavorited(value) {
    if (value === true) return true
    if (value === false) return false
    var s = String(value == null ? '' : value)
      .trim()
      .toLowerCase()
    if (!s) return false
    return s === '1' || s === 'true' || s === 'yes' || s === 'y'
  }

  // ==================== 场景类型枚举 ====================
  var sceneTypeMap = {
    1: '数智技术类',
    2: '数据创新类',
    3: '数智应用类'
  }

  // ==================== 分类标签映射 ====================
  var categoryLabels = {
    app_innovation: '应用创新成果',
    DATA_INNOVATION: '数据创新成果',
    lab_data: '联合实验室数据',
    gov_data: '政府侧数据',
    scene_demand: '场景需求',
    settled_project: '入驻项目',
    component_resource: '组件',
    cloud_network_calc: '云网算',
    common_service: '共性服务',
    social_data: '社会侧数据'
  }

  // 分类 key → tableCode（对应 TableCodeEnum 枚举名）
  var categoryToTableCode = {
    app_innovation: 'APP_INNOVATION',
    cloud_network_calc: 'CLOUD_NETWORK_CALC',
    component_resource: 'COMPONENT_RESOURCE',
    common_service: 'COMMON_SERVICE',
    gov_data: 'GOV_DATA',
    lab_data: 'LAB_DATA',
    settled_project: 'SETTLED_PROJECT',
    scene_demand: 'SCENE_DEMAND',
    social_data: 'SOCIAL_DATA',
    release_tech_ability: 'RELEASE_TECH_ABILITY'
  }

  // tableCode → 分类 key（反向映射）
  function tableCodeToCatKey(tableCode) {
    if (!tableCode) return ''
    return String(tableCode).toLowerCase()
  }

  // source 参数 → 分类 key（shujuListNew.js 传 source=gov/lab/social）
  var sourceToCatKey = {
    gov: 'gov_data',
    lab: 'lab_data',
    social: 'social_data'
  }

  // 调用通用详情接口
  function fetchDetailFromApi(tableCode, id, callback) {
    var url =
      '/portal/api/common/calling/getById?tableCode=' +
      encodeURIComponent(tableCode) +
      '&id=' +
      encodeURIComponent(id)
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            var res = JSON.parse(xhr.responseText)
            callback(null, res)
          } catch (e) {
            callback('解析响应失败')
          }
        } else {
          callback('接口请求失败，状态码：' + xhr.status)
        }
      }
    }
    xhr.send()
  }

  var __favoriteUserPromise = null
  var __favoriteUserLoggedIn = false
  var __favoriteUserCheckedAt = 0
  var __favoriteInFlightMap = {}
  var __favoriteLastClickAtMap = {}
  var __favoriteDebounceMs = 800

  function fetchCurrentUser(force) {
    var now = Date.now()
    if (
      !force &&
      __favoriteUserPromise &&
      now - __favoriteUserCheckedAt < 10000
    )
      return __favoriteUserPromise
    __favoriteUserPromise = fetch('/portal/oauth/currentUser', {
      credentials: 'include'
    })
      .then(function (r) {
        return r.json()
      })
      .then(function (res) {
        __favoriteUserLoggedIn = !!(res && res.code === 0 && res.data)
        __favoriteUserCheckedAt = Date.now()
        return __favoriteUserLoggedIn
      })
      .catch(function () {
        __favoriteUserLoggedIn = false
        __favoriteUserCheckedAt = Date.now()
        return false
      })
    return __favoriteUserPromise
  }

  function ensureFavoriteAssets() {
    if (!document.getElementById('favorite-style')) {
      var style = document.createElement('style')
      style.id = 'favorite-style'
      style.textContent =
        '' +
        '.detail-title .favorite-star{position:absolute;width:28px;height:28px;border-radius:4px;border:1px solid #FDE6D5;background:rgba(255,255,255,.9);color:#999;display:inline-flex;align-items:center;justify-content:center;font-size:18px;line-height:1;cursor:pointer;z-index:4;padding:0;}' +
        '.detail-title .favorite-star.is-favorited{color:#FF7A25;border-color:#FF7A25;}' +
        '.detail-title .favorite-star:disabled{opacity:.6;cursor:not-allowed;}' +
        '.detail-title .visit-count{position:absolute;z-index:4;font:400 14px/28px "微软雅黑";color:#465160;white-space:nowrap;}' +
        '.favorite-login-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.35);display:none;align-items:center;justify-content:center;z-index:9999;}' +
        '.favorite-login-modal-overlay.is-active{display:flex;}' +
        '.favorite-login-modal{width:520px;max-width:calc(100vw - 32px);background:#fff;border-radius:8px;padding:22px 22px 18px 22px;box-sizing:border-box;}' +
        '.favorite-login-modal p{margin:0 0 18px 0;font:400 16px/170% "微软雅黑";color:#333;}' +
        '.favorite-login-modal a{color:#1677ff;text-decoration:none;}' +
        '.favorite-login-modal .modal-btns{display:flex;justify-content:center;}' +
        '.favorite-login-modal .favorite-login-close{padding:7px 22px;border-radius:4px;text-decoration:none;font-size:14px;cursor:pointer;background:#ff7a25;color:#fff;border:1px solid #ff7a25;}'
      document.head.appendChild(style)
    }
    if (!document.getElementById('favoriteLoginModal')) {
      var overlay = document.createElement('div')
      overlay.className = 'favorite-login-modal-overlay'
      overlay.id = 'favoriteLoginModal'
      overlay.innerHTML =
        '' +
        '<div class="favorite-login-modal">' +
        '<p><a href="https://dibj.cn/portal/oauth/login/capcloud" target="_blank" id="favoriteLoginLink">登录</a>后即可收藏该内容，方便下次快速查找。</p>' +
        '<div class="modal-btns"><a href="javascript:void(0);" id="favoriteLoginClose" class="favorite-login-close">我已知晓</a></div>' +
        '</div>'
      document.body.appendChild(overlay)
    }
    updateFavoriteLoginLink()
  }

  function updateFavoriteLoginLink() {
    var link = document.getElementById('favoriteLoginLink')
    if (!link) return
    var base =
      link.getAttribute('href') || 'https://dibj.cn/portal/oauth/login/capcloud'
    var target =
      window.location && window.location.href ? window.location.href : '/'
    if (!target) target = '/'
    link.setAttribute('href', base + '?targetUrl=' + encodeURIComponent(target))
  }

  function openFavoriteLoginModal() {
    var modal = document.getElementById('favoriteLoginModal')
    if (modal) modal.classList.add('is-active')
  }

  function closeFavoriteLoginModal() {
    var modal = document.getElementById('favoriteLoginModal')
    if (modal) modal.classList.remove('is-active')
  }

  function bindFavoriteLoginModal() {
    var closeBtn = document.getElementById('favoriteLoginClose')
    if (closeBtn && !closeBtn.__bound) {
      closeBtn.__bound = true
      closeBtn.addEventListener('click', function (e) {
        e.preventDefault()
        closeFavoriteLoginModal()
      })
    }
    var modal = document.getElementById('favoriteLoginModal')
    if (modal && !modal.__bound) {
      modal.__bound = true
      modal.addEventListener('click', function (e) {
        if (e && e.target === modal) closeFavoriteLoginModal()
      })
    }
  }

  function getBizUniqueIdFromDetail(d, fallbackId) {
    if (!d) return String(fallbackId || '')
    return (
      getVal(d, 'biz_unique_id') ||
      d.bizUniqueId ||
      d.biz_unique_id ||
      d.uniqueId ||
      d.unique_id ||
      d.data_code ||
      d.code ||
      d.id ||
      String(fallbackId || '')
    )
  }

  function getBizUniqueIdForVisit(d) {
    if (!d) return ''
    return getVal(d, 'biz_unique_id') || ''
  }

  function setFavoriteButtonState(btn, favorited) {
    if (!btn) return
    var v = !!favorited
    btn.classList.toggle('is-favorited', v)
    btn.textContent = v ? '★' : '☆'
    btn.setAttribute('aria-label', v ? '取消收藏' : '收藏')
  }

  function postVisit(tableCode, bizUniqueId) {
    if (!tableCode || !bizUniqueId) return Promise.resolve(false)
    var url =
      '/portal/api/favorite/visit?tableCode=' +
      encodeURIComponent(tableCode) +
      '&bizUniqueId=' +
      encodeURIComponent(bizUniqueId)
    return fetch(url, { method: 'POST', credentials: 'include' })
      .then(function () {
        return true
      })
      .catch(function () {
        return false
      })
  }

  function getVisitCountFromDetail(d) {
    if (!d) return ''
    var v = getVal(d, 'visit_count')
    if (v == null || v === '') v = d.visit_count
    if (v == null || v === '') v = d.visitCount
    if (v == null) v = ''
    return String(v)
  }

  function mountVisitCountInTitle(titleEl, favBtn) {
    if (!titleEl) return null
    if (titleEl.querySelector('.visit-count'))
      return titleEl.querySelector('.visit-count')
    var span = document.createElement('span')
    span.className = 'visit-count'
    span.textContent = '浏览量：--'
    if (favBtn && favBtn.parentNode === titleEl) {
      titleEl.insertBefore(span, favBtn)
    } else {
      titleEl.appendChild(span)
    }
    requestAnimationFrame(function () {
      if (!favBtn) favBtn = titleEl.querySelector('.favorite-star')
      if (!favBtn) return
      var favRight = 0
      var favTop = 0
      var favW = favBtn.offsetWidth || 28
      var rightStr =
        favBtn.style.right ||
        (window.getComputedStyle(favBtn) &&
          window.getComputedStyle(favBtn).right) ||
        '0px'
      var topStr =
        favBtn.style.top ||
        (window.getComputedStyle(favBtn) &&
          window.getComputedStyle(favBtn).top) ||
        '0px'
      var r = parseFloat(rightStr)
      var t = parseFloat(topStr)
      favRight = isFinite(r) ? r : 0
      favTop = isFinite(t) ? t : 0
      span.style.right = favRight + favW + 10 + 'px'
      span.style.top = favTop + 'px'
    })
    return span
  }

  function isVisitSupportedCat(catKey) {
    return (
      catKey === 'gov_data' ||
      catKey === 'lab_data' ||
      catKey === 'component_resource' ||
      catKey === 'release_tech_ability'
    )
  }

  function fetchFavoriteState(tableCode, bizUniqueId) {
    if (!tableCode || !bizUniqueId) return Promise.resolve(null)
    return fetch('/portal/api/favorite/batchCheck', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ tableCode: tableCode, bizUniqueId: bizUniqueId }]
      })
    })
      .then(function (r) {
        return r.json()
      })
      .then(function (res) {
        if (!res || res.code !== 0 || !Array.isArray(res.data)) return null
        for (var i = 0; i < res.data.length; i++) {
          var it = res.data[i]
          if (
            it &&
            String(it.tableCode) === String(tableCode) &&
            String(it.bizUniqueId) === String(bizUniqueId)
          ) {
            return normalizeFavorited(it.favorited)
          }
        }
        return null
      })
      .catch(function () {
        return null
      })
  }

  function toggleFavorite(tableCode, bizUniqueId, btn) {
    if (!tableCode || !bizUniqueId) {
      alert('缺少收藏标识，无法收藏')
      return
    }
    var requestKey = String(tableCode) + '::' + String(bizUniqueId)
    var now = Date.now()
    var lastAt = __favoriteLastClickAtMap[requestKey] || 0
    if (
      __favoriteInFlightMap[requestKey] ||
      now - lastAt < __favoriteDebounceMs
    )
      return
    __favoriteLastClickAtMap[requestKey] = now

    fetchCurrentUser(true).then(function (loggedIn) {
      if (!loggedIn) {
        openFavoriteLoginModal()
        return
      }
      if (btn) btn.disabled = true
      __favoriteInFlightMap[requestKey] = true
      $.ajax({
        url: '/portal/api/favorite/toggle',
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({ tableCode: tableCode, bizUniqueId: bizUniqueId })
      })
        .done(function (res) {
          if (res && res.code === 401) {
            __favoriteUserLoggedIn = false
            openFavoriteLoginModal()
            return
          }
          if (!res || res.code !== 0 || res.isSuccess === false) {
            alert((res && res.msg) || '操作失败')
            return
          }
          var favorited =
            res &&
            res.data &&
            typeof res.data.favorited !== 'undefined' &&
            res.data.favorited !== null
              ? res.data.favorited
              : null
          if (favorited === null) {
            alert((res && res.msg) || '操作失败')
            return
          }
          setFavoriteButtonState(btn, favorited)
        })
        .fail(function (xhr) {
          var status = xhr && xhr.status
          var code = xhr && xhr.responseJSON && xhr.responseJSON.code
          if (status === 401 || code === 401) {
            __favoriteUserLoggedIn = false
            openFavoriteLoginModal()
            return
          }
          alert('操作失败')
        })
        .always(function () {
          if (btn) btn.disabled = false
          __favoriteInFlightMap[requestKey] = false
        })
    })
  }

  function mountFavoriteInTitle(
    titleEl,
    tableCode,
    bizUniqueId,
    favoritedFromDetail
  ) {
    if (!titleEl || !tableCode || !bizUniqueId) return
    if (titleEl.querySelector('.favorite-star')) return

    var rightButtons = titleEl.querySelectorAll('.action-btn, .btn.apply-btn')
    var anchorBtn = rightButtons && rightButtons.length ? rightButtons[0] : null
    if (rightButtons && rightButtons.length > 1) {
      var minRight = Infinity
      for (var i = 0; i < rightButtons.length; i++) {
        var r = window.getComputedStyle(rightButtons[i]).right
        var num = parseFloat(r)
        if (!isFinite(num)) num = 0
        if (num < minRight) {
          minRight = num
          anchorBtn = rightButtons[i]
        }
      }
    }

    var favBtn = document.createElement('button')
    favBtn.type = 'button'
    favBtn.className = 'favorite-star'
    favBtn.setAttribute('aria-label', '收藏')
    favBtn.textContent = '☆'

    if (anchorBtn && anchorBtn.parentNode === titleEl) {
      titleEl.insertBefore(favBtn, anchorBtn)
    } else {
      titleEl.appendChild(favBtn)
    }

    favBtn.addEventListener('click', function (e) {
      e.preventDefault()
      e.stopPropagation()
      toggleFavorite(tableCode, bizUniqueId, favBtn)
    })

    setFavoriteButtonState(favBtn, favoritedFromDetail)

    requestAnimationFrame(function () {
      var btn = anchorBtn
      var gap = 10
      var baseRight = 0
      var top = 8
      if (btn) {
        var cs = window.getComputedStyle(btn)
        var rightStr = cs && cs.right
        var rightNum = parseFloat(rightStr)
        baseRight = isFinite(rightNum) ? rightNum : 0
        var btnW = btn.offsetWidth || 120
        top =
          btn.offsetTop + Math.max(0, Math.floor((btn.offsetHeight - 28) / 2))
        favBtn.style.right = baseRight + btnW + gap + 'px'
        favBtn.style.top = top + 'px'
      } else {
        favBtn.style.right = '130px'
        favBtn.style.top = top + 'px'
      }
    })
  }

  function setupFavoriteForDetail(catKey, d) {
    if (!isVisitSupportedCat(catKey)) return
    ensureFavoriteAssets()
    bindFavoriteLoginModal()

    var tableCode =
      categoryToTableCode[catKey] || getUrlParam('tableCode') || ''
    var bizUniqueId = getBizUniqueIdFromDetail(d, getUrlParam('id') || '')
    if (!tableCode || !bizUniqueId) return

    var titleEl = document.querySelector('#detail-container .detail-title')
    if (!titleEl) return

    var favoritedFromDetail = null
    if (d && typeof d.favorited !== 'undefined') {
      favoritedFromDetail = normalizeFavorited(d.favorited)
    } else if (d && typeof getVal(d, 'favorited') !== 'undefined') {
      favoritedFromDetail = normalizeFavorited(getVal(d, 'favorited'))
    }
    if (favoritedFromDetail === null) favoritedFromDetail = false

    mountFavoriteInTitle(titleEl, tableCode, bizUniqueId, favoritedFromDetail)
    var favBtnInTitle = titleEl.querySelector('.favorite-star')
    var visitEl = mountVisitCountInTitle(titleEl, favBtnInTitle)
    if (visitEl) {
      var cntText = getVisitCountFromDetail(d)
      visitEl.textContent = '浏览量：' + (cntText ? cntText : '--')
    }

    if (
      (!d || typeof d.favorited === 'undefined') &&
      typeof getVal(d, 'favorited') === 'undefined'
    ) {
      fetchFavoriteState(tableCode, bizUniqueId).then(function (fav) {
        if (fav === null) return
        var btn = titleEl.querySelector('.favorite-star')
        if (btn) setFavoriteButtonState(btn, fav)
      })
    }
  }

  // 中文别名 → 标准 key
  function resolveCategoryKey(cat) {
    if (!cat) return ''
    if (categoryLabels[cat]) return cat
    var keys = Object.keys(categoryLabels)
    for (var i = 0; i < keys.length; i++) {
      if (categoryLabels[keys[i]] === cat) return keys[i]
    }
    return cat
  }

  // ==================== 读取存储数据 ====================
  function readStoredRecord() {
    for (var i = 0; i < STORAGE_KEYS.length; i++) {
      try {
        var json = localStorage.getItem(STORAGE_KEYS[i])
        if (json) return JSON.parse(json)
      } catch (e) {}
    }
    return null
  }

  // ==================== Tab 切换 ====================
  function initTabs() {
    var tabs = document.querySelectorAll('.tab-bar .tab-item')
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var group = this.getAttribute('data-group')
        document
          .querySelectorAll('.tab-bar .tab-item[data-group="' + group + '"]')
          .forEach(function (t) {
            t.classList.remove('active')
          })
        document
          .querySelectorAll('.tab-content[data-group="' + group + '"]')
          .forEach(function (c) {
            c.classList.remove('active')
          })
        this.classList.add('active')
        var target = this.getAttribute('data-target')
        var content = document.getElementById(target)
        if (content) content.classList.add('active')
      })
    })
  }

  // ==================== 登录检查 ====================
  function checkLoginAndRedirect(redirectUrl) {
    fetch('/portal/oauth/currentUser')
      .then(function (r) {
        return r.json()
      })
      .then(function (res) {
        if (res && res.data) {
          window.location.href =
            redirectUrl || 'https://dibj.cn/portal/user/index'
        } else {
          var modal = document.getElementById('searchLoginModal')
          var modalClass = document.getElementsByClassName('search-login-modal')
          modalClass.innerHTML = '<p>请先登录</p>'
          if (modal) modal.classList.add('is-active')
        }
      })
      .catch(function () {
        var modal = document.getElementById('searchLoginModal')
        if (modal) modal.classList.add('is-active')
      })
  }

  // ==================== 渲染函数 ====================

  // 1. 应用创新成果（图一：基本信息 + 描述段落）
  function renderAppInnovation(d) {
    var title = getVal(d, 'achievement_code')
    var html = '<div class="detail-title">' + escapeHtml(title)
    html +=
      '<a href="javascript:void(0);" class="btn apply-btn" id="btn-cooperation" style="background:#ff7a25;">寻求合作</a>'
    html += '</div>'
    html +=
      '<div class="section-title"><span style=" border-bottom: 2px solid #e8a62f; padding-bottom: 12px; color: #e8a62f; ">基本信息</span></div>'
    html += '<div class="info-grid">'
    html += infoItem('创新成果标识', getVal(d, 'achievement_code'))
    html += infoItem('应用行业', convertIndustryCode(getVal(d, 'apply_industry')))
    html += infoItem('创新成果提供方', getVal(d, 'achievement_provider'))
    html += infoItem('已服务场景', getVal(d, 'served_scene'))
    html += infoItem('创新成果分类', getVal(d, 'achievement_type'))
    html += infoItem('上架时间', truncate(getVal(d, 'online_time'), 10))
    html += '</div>'
    var desc = getVal(d, 'achievement_desc')
    if (desc) {
      html +=
        '<div class="section-title"><span style=" border-bottom: 2px solid #e8a62f; padding-bottom: 12px;color:e8a62f; ">创新成果描述</span></div>'
      html += '<div class="desc-block">' + escapeHtml(desc) + '</div>'
    }
    return html
  }

  function ensureDataInnovationMediaStyle() {
    if (document.getElementById('data-innovation-media-style')) return
    var style = document.createElement('style')
    style.id = 'data-innovation-media-style'
    style.textContent =
      '' +
      '.data-innovation-media-row{display:flex;gap:16px;margin-top:18px;align-items:flex-start;flex-wrap:nowrap;max-width:2040px;overflow-x:auto;}' +
      '.data-innovation-media-col{flex:0 0 calc((100% - 32px) / 3);width:calc((100% - 32px) / 3);min-width:280px;}' +
      '.data-innovation-media-box{width:100%;aspect-ratio:16/10;border-radius:6px;overflow:hidden;background:#f5f5f5;box-shadow:0 0 0 1px rgba(0,0,0,.06) inset;}' +
      '.data-innovation-media-box img,.data-innovation-media-box video{width:100%;height:100%;display:block;}' +
      '.data-innovation-media-box img{object-fit:cover;cursor:zoom-in;}' +
      '.data-innovation-media-box video{background:#000;object-fit:contain;}' +
      '.data-innovation-preview{position:fixed;inset:0;background:rgba(0,0,0,.72);display:none;align-items:center;justify-content:center;z-index:10000;padding:24px;box-sizing:border-box;}' +
      '.data-innovation-preview.is-active{display:flex;}' +
      '.data-innovation-preview img{max-width:min(1200px,92vw);max-height:88vh;display:block;border-radius:6px;box-shadow:0 8px 24px rgba(0,0,0,.35);}' +
      '@media (max-width: 1100px){.data-innovation-media-row{max-width:none;}}'
    document.head.appendChild(style)
  }

  function renderDataInnovationMediaRow() {
    let catParam = getUrlParam('id')
    if (catParam == 22) {
      return (
        '' +
        '<div class="data-innovation-media-row">' +
        '<div class="data-innovation-media-col">' +
        '<div class="data-innovation-media-box"><img src="/images/dataPicture1.jpg" alt="展示图片1" class="data-innovation-previewable" /></div>' +
        '</div>' +
        '<div class="data-innovation-media-col">' +
        '<div class="data-innovation-media-box"><img src="/images/dataPicture2.jpg" alt="展示图片2" class="data-innovation-previewable" /></div>' +
        '</div>' +
        '<div class="data-innovation-media-col data-innovation-media-right">' +
        '<div class="data-innovation-media-box"><video controls preload="metadata">' +
        '<source src="/video/dataVedio.mp4" type="video/mp4" />' +
        '</video>' +
        '</div>' +
        '</div>' +
        '</div>'
      )
    } else{
      return '<div></div>';
    }
  }

  function ensureDataInnovationPreview() {
    var modal = document.getElementById('dataInnovationPreview')
    if (modal) return modal
    modal = document.createElement('div')
    modal.id = 'dataInnovationPreview'
    modal.className = 'data-innovation-preview'
    modal.innerHTML = '<img src="" alt="预览图片" />'
    modal.addEventListener('click', function (e) {
      if (e.target === modal || e.target.tagName === 'IMG') {
        modal.classList.remove('is-active')
      }
    })
    document.body.appendChild(modal)
    return modal
  }

  function bindDataInnovationMediaPreview(container) {
    if (!container) return
    var modal = ensureDataInnovationPreview()
    var previewImg = modal.querySelector('img')
    container
      .querySelectorAll('.data-innovation-previewable')
      .forEach(function (img) {
        if (img.__previewBound) return
        img.__previewBound = true
        img.addEventListener('click', function () {
          previewImg.src = img.getAttribute('src') || ''
          previewImg.alt = img.getAttribute('alt') || '预览图片'
          modal.classList.add('is-active')
        })
      })
  }

  // 2. 联合实验室数据（基本信息 + 样例数据 + 获取数据按钮）
  function renderLabData(d) {
    var title = getVal(d, 'data_name')
    var html = '<div class="detail-title">' + escapeHtml(title)
    html +=
      '<a href="javascript:void(0);" class="btn apply-btn" id="btn-get-data" style="background:#ff7a25;">获取数据</a>'
    html += '</div>'
    html +=
      '<div class="section-title"><span style=" border-bottom: 2px solid #e8a62f; padding-bottom: 12px; color: #e8a62f; ">基本信息</span></div>'
    html += '<div class="info-grid">'
    html += infoItem('部门名称', getVal(d, 'dept_name'))
    html += infoItem('数据资源名称', getVal(d, 'data_name'))
    html += infoItem('服务类型', getVal(d, 'service_type'))
    html += infoItem('描述', stripHtml(getVal(d, 'description')))
    html += '</div>'

    // 样例数据（如果存在 sample_data_json 字段）
    var sampleJson = getVal(d, 'sample_data_json')
    if (sampleJson) {
      var sampleData = sampleJson
      if (typeof sampleJson === 'string') {
        try {
          var parsed = JSON.parse(sampleJson)
          if (Array.isArray(parsed)) sampleData = parsed
        } catch (e) {
          /* 非JSON格式，按图片字符串处理 */
        }
      }

      if (Array.isArray(sampleData) && sampleData.length > 0) {
        // 数组类型 → 渲染表格
        html +=
          '<div class="section-title"><span style=" border-bottom: 2px solid #e8a62f; padding-bottom: 12px; color: #e8a62f; ">样例数据</span></div>'
        var cols = Object.keys(sampleData[0])
        html +=
          '<div style="overflow-x:auto;"><table class="sample-table"><thead><tr>'
        cols.forEach(function (col) {
          html += '<th>' + escapeHtml(col) + '</th>'
        })
        html += '</tr></thead><tbody>'
        sampleData.forEach(function (row) {
          html += '<tr>'
          cols.forEach(function (col) {
            html += '<td>' + escapeHtml(row[col]) + '</td>'
          })
          html += '</tr>'
        })
        html += '</tbody></table></div>'
      } else if (typeof sampleData === 'string' && sampleData.trim()) {
        // 字符串类型 → 多图片渲染（路径用 ||| 分隔）
        var imgPaths = sampleData
          .split('|||')
          .map(function (p) { return p.trim() })
          .filter(function (p) { return p })
        if (imgPaths.length > 0) {
          ensureDataInnovationMediaStyle()
          html +=
            '<div class="section-title"><span style=" border-bottom: 2px solid #e8a62f; padding-bottom: 12px; color: #e8a62f; ">样例数据</span></div>'
          // 按一行最多3张分组渲染，不足3张时保持至少2列布局
          for (var i = 0; i < imgPaths.length; i += 3) {
            var rowImgs = imgPaths.slice(i, i + 3)
            var colCount = rowImgs.length < 3 ? 2 : 3
            var colStyle =
              colCount === 2
                ? 'flex:0 0 calc((100% - 16px) / 2);width:calc((100% - 16px) / 2);'
                : 'flex:0 0 calc((100% - 32px) / 3);width:calc((100% - 32px) / 3);'
            html += '<div class="data-innovation-media-row" style="margin-top:18px;">'
            for (var j = 0; j < colCount; j++) {
              html += '<div class="data-innovation-media-col" style="' + colStyle + 'min-width:280px;">'
              if (rowImgs[j]) {
                html += '<div class="data-innovation-media-box"><img src="' + escapeHtml(rowImgs[j]) + '" alt="样例图片" class="data-innovation-previewable" /></div>'
              } else {
                html += '<div class="data-innovation-media-box"></div>'
              }
              html += '</div>'
            }
            html += '</div>'
            // 图片组之间保留空行
            if (i + 3 < imgPaths.length) {
              html += '<div style="height:16px;"></div>'
            }
          }
        }
      }
    }
    return html
  }

  // 3. 政府侧数据（图三：基本信息 + 样例数据 + 点击下载/获取数据）
  function renderGovData(d) {
    var title = getVal(d, 'data_name')
    var isOpen = getVal(d, 'is_open')
    var isShared = getVal(d, 'is_shared')
    var isOpenFlag = isOpen === '1' || isOpen === '是'
    var isSharedFlag =
      isShared === '1' ||
      isShared === '是' ||
      isShared === 'true' ||
      isShared === true ||
      isShared === '无条件共享'
    var canDownload = isOpenFlag && isSharedFlag

    var html = '<div class="detail-title">' + escapeHtml(title)
    if (canDownload) {
      html +=
        '<a href="javascript:void(0);" class="action-btn" id="btn-download" style="background:#ff7a25;">获取数据</a>'
    } else {
      html +=
        '<a href="javascript:void(0);" class="action-btn" id="btn-gov-get-data" style="background:#ff7a25;">获取数据</a>'
      // html += '<a href="/sthz/cgyy/" target="_blank" class="btn apply-btn">预约参观</a>';
    }
    html += '</div>'
    html +=
      '<div class="section-title"><span style=" border-bottom: 2px solid #e8a62f; padding-bottom: 12px; color: #e8a62f; ">基本信息</span></div>'
    html += '<div class="info-grid">'
    html += infoItem('部门名称', getVal(d, 'dept_name'))
    html += infoItem('数据资源名称', getVal(d, 'data_name'))
    html += infoItem('服务类型', getVal(d, 'service_type'))
    html += infoItem('是否共享', getVal(d, 'is_shared'))
    html += infoItem('是否开放', isOpenFlag ? '是' : '否')
    html += '</div>'

    // 样例数据
    var sampleJson =
      getVal(d, 'sample_data_json') || getVal(d, 'sample_data_keyword')
    if (sampleJson) {
      try {
        var sampleData =
          typeof sampleJson === 'string' ? JSON.parse(sampleJson) : sampleJson
        if (Array.isArray(sampleData) && sampleData.length > 0) {
          html +=
            '<div class="section-title"><span style=" border-bottom: 2px solid #e8a62f; padding-bottom: 12px; color: #e8a62f; ">样例数据</span></div>'
          var cols = Object.keys(sampleData[0])
          html +=
            '<div style="overflow-x:auto;"><table class="sample-table"><thead><tr>'
          cols.forEach(function (col) {
            html += '<th>' + escapeHtml(col) + '</th>'
          })
          html += '</tr></thead><tbody>'
          sampleData.forEach(function (row) {
            html += '<tr>'
            cols.forEach(function (col) {
              html += '<td>' + escapeHtml(row[col]) + '</td>'
            })
            html += '</tr>'
          })
          html += '</tbody></table></div>'
        }
      } catch (e) {
        /* 样例数据解析失败，不渲染 */
      }
    }
    return html
  }
  // html += '<div class="section-title">场景描述</div>';

  // 4. 场景需求（图四：基本信息 + tabs + 场景申请按钮）
  function renderSceneDemand(d) {
    // 存储 biz_unique_id 供场景申请跳转使用
    window.__currentBizUniqueId = getVal(d, 'biz_unique_id') || ''
    var title = getVal(d, 'scene_name')
    // 判断是否揭榜中：scene_type="1" 或 包含揭榜关键字
    var sceneType = getVal(d, 'scene_range')
    var isJieBang = sceneType == '1'

    var html =
      '<div class="detail-title" style="text-align:center">' + escapeHtml(title)
    if (!isJieBang) {
      html +=
        '<a href="javascript:void(0);" class="btn apply-btn" id="btn-scene-cooperation" style="background:#ff7a25;">寻求合作</a>'
    }
    if (isJieBang) {
      html +=
        '<a href="javascript:void(0);" class="btn apply-btn" id="btn-scene-apply">场景申请</a>'
    }
    html += '</div>'
    html +=
      '<div class="section-title"><span style=" border-bottom: 2px solid #e8a62f; padding-bottom: 12px; color: #e8a62f; ">基本信息</span></div>'
    html += '<div class="info-grid">'
    html += infoItem('场景开放单位', getVal(d, 'scene_open_dept'))
    html += infoItem('场景批次', getVal(d, 'scene_batch'))
    html += infoItem('场景名称', getVal(d, 'scene_name'))
    html += infoItem(
      '场景类型',
      sceneTypeMap[sceneType] || sceneType || '暂无数据'
    )
    html += infoItem('联系人', getVal(d, 'contact_user'))
    html += infoItem('电话', getVal(d, 'phone'))
    html += infoItem('电子邮箱', getVal(d, 'email'))
    html += '</div>'

    // Tab 区域
    var summary = getVal(d, 'scene_summary')
    var status = getVal(d, 'scene_status')
    var demand = getVal(d, 'scene_innovation_demand')
    html += '<div class="tab-bar">'
    html +=
      '<div class="tab-item active" data-group="scene" data-target="tab-scene-summary">场景概述</div>'
    html +=
      '<div class="tab-item" data-group="scene" data-target="tab-scene-status">场景现状</div>'
    html +=
      '<div class="tab-item" data-group="scene" data-target="tab-scene-demand">场景创新需求</div>'
    html += '</div>'
    html +=
      '<div class="tab-content active" data-group="scene" id="tab-scene-summary">' +
      escapeHtml(summary || '暂无数据') +
      '</div>'
    html +=
      '<div class="tab-content" data-group="scene" id="tab-scene-status">' +
      escapeHtml(status || '暂无数据') +
      '</div>'
    html +=
      '<div class="tab-content" data-group="scene" id="tab-scene-demand">' +
      escapeHtml(demand || '暂无数据') +
      '</div>'
    return html
  }

  // 5. 入驻项目（图五：标题 + tabs）
  function renderSettledProject(d) {
    var title = getVal(d, 'project_name')
    var html = '<div class="detail-title">' + escapeHtml(title)
    html +=
      '<a href="javascript:void(0);" class="btn apply-btn" id="btn-cooperation-settled" style="background:#ff7a25;">寻求合作</a>'

    html += '</div>'

    var target = getVal(d, 'project_target')
    var result = getVal(d, 'expected_result')
    html += '<div class="tab-bar">'
    html +=
      '<div class="tab-item active" data-group="project" data-target="tab-project-target">项目目标</div>'
    html +=
      '<div class="tab-item" data-group="project" data-target="tab-project-result">预期成果</div>'
    html += '</div>'
    html +=
      '<div class="tab-content active" data-group="project" id="tab-project-target">' +
      escapeHtml(target || '暂无数据') +
      '</div>'
    html +=
      '<div class="tab-content" data-group="project" id="tab-project-result">' +
      escapeHtml(result || '暂无数据') +
      '</div>'
    return html
  }

  // 6. 组件资源（基本信息表格布局）
  function renderComponentResource(d) {
    var title = getVal(d, 'component_name')
    var html = '<div class="detail-title">' + escapeHtml(title)
    html +=
      '<a href="javascript:void(0);" class="action-btn" id="btn-get-component" style="background:#ff7a25;">获取组件</a>'
    html += '</div>'
    html +=
      '<div class="section-title"><span style=" border-bottom: 2px solid #e8a62f; padding-bottom: 12px; color: #e8a62f; ">基本信息</span></div>'
    html += '<div class="info-grid">'
    html += infoItem('组件实施的流程分类', '需要门户开通账号（需要账号授权）')
    html += infoItem('组件资源名称', getVal(d, 'component_name'))
    html += infoItem('组件版本', getVal(d, 'component_version'))
    html += infoItem('服务商', getVal(d, 'provider'))
    html += '</div>'
    // 微缩部署地址 + 组件说明（第三行，组件说明可能较长）
    var deployUrl = getVal(d, 'deploy_url')
    var componentDesc = getVal(d, 'component_desc')
    if (deployUrl || componentDesc) {
      html += '<div class="info-grid" style="margin-top:0;">'
      html += infoItem('微缩部署地址', deployUrl)
      html += infoItem('组件说明', componentDesc)
      html += '</div>'
    }
    return html
  }

  // 7. 社会侧数据（产品名、行业、提供方、标签、描述）
  function renderSocialData(d) {
    var title = getVal(d, 'product_name') || getVal(d, 'data_name') || '无标题'
    var html = '<div class="detail-title">' + escapeHtml(title)
    html +=
      '<a href="javascript:void(0);" class="action-btn" id="btn-social-get-data" style="background:#ff7a25;">获取数据</a>'
    html += '</div>'
    html +=
      '<div class="section-title"><span style=" border-bottom: 2px solid #e8a62f; padding-bottom: 12px; color: #e8a62f; ">基本信息</span></div>'
    html += '<div class="info-grid">'
    html += infoItem('产品名称', title)
    html += infoItem(
      '所属行业',
      getVal(d, 'goods_industry') || getVal(d, 'industry')
    )
    html += infoItem('提供方', getVal(d, 'org_name') || getVal(d, 'provider'))
    html += infoItem('数据标签', getVal(d, 'product_tags') || getVal(d, 'tags'))
    html += '</div>'
    var desc = getVal(d, 'description')
    if (desc) {
      html +=
        '<div class="section-title"><span style=" border-bottom: 2px solid #e8a62f; padding-bottom: 12px; color: #e8a62f; ">产品描述</span></div>'
      html += '<div class="desc-block">' + escapeHtml(desc) + '</div>'
    }
    return html
  }

  function renderReleaseTechAbility(d) {
    var title = getVal(d, 'tech_direction')
    var html = '<div class="detail-title">' + escapeHtml(title)
    html +=
      '<a href="javascript:void(0);" class="action-btn" id="btn-release-tech-ability-get" style="background:#ff7a25;">寻求合作</a>'
    html += '</div>'
    html +=
      '<div class="section-title"><span style=" border-bottom: 2px solid #e8a62f; padding-bottom: 12px; color: #e8a62f; ">基本信息</span></div>'
    html += '<div class="info-grid">'
    html += infoItem('重点应用领域', getVal(d, 'apply_field'))
    html += infoItem('支持单位', getVal(d, 'support_unit'))
    html += infoItem('技术方向', getVal(d, 'content_desc'))
    html += infoItem('日期', getVal(d, 'data_time'))
    html += '</div>'
    return html
  }

  // ==================== 主逻辑 ====================
  function init() {
    var catParam = getUrlParam('_searchCategory')
    var tableCodeParam = getUrlParam('tableCode')
    var idParam = getUrlParam('id')
    var bizUniqueIdParam =
      getUrlParam('biz_unique_id') ||
      getUrlParam('bizUniqueId') ||
      getUrlParam('biz_uniqueId') ||
      ''
    var sourceParam = getUrlParam('source')
    var container = document.getElementById('detail-container')
    var breadcrumbCat = document.getElementById('breadcrumb-category')

    // 通过 source 参数映射分类 key（优先级最高，shujuListNew.js 传入）
    var catKey = sourceToCatKey[sourceParam] || ''
    // 其次通过 tableCode 反推
    if (!catKey && tableCodeParam) {
      catKey = tableCodeToCatKey(tableCodeParam)
    }
    // 最后用 _searchCategory
    if (!catKey) {
      catKey = resolveCategoryKey(catParam)
    }
    // 补充 tableCode（当只有 _searchCategory 时）
    var tableCode =
      tableCodeParam || categoryToTableCode[catKey] || catParam || ''

    // 更新面包屑
    var label = categoryLabels[catKey] || '详情'
    if (breadcrumbCat) breadcrumbCat.textContent = label

    // 优先通过 API 获取详情数据
    if (tableCode && idParam) {
      container.innerHTML = '<div class="no-data">加载中...</div>'
      var preVisitSupported =
        !!bizUniqueIdParam &&
        (catKey === 'component_resource' ||
          catKey === 'gov_data' ||
          catKey === 'lab_data')
      var visitRefreshed = preVisitSupported
      var startFetch = function () {
        fetchDetailFromApi(tableCode, idParam, function (err, res) {
          if (err) {
            // API 失败，降级到 localStorage
            renderFromStorage(catKey, container)
            return
          }
          var d = res && res.data ? res.data : res
          if (!d || (typeof d === 'object' && Object.keys(d).length === 0)) {
            renderFromStorage(catKey, container)
            return
          }
          renderDetail(catKey, d, container)
          if (!visitRefreshed && isVisitSupportedCat(catKey)) {
            var bizUniqueIdForVisit = getBizUniqueIdForVisit(d)
            if (bizUniqueIdForVisit) {
              visitRefreshed = true
              var refetch = function () {
                fetchDetailFromApi(tableCode, idParam, function (err2, res2) {
                  if (err2) return
                  var d2 = res2 && res2.data ? res2.data : res2
                  if (
                    !d2 ||
                    (typeof d2 === 'object' && Object.keys(d2).length === 0)
                  )
                    return
                  renderDetail(catKey, d2, container)
                })
              }
              postVisit(tableCode, bizUniqueIdForVisit)
                .then(refetch)
                .catch(refetch)
            }
          }
        })
      }
      if (preVisitSupported) {
        postVisit(tableCode, bizUniqueIdParam)
          .then(startFetch)
          .catch(startFetch)
      } else {
        startFetch()
      }
    } else {
      // 无 tableCode/id 参数，降级到 localStorage
      renderFromStorage(catKey, container)
    }
  }

  // 降级：从 localStorage 读取数据
  function renderFromStorage(catKey, container) {
    var record = readStoredRecord()
    if (!record) {
      container.innerHTML =
        '<div class="no-data">暂无详情数据，请返回搜索结果重新查看</div>'
      return
    }
    // 兼容两种存储格式：{__raw: data} 或直接存储 item
    var d = record.__raw || record
    // 如果 record 有 __source 字段，尝试用它补充 catKey
    if (!catKey && record.__source) {
      catKey = sourceToCatKey[record.__source] || record.__source
    }
    renderDetail(catKey, d, container)
  }

  // 统一渲染详情
  function renderDetail(catKey, d, container) {
    console.log('renderDetail', catKey, d)
    var html = ''
    switch (catKey) {
      case 'app_innovation':
        document.title = '应用创新-详情'
        html = renderAppInnovation(d)
        break
      case 'DATA_INNOVATION':
        document.title = '数据创新-详情'
        ensureDataInnovationMediaStyle()
        html = renderAppInnovation(d) + renderDataInnovationMediaRow()
        break
      case 'data_innovation':
        document.title = '数据创新-详情'
        ensureDataInnovationMediaStyle()
        html = renderAppInnovation(d) + renderDataInnovationMediaRow()
        break
      case 'lab_data':
        document.title = '实验室数据-详情'
        html = renderLabData(d)
        break
      case 'gov_data':
        document.title = '政府侧数据-详情'
        html = renderGovData(d)
        break
      case 'scene_demand':
        document.title = '场景需求-详情'
        html = renderSceneDemand(d)
        break
      case 'settled_project':
        document.title = '入驻项目-详情'
        html = renderSettledProject(d)
        break
      case 'component_resource':
        document.title = '组件-详情'
        html = renderComponentResource(d)
        break
      case 'social_data':
        document.title = '社会侧数据-详情'
        html = renderSocialData(d)
        break
      case 'release_tech_ability':
        document.title = '技术创新能力-详情'
        html = renderReleaseTechAbility(d)
        break
      default:
        container.innerHTML =
          '<div class="no-data">暂不支持该类别的详情查看</div>'
        return
    }
    container.innerHTML = html
    setupFavoriteForDetail(catKey, d)
    initTabs()
    bindActionButtons(catKey, d)
    if (catKey === 'DATA_INNOVATION' || catKey === 'data_innovation' || catKey === 'lab_data') {
      bindDataInnovationMediaPreview(container)
    }
  }

  // ==================== 绑定操作按钮 ====================
  function bindActionButtons(catKey, d) {
    console.log('bindActionButtons', catKey, d)
    // 联合实验室数据 - 获取数据（弹窗显示联系人）
    var btnGetData = document.getElementById('btn-get-data')
    console.log(btnGetData, 'btnGetData')
    if (btnGetData) {
      console.log(1111122222)
      btnGetData.addEventListener('click', function (e) {
        e.preventDefault()
        // 使用局部存储设置详情数据
        var titleObj = {}
        var deptName = getVal(d, 'dept_name')
        var dataName = getVal(d, 'data_name') || getVal(d, 'title')
        var dataType = getVal(d, 'data_type')
        var description = getVal(d, 'description') || '暂无数据'
        if (deptName) titleObj['部门名称'] = deptName
        if (dataName) titleObj['数据资源名称'] = dataName
        if (dataType) titleObj['服务类型'] = dataType
        titleObj['描述'] = description

        if (window.DemandRegistration) {
          window.DemandRegistration.setDetailData({
            tableCode: getUrlParam('tableCode') || 'LAB_DATA',
            referenceId:
              getUrlParam('id') ||
              getVal(d, 'id') ||
              getVal(d, 'data_code') ||
              '',
            title: JSON.stringify(titleObj),
            details: ''
          })
        }
        console.log(1111, d)
        var deptNameVal = deptName || ''
        console.log(deptNameVal, 'dept_name')
        // 动态设置翻转卡片弹窗的提示内容，等弹窗DOM就绪后再更新内容并显示
        waitForElement('govGetDataModal', function (modal) {
          resetGovGetDataModalLayout(modal)
          // 优先按id查找，回退按结构查找（兼容旧版HTML无id的情况）
          var govTitleEl =
            modal.querySelector('#govModalTitle') ||
            modal.querySelector('.flip-card-front h3')
          if (govTitleEl) govTitleEl.textContent = '数据获取说明'
          var govDescEl =
            modal.querySelector('#govModalDesc') ||
            modal.querySelector('.flip-card-front p')
          console.log(govDescEl, 'govDescEl')
          if (govDescEl) {
            if (deptNameVal.indexOf('信令') !== -1) {
              govDescEl.innerHTML =
                '您正在获取的数据属于非开放数据，需要到数智北京创新中心申请后获取。获取请联系：' +
                '<div class="contact-block"><span class="contact-item">👨‍🏫 江茜：010-59703511、010-59703522</span></div>' +
                '或者进行<span class="dialogBtnClass" id="btnRegister">需求反馈</span>，我们会安排专人与您对接，如需线下参观，请提前<a href="/sthz/cgyy/" class="dialogBtnClass">进行预约</a>。'
            } else if (deptNameVal.indexOf('空间') !== -1) {
              govDescEl.innerHTML =
                '您正在获取的数据属于非开放数据，需要到数智北京创新中心申请后获取。获取请联系：' +
                '<div class="contact-block"><span class="contact-item">👨‍🏫 李娜：010-55529760</span></div>' +
                '或者进行<span class="dialogBtnClass" id="btnRegister">需求反馈</span>，我们会安排专人与您对接，如需线下参观，请提前<a href="/sthz/cgyy/" class="dialogBtnClass">进行预约</a>。'
            }
             else {
              govDescEl.innerHTML =
                '您正在获取的数据属于非开放数据，需要到数智北京创新中心申请后获取。获取请联系：' +
                '<div class="contact-block"><span class="contact-item">👨‍🏫 秦启威：010-55529760</span></div>' +
                '或者进行<span class="dialogBtnClass" id="btnRegister">需求反馈</span>，我们会安排专人与您对接，如需线下参观，请提前<a href="/sthz/cgyy/" class="dialogBtnClass">进行预约</a>。'
            }
          }
          modal.classList.add('is-active')
        })
      })
    }

    // 政府侧数据 - 点击下载（跳转 dataUrl 字段链接）
    var btnDownload = document.getElementById('btn-download')
    if (btnDownload) {
      btnDownload.addEventListener('click', function (e) {
        e.preventDefault()
        var dataUrl = d.dataUrl || d.data_url || ''
        if (dataUrl) {
          window.open(dataUrl, '_blank')
        } else {
          alert('暂无下载链接')
        }
      })
    }

    // 政府侧数据 - 获取数据（弹窗）
    var btnGovGetData = document.getElementById('btn-gov-get-data')
    if (btnGovGetData) {
      btnGovGetData.addEventListener('click', function (e) {
        e.preventDefault()
        // 使用局部存储设置详情数据
        var titleObj = {}
        var deptName = getVal(d, 'dept_name')
        var dataName = getVal(d, 'data_name')
        var serviceType = getVal(d, 'service_type')
        var isShared = getVal(d, 'is_shared')
        if (deptName) titleObj['部门名称'] = deptName
        if (dataName) titleObj['数据资源名称'] = dataName
        if (serviceType) titleObj['服务类型'] = serviceType
        if (isShared !== undefined) titleObj['是否共享'] = isShared

        if (window.DemandRegistration) {
          window.DemandRegistration.setDetailData({
            tableCode: getUrlParam('tableCode') || 'GOV_DATA',
            referenceId:
              getUrlParam('id') ||
              getVal(d, 'id') ||
              getVal(d, 'data_code') ||
              '',
            title: JSON.stringify(titleObj),
            details: ''
          })
        }

        // 根据分类动态设置弹窗标题，等弹窗DOM就绪后再更新内容并显示
        waitForElement('govGetDataModal', function (modal) {
          resetGovGetDataModalLayout(modal)
          var govTitleEl =
            modal.querySelector('#govModalTitle') ||
            modal.querySelector('.flip-card-front h3')
          if (govTitleEl) {
            if (
              catKey === 'component_resource' ||
              catKey === 'cloud_network_calc'
            ) {
              govTitleEl.textContent = '资源获取说明'
            } else {
              govTitleEl.textContent = '数据获取说明'
            }
          }
          // 重置弹窗描述为默认内容（联合实验室可能修改过）
          var govDescEl =
            modal.querySelector('#govModalDesc') ||
            modal.querySelector('.flip-card-front p')
          if (govDescEl) {
            govDescEl.innerHTML =
              '您正在获取的数据属于非开放数据，需要到数智北京创新中心申请后获取。获取请联系：' +
              '<div class="contact-block"><span class="contact-item">👨‍🏫 秦启威：18601139697</span><span class="contact-item">👩‍💼 刘甜甜：19801266061</span></div>' +
              '或者进行<span class="dialogBtnClass" id="btnRegister">需求反馈</span>，我们会安排专人与您对接，如需线下参观，请提前<a href="/sthz/cgyy/" class="dialogBtnClass">进行预约</a>。'
          }
          modal.classList.add('is-active')
        })
      })
    }
    // 场景需求 - 寻求合作（使用翻转卡片弹窗）
    var btnSceneCooperation = document.getElementById('btn-scene-cooperation')
    if (btnSceneCooperation) {
      btnSceneCooperation.addEventListener('click', function (e) {
        e.preventDefault()
        // 使用局部存储设置详情数据
        var titleObj = {}
        var demandName = getVal(d, 'demand_name') || getVal(d, 'title')
        var industry = getVal(d, 'industry')
        var demandType = getVal(d, 'demand_type')
        if (demandName) titleObj['需求名称'] = demandName
        if (industry) titleObj['所属行业'] = industry
        if (demandType) titleObj['需求类型'] = demandType

        if (window.DemandRegistration) {
          window.DemandRegistration.setDetailData({
            tableCode: getUrlParam('tableCode') || 'SCENE_DATA',
            referenceId: getUrlParam('id') || getVal(d, 'id') || '',
            title: JSON.stringify(titleObj),
            details: ''
          })
        }

        // 使用翻转卡片弹窗，等DOM就绪后再更新内容并显示
        waitForElement('govGetDataModal', function (modal) {
          resetGovGetDataModalLayout(modal)
          var govTitleEl =
            modal.querySelector('#govModalTitle') ||
            modal.querySelector('.flip-card-front h3')
          if (govTitleEl) govTitleEl.textContent = '合作对接说明'
          var govDescEl =
            modal.querySelector('#govModalDesc') ||
            modal.querySelector('.flip-card-front p')
          if (govDescEl) {
            govDescEl.innerHTML =
              '您正在查看的场景已无法揭榜，如您希望参与场景创新项目。获取请联系：' +
              '<div class="contact-block"><span class="contact-item">👨‍🏫 秦启威：18601139697</span><span class="contact-item">👩‍💼 刘甜甜：19801266061</span></div>' +
              '或者进行<span class="dialogBtnClass" id="btnRegister">需求反馈</span>，我们会安排专人与您对接，如需线下参观，请提前<a href="/sthz/cgyy/" class="dialogBtnClass">进行预约</a>。'
          }
          // scene_range为1时给弹窗加compact类，否则移除
          var modalInner = modal.querySelector('.search-login-modal')
          if (modalInner) {
            if (getVal(d, 'scene_range') === '1') {
              modalInner.classList.add('compact')
            } else {
              modalInner.classList.remove('compact')
            }
          }
          modal.classList.add('is-active')
        })
      })
    }

    // 场景需求 - 场景申请（先弹申请须知弹窗，确认申请按钮已在 HTML 内联脚本中绑定）
    var btnApply = document.getElementById('btn-scene-apply')
    if (btnApply) {
      btnApply.addEventListener('click', function (e) {
        e.preventDefault()
        // 使用局部存储设置详情数据
        var titleObj = {}
        var demandName = getVal(d, 'demand_name') || getVal(d, 'title')
        var industry = getVal(d, 'industry')
        var demandType = getVal(d, 'demand_type')
        if (demandName) titleObj['需求名称'] = demandName
        if (industry) titleObj['所属行业'] = industry
        if (demandType) titleObj['需求类型'] = demandType

        if (window.DemandRegistration) {
          window.DemandRegistration.setDetailData({
            tableCode: getUrlParam('tableCode') || 'SCENE_DATA',
            referenceId: getUrlParam('id') || getVal(d, 'id') || '',
            title: JSON.stringify(titleObj),
            details: ''
          })
        }

        var modal = document.getElementById('sceneApplyModal')
        if (modal) {
          var modalInner = modal.querySelector('.search-login-modal')
          if (modalInner) modalInner.classList.add('compact')
          modal.classList.add('is-active')
        }
      })
    }

    // 组件资源 - 获取组件（使用翻转卡片弹窗，描述含登录链接）
    var btnGetComponent = document.getElementById('btn-get-component')
    if (btnGetComponent) {
      btnGetComponent.addEventListener('click', function (e) {
        e.preventDefault()
        // 使用局部存储设置详情数据
        var titleObj = {}
        var componentName = getVal(d, 'component_name') || getVal(d, 'name')
        var componentType = getVal(d, 'component_type')
        var provider = getVal(d, 'provider')
        if (componentName) titleObj['组件名称'] = componentName
        if (componentType) titleObj['组件类型'] = componentType
        if (provider) titleObj['提供方'] = provider

        if (window.DemandRegistration) {
          window.DemandRegistration.setDetailData({
            tableCode: getUrlParam('tableCode') || 'COMPONENT_DATA',
            referenceId: getUrlParam('id') || getVal(d, 'id') || '',
            title: JSON.stringify(titleObj),
            details: ''
          })
        }

        // 使用翻转卡片弹窗，等DOM就绪后再更新内容并显示
        waitForElement('govGetDataModal', function (modal) {
          resetGovGetDataModalLayout(modal)
          var govTitleEl =
            modal.querySelector('#govModalTitle') ||
            modal.querySelector('.flip-card-front h3')
          if (govTitleEl) govTitleEl.textContent = '资源获取说明'
          var govDescEl =
            modal.querySelector('#govModalDesc') ||
            modal.querySelector('.flip-card-front p')
          if (govDescEl) {
            govDescEl.innerHTML =
              '组件资源需依托项目进行申请，请先用法人身份' +
              '<a href="https://dibj.cn/portal/user/index" class="dialogBtnClass" target="_blank">登录个人中心</a>，' +
              '完成项目及团队创建后，再进行资源获取。'
          }
          applyComponentGovGetDataModalLayout(modal)
        })
      })
    }

    // 技术创新能力 - 寻求合作（使用翻转卡片弹窗）
    var btnGetAbility = document.getElementById('btn-release-tech-ability-get')
    if (btnGetAbility) {
      console.log(d, '当前列表信息')
      btnGetAbility.addEventListener('click', function (e) {
        e.preventDefault()
        // 使用局部存储设置详情数据
        var titleObj = {}
        var abilityName = getVal(d, 'ability_name') || getVal(d, 'title')
        var abilityType = getVal(d, 'ability_type')
        var company = getVal(d, 'company_name')
        if (abilityName) titleObj['能力名称'] = abilityName
        if (abilityType) titleObj['能力类型'] = abilityType
        if (company) titleObj['企业名称'] = company

        if (window.DemandRegistration) {
          window.DemandRegistration.setDetailData({
            tableCode: getUrlParam('tableCode') || 'TECH_ABILITY_DATA',
            referenceId: getUrlParam('id') || getVal(d, 'id') || '',
            title: JSON.stringify(titleObj),
            details: ''
          })
        }

        // 使用翻转卡片弹窗，等DOM就绪后再更新内容并显示
        waitForElement('govGetDataModal', function (modal) {
          resetGovGetDataModalLayout(modal)
          var govTitleEl =
            modal.querySelector('#govModalTitle') ||
            modal.querySelector('.flip-card-front h3')
          if (govTitleEl) govTitleEl.textContent = '合作对接说明'
          var govDescEl =
            modal.querySelector('#govModalDesc') ||
            modal.querySelector('.flip-card-front p')
          if (govDescEl) {
            govDescEl.innerHTML =
              '您正在获取的能力已发布在数智北京创新中心，合作对接请联系：' +
              '<div class="contact-block"><span class="contact-item">👨‍🏫 秦启威：18601139697</span><span class="contact-item">👩‍💼 刘甜甜：19801266061</span></div>' +
              '或者进行<span class="dialogBtnClass" id="btnRegister">需求反馈</span>，我们会安排专人与您对接，如需线下参观，请提前<a href="/sthz/cgyy/" class="dialogBtnClass">进行预约</a>。'
          }
          modal.classList.add('is-active')
        })
      })
    }

    // 社会侧数据 - 获取数据（弹窗或跳转）
    var btnSocialGetData = document.getElementById('btn-social-get-data')
    if (btnSocialGetData) {
      btnSocialGetData.addEventListener('click', function (e) {
        e.preventDefault()
        var productUrl = d.product_url || d.url || ''
        if (productUrl) {
          window.open(productUrl, '_blank')
        } else {
          // 使用局部存储设置详情数据
          var titleObj = {}
          var productName = getVal(d, 'product_name') || getVal(d, 'title')
          var industry = getVal(d, 'industry')
          var dataSource = getVal(d, 'data_source')
          if (productName) titleObj['产品名称'] = productName
          if (industry) titleObj['所属行业'] = industry
          if (dataSource) titleObj['数据来源'] = dataSource

          if (window.DemandRegistration) {
            window.DemandRegistration.setDetailData({
              tableCode: getUrlParam('tableCode') || 'SOCIAL_DATA',
              referenceId: getUrlParam('id') || getVal(d, 'id') || '',
              title: JSON.stringify(titleObj),
              details: ''
            })
          }

          var modal = document.getElementById('searchLoginModal')
          if (modal) modal.classList.add('is-active')
        }
      })
    }

    // 应用创新成果 - 寻求合作（使用翻转卡片弹窗）
    var btnCooperation = document.getElementById('btn-cooperation')
    if (btnCooperation) {
      btnCooperation.addEventListener('click', function (e) {
        e.preventDefault()
        // 使用局部存储设置详情数据
        var titleObj = {}
        var projectName = getVal(d, 'project_name') || getVal(d, 'title')
        var industry = getVal(d, 'industry')
        var projectType = getVal(d, 'project_type')
        if (projectName) titleObj['项目名称'] = projectName
        if (industry) titleObj['所属行业'] = industry
        if (projectType) titleObj['项目类型'] = projectType

        if (window.DemandRegistration) {
          window.DemandRegistration.setDetailData({
            tableCode: getUrlParam('tableCode') || 'APP_INNOVATION_DATA',
            referenceId: getUrlParam('id') || getVal(d, 'id') || '',
            title: JSON.stringify(titleObj),
            details: ''
          })
        }

        // 使用翻转卡片弹窗，等DOM就绪后再更新内容并显示
        waitForElement('govGetDataModal', function (modal) {
          resetGovGetDataModalLayout(modal)
          var govTitleEl =
            modal.querySelector('#govModalTitle') ||
            modal.querySelector('.flip-card-front h3')
          if (govTitleEl) govTitleEl.textContent = '合作对接说明'
          var govDescEl =
            modal.querySelector('#govModalDesc') ||
            modal.querySelector('.flip-card-front p')
          if (govDescEl) {
            govDescEl.innerHTML =
              '您正在寻求合作的成果已发布在数智北京创新中心，合作对接请联系：' +
              '<div class="contact-block"><span class="contact-item">👨‍🏫 秦启威：18601139697</span><span class="contact-item">👩‍💼 刘甜甜：19801266061</span></div>' +
              '或者进行<span class="dialogBtnClass" id="btnRegister">需求反馈</span>，我们会安排专人与您对接，如需线下参观，请提前<a href="/sthz/cgyy/" class="dialogBtnClass">进行预约</a>。'
          }
          modal.classList.add('is-active')
        })
      })
    }

    // 入驻项目 - 寻求合作（使用翻转卡片弹窗）
    var btnCooperationSettled = document.getElementById(
      'btn-cooperation-settled'
    )
    if (btnCooperationSettled) {
      btnCooperationSettled.addEventListener('click', function (e) {
        e.preventDefault()
        // 使用局部存储设置详情数据
        var titleObj = {}
        var projectName = getVal(d, 'project_name') || getVal(d, 'title')
        var industry = getVal(d, 'industry')
        var company = getVal(d, 'company_name')
        if (projectName) titleObj['项目名称'] = projectName
        if (industry) titleObj['所属行业'] = industry
        if (company) titleObj['企业名称'] = company

        if (window.DemandRegistration) {
          window.DemandRegistration.setDetailData({
            tableCode: getUrlParam('tableCode') || 'SETTLED_PROJECT_DATA',
            referenceId: getUrlParam('id') || getVal(d, 'id') || '',
            title: JSON.stringify(titleObj),
            details: ''
          })
        }

        // 使用翻转卡片弹窗，等DOM就绪后再更新内容并显示
        waitForElement('govGetDataModal', function (modal) {
          resetGovGetDataModalLayout(modal)
          var govTitleEl =
            modal.querySelector('#govModalTitle') ||
            modal.querySelector('.flip-card-front h3')
          if (govTitleEl) govTitleEl.textContent = '合作对接说明'
          var govDescEl =
            modal.querySelector('#govModalDesc') ||
            modal.querySelector('.flip-card-front p')
          if (govDescEl) {
            govDescEl.innerHTML =
              '如果您希望参与数据创新项目，请联系：' +
              '<div class="contact-block"><span class="contact-item">👨‍🏫 秦启威：18601139697</span><span class="contact-item">👩‍💼 刘甜甜：19801266061</span></div>' +
              '或者进行<span class="dialogBtnClass" id="btnRegister">需求反馈</span>，我们会安排专人与您对接，如需线下参观，请提前<a href="/sthz/cgyy/" class="dialogBtnClass">进行预约</a>。'
          }
          modal.classList.add('is-active')
        })
      })
    }
  }

  function getOuterHeight(el) {
    if (!el) return 0
    var style = window.getComputedStyle(el)
    var marginTop = parseFloat(style.marginTop) || 0
    var marginBottom = parseFloat(style.marginBottom) || 0
    return el.offsetHeight + marginTop + marginBottom
  }

  function resetGovGetDataModalLayout(modal) {
    if (!modal) return
    var modalInner = modal.querySelector('.search-login-modal')
    var flipCard = modal.querySelector('.flip-card')
    if (flipCard) {
      flipCard.classList.remove('flipped')
      flipCard.style.height = ''
    }
    if (modalInner) {
      modalInner.classList.remove('flipped')
      modalInner.style.transition = ''
      modalInner.style.minHeight = ''
      modalInner.style.maxHeight = ''
    }
    modal.style.visibility = ''
    modal.removeAttribute('data-layout-mode')
  }

  function ensureGovGetDataModalLayoutObserver(modal) {
    if (!modal || modal.__layoutObserverBound) return
    modal.__layoutObserverBound = true
    var observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        if (
          mutations[i].attributeName === 'class' &&
          !modal.classList.contains('is-active')
        ) {
          resetGovGetDataModalLayout(modal)
          break
        }
      }
    })
    observer.observe(modal, { attributes: true, attributeFilter: ['class'] })
  }

  function getComponentModalHeight(front) {
    if (!front) return window.innerWidth <= 830 ? 300 : 280
    var titleEl =
      front.querySelector('#govModalTitle') || front.querySelector('h3')
    var descEl =
      front.querySelector('#govModalDesc') || front.querySelector('p')
    var btnsEl = front.querySelector('.modal-btns')
    var minHeight = window.innerWidth <= 830 ? 300 : 280
    var maxHeight = window.innerWidth <= 830 ? 360 : 300
    var totalHeight =
      40 +
      getOuterHeight(titleEl) +
      getOuterHeight(descEl) +
      getOuterHeight(btnsEl)
    if (totalHeight < minHeight) totalHeight = minHeight
    if (totalHeight > maxHeight) totalHeight = maxHeight
    return Math.ceil(totalHeight)
  }

  function applyComponentGovGetDataModalLayout(modal) {
    if (!modal) return
    ensureGovGetDataModalLayoutObserver(modal)
    resetGovGetDataModalLayout(modal)
    modal.style.visibility = 'hidden'
    modal.classList.add('is-active')
    var modalInner = modal.querySelector('.search-login-modal')
    var flipCard = modal.querySelector('.flip-card')
    var front = modal.querySelector('.flip-card-front')
    if (!modalInner || !flipCard || !front) return
    modal.setAttribute('data-layout-mode', 'component')
    modalInner.style.transition = 'none'
    var height = getComponentModalHeight(front)
    modalInner.style.minHeight = height + 'px'
    modalInner.style.maxHeight = height + 'px'
    flipCard.style.height = height + 'px'
    modal.offsetHeight
    modal.style.visibility = ''
  }

  // 等待 DOM 元素可用后执行回调（解决弹窗DOM在脚本之后加载的时序问题）
  function waitForElement(id, callback, maxRetries) {
    maxRetries = maxRetries || 20
    var el = document.getElementById(id)
    if (el) {
      callback(el)
      return
    }
    var retries = 0
    var timer = setInterval(function () {
      retries++
      var el = document.getElementById(id)
      if (el) {
        clearInterval(timer)
        callback(el)
      } else if (retries >= maxRetries) {
        clearInterval(timer)
      }
    }, 50)
  }

  // ==================== 启动 ====================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
