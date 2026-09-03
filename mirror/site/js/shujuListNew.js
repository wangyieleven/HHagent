;(function () {
  // ===== 列表两列布局（响应式间距） =====
  ;(function () {
    var s = document.createElement('style')
    s.textContent =
      '#shujuList{display:grid !important;grid-template-columns:1fr 1fr;gap:16px;align-content:start;}' +
      '#shujuList>li{width:auto !important;margin-top:0 !important;max-height:140px;overflow:hidden;}' +
      '@media(min-width:1600px){#shujuList{gap:24px;}#shujuList>li{padding:4px 4px;}}' +
      '@media(min-width:1920px){#shujuList{gap:32px;}#shujuList>li{padding:6px 8px;}}'
    document.head.appendChild(s)
  })()

  // ===== 状态变量（参考 old shujuListNew.js）=====
  var paginationInstance = null
  var activeDataSource = 'mock' // 'mock'(政府侧) | 'lab' | 'social' | 'gaozhiliang'
  var currentDeptCode = ''
  var currentDeptName = ''
  var currentDomainName = ''
  var currentDataSubject = ''
  var currentGovFilterTab = 'domain' // domain | subject | dept
  var currentTopicFilterTab = 'lab' // lab | gaozhiliang
  var currentLabCatalogId = ''
  var currentLabCatalogName = ''
  var labRootNode = null
  var labRootCatalogId = ''
  var currentGovPage = 1
  var currentLabPage = 1
  var pageSize = 18
  var socialDataActive = false
  var socialIndustryCache = null // { list: [...], map: {...}, total: number }
  var searchKeyword = ''
  // 高质量数据集相关变量
  var gaozhiliangDataActive = false
  var gaozhiliangIndustryCache = null // { list: [...], map: {...} }
  var gaozhiliangData = [] // 高质量数据集数据
  var currentGaozhiliangIndustry = '' // 当前选中的高质量数据集行业（局部变量）
  // 各数据源标题搜索字段映射（likeParams）
  var searchFieldMap = {
    gov: 'data_name',
    lab: 'data_name',
    social: 'product_name',
    gaozhiliang: 'product_name'
  }

  var deptTreeData = [
    {
      deptCode: 'AA',
      deptName: '北京市发展和改革委员会',
      count: 432
    },
    {
      deptCode: 'AK',
      deptName: '北京市人力资源和社会保障局',
      count: 678
    },
    {
      deptCode: 'AQ',
      deptName: '北京市交通委员会',
      count: 583
    },
    {
      deptCode: 'AB',
      deptName: '北京市教育委员会',
      count: 566
    },
    {
      deptCode: 'AV',
      deptName: '北京市卫生健康委员会',
      count: 101
    },
    {
      deptCode: 'AL',
      deptName: '北京市规划和自然资源委员会',
      count: 471
    },
    {
      deptCode: 'AJ',
      deptName: '北京市财政局',
      count: 417
    },
    {
      deptCode: 'AN',
      deptName: '北京市住房和城乡建设委员会',
      count: 411
    },
    {
      deptCode: 'BM',
      deptName: '北京市政务服务和数据管理局',
      count: 401
    },
    {
      deptCode: 'BH',
      deptName: '北京市园林绿化局',
      count: 396
    },
    {
      deptCode: 'AS',
      deptName: '北京市农业农村局',
      count: 375
    },
    {
      deptCode: 'AY',
      deptName: '北京市市场监督管理局',
      count: 356
    },
    {
      deptCode: 'BG',
      deptName: '北京市统计局',
      count: 345
    },
    {
      deptCode: 'AU',
      deptName: '北京市文化和旅游局',
      count: 343
    },
    {
      deptCode: 'BE',
      deptName: '北京市文物局',
      count: 341
    },
    {
      deptCode: 'AR',
      deptName: '北京市水务局',
      count: 328
    },
    {
      deptCode: 'AX',
      deptName: '北京市应急管理局',
      count: 325
    },
    {
      deptCode: 'AG',
      deptName: '北京市民政局',
      count: 315
    },
    {
      deptCode: 'AP',
      deptName: '北京市城市管理委员会',
      count: 278
    },
    {
      deptCode: 'AM',
      deptName: '北京市生态环境局',
      count: 278
    },
    {
      deptCode: 'AD',
      deptName: '北京市经济和信息化局',
      count: 259
    },
    {
      deptCode: 'AH',
      deptName: '北京市司法局',
      count: 221
    },
    {
      deptCode: 'AC',
      deptName: '北京市科学技术委员会、中关村科技园区管理委员会',
      count: 201
    },
    {
      deptCode: 'CH',
      deptName: '北京市药品监督管理局',
      count: 192
    },
    {
      deptCode: 'BF',
      deptName: '北京市体育局',
      count: 189
    },
    {
      deptCode: 'BJ',
      deptName: '中共北京市委金融委员会办公室',
      count: 166
    },
    {
      deptCode: 'AT',
      deptName: '北京市商务局',
      count: 157
    },
    {
      deptCode: 'BU',
      deptName: '北京市城市管理综合行政执法局',
      count: 130
    },
    {
      deptCode: 'BD',
      deptName: '北京市广播电视局',
      count: 130
    },
    {
      deptCode: 'BN',
      deptName: '北京市知识产权局',
      count: 129
    },
    {
      deptCode: 'BP',
      deptName: '北京市医疗保障局',
      count: 128
    },
    {
      deptCode: 'DF',
      deptName: '北京市科学技术协会',
      count: 121
    },
    {
      deptCode: 'BC',
      deptName: '北京市人民政府国有资产监督管理委员会',
      count: 118
    },
    {
      deptCode: 'AW',
      deptName: '北京市退役军人事务局',
      count: 113
    },
    {
      deptCode: 'CE',
      deptName: '北京市总工会',
      count: 104
    },
    {
      deptCode: 'CG',
      deptName: '北京市残疾人联合会',
      count: 101
    },
    {
      deptCode: 'BK',
      deptName: '北京市国防动员办公室',
      count: 68
    },
    {
      deptCode: 'BT',
      deptName: '北京市粮食和物资储备局',
      count: 62
    },
    {
      deptCode: 'BV',
      deptName: '北京市文化市场综合执法总队',
      count: 57
    },
    {
      deptCode: 'BY',
      deptName: '北京市公园管理中心',
      count: 41
    },
    {
      deptCode: 'CF',
      deptName: '北京市妇女联合会',
      count: 38
    },
    {
      deptCode: 'CQ',
      deptName: '北京市投资促进服务中心',
      count: 36
    },
    {
      deptCode: 'CA',
      deptName: '北京住房公积金管理中心',
      count: 33
    },
    {
      deptCode: 'AE',
      deptName: '北京市民族宗教事务委员会',
      count: 28
    },
    {
      deptCode: 'AF',
      deptName: '北京市公安局',
      count: 23
    },
    {
      deptCode: 'BB',
      deptName: '北京市人民政府外事办公室',
      count: 21
    },
    {
      deptCode: 'BW',
      deptName: '北京市重大项目建设指挥部办公室',
      count: 17
    },
    {
      deptCode: 'BR',
      deptName: '北京市重点站区管委会',
      count: 13
    },
    {
      deptCode: 'CR',
      deptName: '北京市人民政府天安门地区管理委员会',
      count: 11
    },
    {
      deptCode: 'BL',
      deptName: '北京市信访办公室',
      count: 6
    },
    {
      deptCode: 'DX',
      deptName: '北京市工商业联合会',
      count: 3
    },
    {
      deptCode: 'DB',
      deptName: '北京市农林科学院',
      count: 2
    },
    {
      deptCode: 'DC',
      deptName: '北京市科学技术研究院',
      count: 1
    }
  ]
  // 部门树数据 & 卡片数据（由页面内联脚本提供，降级到 SidebarMock）
  var cardListData = window.cardListData || []

  // ===== 工具函数 =====
  function safeText(v) {
    return v == null ? '' : String(v)
  }

  function escapeHtml(s) {
    return safeText(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  function normalizeServiceType(value) {
    var text = safeText(value).trim()
    return text || 'DATA'
  }

  function normalizeOpenValue(value) {
    var text = safeText(value).trim()
    return text === '0' ? '否' : text === '1' ? '是' : text || ''
  }

  function normalizePage(value, fallback) {
    var num = Number(value)
    if (!isFinite(num) || num < 1) return fallback || 1
    return Math.floor(num)
  }

  function toIdStr(value) {
    return value == null ? '' : String(value)
  }

  function getCountValue(node) {
    return Number(node && node.resourceCount) || 0
  }

  // ===== 浏览器/设备兼容处理 =====
  function applyBrowserCompat() {
    // 1. 修复 100vh 在不同浏览器/设备上的差异（笔记本地址栏、工具栏高度不同）
    //    使用 JS 动态计算真实视口高度，替换 CSS 中的 calc(100vh - 308px)
    function setViewportCompat() {
      var vh = window.innerHeight
      var root = document.documentElement
      root.style.setProperty('--vh', vh + 'px')

      // 动态计算左侧栏高度
      var leftEl = document.querySelector('.resource-left')
      if (leftEl) {
        // 获取 header + footer + 标题等固定元素的高度
        var header = document.querySelector('.header, #header, .hdSyn')
        var footer = document.querySelector('.footer, #footer')
        var mainTitle = document.querySelector('.main-title')
        var headerH = header ? header.offsetHeight : 80
        var footerH = footer ? footer.offsetHeight : 100
        var titleH = mainTitle ? mainTitle.offsetHeight + 30 : 60 // 含 margin
        var containerMargin = 20 // main-content margin-top + gap
        var fixedH = headerH + footerH + titleH + containerMargin
        var leftH = vh - fixedH
        if (leftH < 500) leftH = 500 // 最小高度保护
        leftEl.style.height = leftH + 'px'
      }

      // 动态计算列表区域最小高度
      var listUl = document.getElementById('shujuList')
      if (listUl) {
        var header2 = document.querySelector('.header, #header, .hdSyn')
        var footer2 = document.querySelector('.footer, #footer')
        var headerH2 = header2 ? header2.offsetHeight : 80
        var footerH2 = footer2 ? footer2.offsetHeight : 100
        var otherH = headerH2 + footerH2 + 160 // 标题+搜索栏+分页等
        var minH = vh - otherH
        if (minH < 300) minH = 300
        listUl.style.minHeight = minH + 'px'
      }

      // 重新计算手风琴展开区域高度
      recalcAccordionHeight()
    }

    setViewportCompat()
    window.addEventListener('resize', function () {
      setViewportCompat()
      // 重新调整手风琴展开区域高度
      recalcAccordionHeight()
    })

    // 2. 检测并修复 flexbox gap 兼容性
    var testFlex = document.createElement('div')
    testFlex.style.cssText = 'display:flex;gap:1px;'
    document.body.appendChild(testFlex)
    var hasFlexGap = testFlex.gap === '1px' || (window.getComputedStyle && window.getComputedStyle(testFlex).gap === '1px')
    document.body.removeChild(testFlex)
    if (!hasFlexGap) {
      var gapStyle = document.createElement('style')
      gapStyle.id = 'flex-gap-polyfill'
      gapStyle.textContent =
        '.main-content{gap:0;}.main-content>.resource-left{margin-right:20px;}' +
        '.resource-title{gap:0;}.resource-title>*+*{margin-left:12px;}' +
        '.resource-meta{gap:0;}.resource-meta>*+*{margin-left:16px;}' +
        '.resource-actions{gap:0;}' +
        '#dataSearchBar{gap:0;}#dataSearchBar>*+*{margin-left:8px;}' +
        '.gov-filter-tabs{gap:0;}.gov-filter-tabs>*+*{margin-left:6px;}' +
                '.topic-filter-tabs{gap:0;}.topic-filter-tabs>*+*{margin-left:6px;}' +
        '.social-tag-list{gap:0;}.social-tag-list>*+*{margin:2px;}' +
        '.social-search-box{gap:0;}.social-search-box>*+*{margin-left:6px;}'
      document.head.appendChild(gapStyle)
    }

    // 3. 检测 Windows 高 DPI 缩放，修复可能的布局偏移
    var dpr = window.devicePixelRatio || 1
    if (dpr > 1) {
      // 高 DPI 下确保字体不会因缩放导致溢出
      var dpiStyle = document.createElement('style')
      dpiStyle.id = 'dpi-compat'
      dpiStyle.textContent =
        '.left-list ul li{box-sizing:border-box;max-width:100%;}' +
        '.gov-filter-tab{box-sizing:border-box;}' +
                '.topic-filter-tab{box-sizing:border-box;}' +
        '.social-ind-item,.gaozhiliang-ind-item{box-sizing:border-box;max-width:100%;}' +
        '.resource-title-text{max-width:calc(100% - 40px);}'
      document.head.appendChild(dpiStyle)
    }
  }

  // 重新计算手风琴展开区域高度
  function recalcAccordionHeight() {
    var left = document.querySelector('.resource-left')
    if (!left) return
    var titles = left.querySelectorAll('h6')
    if (!titles || !titles.length) return

    var leftH = left.offsetHeight
    // 计算所有可见 h5/h6 标题占用的总高度
    var titlesH = 0
    var allH5 = left.querySelectorAll('h5')
    for (var i = 0; i < allH5.length; i++) {
      if (allH5[i].offsetParent !== null) titlesH += allH5[i].offsetHeight
    }
    for (var j = 0; j < titles.length; j++) {
      if (titles[j].offsetParent !== null) titlesH += titles[j].offsetHeight + 20 // 含 margin-top
    }

    // 计算展开面板的可用高度（侧栏总高 - 所有标题高度 - 边距保护）
    var availableH = leftH - titlesH - 20
    if (availableH < 150) availableH = 150

    // 设置展开面板的最大高度，同时清除收起面板的 maxHeight
    var allPanels = left.querySelectorAll('.left-list')
    for (var m = 0; m < allPanels.length; m++) {
      var panel = allPanels[m]
      if (panel.classList.contains('is-expanded')) {
        panel.style.maxHeight = availableH + 'px'
        panel.style.overflow = 'auto'
      } else {
        panel.style.maxHeight = ''
      }
    }
  }

  // ===== Loading =====
  function showListLoading() {
    var ul = document.getElementById('shujuList')
    if (ul) {
      ul.innerHTML = ''
      ul.classList.add('szzy-list-loading')
    }
  }
  function hideListLoading() {
    var ul = document.getElementById('shujuList')
    if (ul) ul.classList.remove('szzy-list-loading')
  }
  ;(function () {
    var style = document.createElement('style')
    style.textContent =
      '.szzy-list-loading{position:relative;min-height:200px;}' +
      '.szzy-list-loading::after{content:"";position:absolute;left:50%;top:80px;width:36px;height:36px;margin:-18px 0 0 -18px;border:3px solid #e0e0e0;border-top-color:#0252D3;border-radius:50%;animation:szzy-spin .7s linear infinite;}' +
      '@keyframes szzy-spin{to{transform:rotate(360deg)}}'
    document.head.appendChild(style)
  })()

  // ===== 统一 API 请求 =====
  function fetchPageData(
    tableCode,
    pageNum,
    pageSizeVal,
    equalsParams,
    likeParams
  ) {
    return $.ajax({
      url: '/portal/api/common/calling/page',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        tableCode: tableCode,
        pageNum: pageNum || 1,
        pageSize: pageSizeVal || 12,
        equalsParams: equalsParams || {},
        likeParams: likeParams || {}
      })
    })
  }

  // ===== 清除所有侧栏高亮 =====
  function clearAllSidebarActive() {
    var els = document.querySelectorAll(
      '.left-all, .left-lhsys, .left-social, .left-gaozhiliang, .left-list ul li'
    )
    for (var i = 0; i < els.length; i++) els[i].classList.remove('active')
  }

  // ===== 统一渲染所有侧栏 =====
  function renderAllSidebar() {
    renderDeptTree()
    renderLabSection(labRootNode)
    renderSocialAll()
    renderGaozhiliangAll()
    renderTopicTabs()
  }

  // ===== 专题数据 Tab 切换 =====
  function renderTopicTabs() {
    var tabWrap = document.getElementById('topicFilterTabs')
    if (!tabWrap) return

    var root = tabWrap.parentElement
    var tabEls = tabWrap.querySelectorAll('.topic-filter-tab')
    for (var t = 0; t < tabEls.length; t++) {
      ;(function (el) {
        var tab = el.getAttribute('data-tab') || 'lab'
        el.classList.toggle('active', tab === currentTopicFilterTab)
        el.onclick = function () {
          if (tab === currentTopicFilterTab) return
          currentTopicFilterTab = tab
          if (tab === 'lab') {
            switchToGovMode()
            clearSearchInput()
            activeDataSource = 'lab'
            currentLabCatalogId = labRootCatalogId || ''
            currentLabCatalogName = ''
            paginationInstance = null
            renderAllSidebar()
            queryLabList(1)
          } else if (tab === 'gaozhiliang') {
            clearSearchInput()
            currentGaozhiliangIndustry = ''
            switchToGaozhiliangMode()
            loadGaozhiliangList(1)
          }
        }
      })(tabEls[t])
    }

    var panelEls = root.querySelectorAll('.topic-filter-panel')
    for (var p = 0; p < panelEls.length; p++) {
      ;(function (panel) {
        var key = panel.getAttribute('data-panel') || ''
        panel.classList.toggle('active', key === currentTopicFilterTab)
      })(panelEls[p])
    }
  }

  function initSidebarAccordion() {
    var left = document.querySelector('.resource-left')
    if (!left) return

    var titles = left.querySelectorAll('h6')
    if (!titles || !titles.length) return

    var sections = []
    for (var i = 0; i < titles.length; i++) {
      var h6 = titles[i]
      var next = h6.nextElementSibling
      if (!next || !next.classList || !next.classList.contains('left-list')) continue
      sections.push({ title: h6, panel: next })
    }
    if (!sections.length) return

    function setActive(idx) {
      for (var j = 0; j < sections.length; j++) {
        var sec = sections[j]
        var active = j === idx
        sec.title.classList.toggle('is-active', active)
        sec.title.classList.toggle('is-collapsed', !active)
        sec.panel.classList.toggle('is-expanded', active)
        sec.panel.classList.toggle('is-collapsed', !active)
      }
    }

    for (var k = 0; k < sections.length; k++) {
      ;(function (idx) {
        var titleEl = sections[idx].title
        if (titleEl.__accordionBound) return
        titleEl.__accordionBound = true
        titleEl.addEventListener('click', function () {
          setActive(idx)
        })
      })(k)
    }

    setActive(0)
    // 初始化后延迟执行一次高度校准（等待图片等资源加载）
    setTimeout(recalcAccordionHeight, 100)
    setTimeout(recalcAccordionHeight, 500)
  }

  // ================================================================
  // 搜索栏
  // ================================================================
  function renderSearchBar() {
    var listEl = document.querySelector('.resource-list')
    if (!listEl || document.getElementById('dataSearchBar')) return

    var bar = document.createElement('div')
    bar.id = 'dataSearchBar'
    bar.style.cssText =
      'display:flex;align-items:center;margin-bottom:15px;gap:8px;'
    bar.innerHTML =
      '<input type="text" id="dataSearchInput" placeholder="请输入" ' +
      'style="flex:1;height:36px;padding:0 12px;border:1px solid #d0d7de;border-radius:4px;' +
      'font-size:14px;outline:none;box-sizing:border-box;border:1px solid #ff7a25" />' +
      '<button id="dataSearchBtn" style="height:36px;padding:0 20px;background:#ff7a25;color:#fff;' +
      'border:none;border-radius:4px;cursor:pointer;font-size:14px;white-space:nowrap;"><img src="/images/sjml_search.png">搜索</button>'
    listEl.insertBefore(bar, listEl.firstChild)
    //   '<button id="dataSearchReset" style="height:36px;padding:0 12px;background:#f5f5f5;color:#666;' +
    //   'border:1px solid #d0d7de;border-radius:4px;cursor:pointer;font-size:14px;white-space:nowrap;">重置</button>'

    var input = document.getElementById('dataSearchInput')
    var btn = document.getElementById('dataSearchBtn')
    var resetBtn = document.getElementById('dataSearchReset')

    if (btn) btn.addEventListener('click', doSearch)
    if (resetBtn)
      resetBtn.addEventListener('click', function () {
        searchKeyword = ''
        if (input) input.value = ''
        reloadCurrentSource(1)
      })
    // Enter 回车触发搜索
    if (input)
      input.addEventListener('keydown', function (e) {
        if (e.keyCode === 13) doSearch()
      })
    if (input && searchKeyword) input.value = searchKeyword
  }

  function doSearch() {
    var input = document.getElementById('dataSearchInput')
    searchKeyword = input ? (input.value || '').trim() : ''
    reloadCurrentSource(1)
  }

  // 切换目录时清空搜索框
  function clearSearchInput() {
    searchKeyword = ''
    var input = document.getElementById('dataSearchInput')
    if (input) input.value = ''
  }

  function reloadCurrentSource(page) {
    if (gaozhiliangDataActive) loadGaozhiliangList(page)
    else if (socialDataActive) loadSocialList(page)
    else if (activeDataSource === 'lab') queryLabList(page)
    else loadGovList(page)
  }

  // ================================================================
  // 左侧边栏 - 政府侧部门树（参考 old shujuListNew.js renderDeptTree）
  // ================================================================
  function renderDeptTree() {
    var root = document.querySelector('.left-list.list1')
    if (!root) return

    var tabWrap = document.getElementById('govFilterTabs')
    var domainListEl = document.getElementById('govDomainList')
    var subjectListEl = document.getElementById('govSubjectList')
    var deptListEl = document.getElementById('govDeptList')
    var hasTabs = !!(tabWrap && domainListEl && subjectListEl && deptListEl)

    var govActive =
      activeDataSource === 'mock' && !socialDataActive && !gaozhiliangDataActive

    function normalizeStr(v) {
      return safeText(v).trim()
    }

    function getDomainList() {
      var arr = Array.isArray(window.GOV_DOMAIN_LIST) ? window.GOV_DOMAIN_LIST : []
      var seen = {}
      var out = []
      for (var i = 0; i < arr.length; i++) {
        var name = normalizeStr(arr[i] && arr[i].domain_name)
        if (!name || seen[name]) continue
        seen[name] = true
        out.push({
          domain_type: normalizeStr(arr[i] && arr[i].domain_type),
          domain_name: name,
          count: Number(arr[i] && arr[i].count) || 0
        })
      }
      return out
    }

    function getSubjectList() {
      var arr = Array.isArray(window.GOV_DATA_SUBJECT_LIST)
        ? window.GOV_DATA_SUBJECT_LIST
        : []
      var seen = {}
      var out = []
      for (var i = 0; i < arr.length; i++) {
        var name = normalizeStr(arr[i] && arr[i].data_subject)
        if (!name || seen[name]) continue
        seen[name] = true
        out.push({
          data_subject: name,
          count: Number(arr[i] && arr[i].count) || 0
        })
      }
      return out
    }

    function getDeptList() {
      var arr = Array.isArray(window.GOV_DEPT_LIST) ? window.GOV_DEPT_LIST : null
      if (arr && arr.length) return arr
      return deptTreeData
    }

    function resolveCurrentTab() {
      if (currentDeptCode || currentDeptName) return 'dept'
      if (currentDataSubject) return 'subject'
      return 'domain'
    }

    var leftAllEl = root.querySelector('.left-all')
    if (leftAllEl) leftAllEl.style.display = hasTabs ? 'none' : ''

    if (!hasTabs) {
      var listEl = root.querySelector('ul')
      if (!listEl) return
      if (leftAllEl) {
        leftAllEl.textContent = '全部(' + 10659 + ')'
        leftAllEl.classList.toggle(
          'active',
          govActive &&
            !currentDeptCode &&
            !currentDeptName &&
            !currentDomainName &&
            !currentDataSubject
        )
        leftAllEl.onclick = function () {
          switchToGovMode()
          clearSearchInput()
          activeDataSource = 'mock'
          currentDeptCode = ''
          currentDeptName = ''
          currentDomainName = ''
          currentDataSubject = ''
          currentGovFilterTab = 'domain'
          paginationInstance = null
          renderAllSidebar()
          loadGovList(1)
        }
      }
      listEl.innerHTML = ''
      getDeptList().forEach(function (item) {
        var li = document.createElement('li')
        var deptCode = normalizeStr(item.deptCode || item)
        var deptName = normalizeStr(item.deptName || item)
        var count = Number(item.count || 0)
        li.setAttribute('data-dept-code', deptCode)
        li.textContent = deptName + '(' + count + ')'
        li.classList.toggle('active', govActive && currentDeptCode === deptCode)
        li.addEventListener('click', function () {
          switchToGovMode()
          clearSearchInput()
          activeDataSource = 'mock'
          currentDeptCode = deptCode
          currentDeptName = deptName
          currentDomainName = ''
          currentDataSubject = ''
          currentGovFilterTab = 'dept'
          paginationInstance = null
          renderAllSidebar()
          loadGovList(1)
        })
        listEl.appendChild(li)
      })
      return
    }

    var resolvedTab = resolveCurrentTab()
    if (
      (currentDeptCode || currentDeptName || currentDomainName || currentDataSubject) &&
      resolvedTab
    ) {
      currentGovFilterTab = resolvedTab
    } else {
      currentGovFilterTab = currentGovFilterTab || resolvedTab || 'domain'
    }

    var tabEls = tabWrap.querySelectorAll('.gov-filter-tab')
    for (var t = 0; t < tabEls.length; t++) {
      ;(function (el) {
        var tab = normalizeStr(el.getAttribute('data-tab'))
        el.classList.toggle('active', tab === currentGovFilterTab)
        el.onclick = function () {
          switchToGovMode()
          clearSearchInput()
          activeDataSource = 'mock'
          currentGovFilterTab = tab || 'domain'
          currentDeptCode = ''
          currentDeptName = ''
          currentDomainName = ''
          currentDataSubject = ''
          paginationInstance = null
          renderAllSidebar()
          loadGovList(1)
        }
      })(tabEls[t])
    }

    var panelEls = root.querySelectorAll('.gov-filter-panel')
    for (var p = 0; p < panelEls.length; p++) {
      ;(function (panel) {
        var key = normalizeStr(panel.getAttribute('data-panel'))
        panel.classList.toggle('active', key === currentGovFilterTab)
      })(panelEls[p])
    }

    domainListEl.innerHTML = ''
    var domains = getDomainList()
    ;(function () {
      var li = document.createElement('li')
      li.textContent = '全部(' + 10659 + ')'
      li.classList.toggle(
        'active',
        govActive && currentGovFilterTab === 'domain' && !currentDomainName
      )
      li.onclick = function () {
        switchToGovMode()
        clearSearchInput()
        activeDataSource = 'mock'
        currentDomainName = ''
        currentDataSubject = ''
        currentDeptCode = ''
        currentDeptName = ''
        currentGovFilterTab = 'domain'
        paginationInstance = null
        renderAllSidebar()
        loadGovList(1)
      }
      domainListEl.appendChild(li)
    })()
    for (var d = 0; d < domains.length; d++) {
      ;(function (item) {
        var name = normalizeStr(item && item.domain_name)
        var count = Number(item && item.count) || 0
        var li = document.createElement('li')
        li.textContent = name + '(' + count + ')'
        li.classList.toggle('active', govActive && currentDomainName === name)
        li.onclick = function () {
          switchToGovMode()
          clearSearchInput()
          activeDataSource = 'mock'
          currentDomainName = name
          currentDataSubject = ''
          currentDeptCode = ''
          currentDeptName = ''
          currentGovFilterTab = 'domain'
          paginationInstance = null
          renderAllSidebar()
          loadGovList(1)
        }
        domainListEl.appendChild(li)
      })(domains[d])
    }

    subjectListEl.innerHTML = ''
    var subjects = getSubjectList()
    ;(function () {
      var li = document.createElement('li')
      li.textContent = '全部(' + 10659 + ')'
      li.classList.toggle(
        'active',
        govActive && currentGovFilterTab === 'subject' && !currentDataSubject
      )
      li.onclick = function () {
        switchToGovMode()
        clearSearchInput()
        activeDataSource = 'mock'
        currentDataSubject = ''
        currentDomainName = ''
        currentDeptCode = ''
        currentDeptName = ''
        currentGovFilterTab = 'subject'
        paginationInstance = null
        renderAllSidebar()
        loadGovList(1)
      }
      subjectListEl.appendChild(li)
    })()
    for (var s = 0; s < subjects.length; s++) {
      ;(function (item) {
        var name = normalizeStr(item && item.data_subject)
        var count = Number(item && item.count) || 0
        var li = document.createElement('li')
        li.textContent = name + '(' + count + ')'
        li.classList.toggle('active', govActive && currentDataSubject === name)
        li.onclick = function () {
          switchToGovMode()
          clearSearchInput()
          activeDataSource = 'mock'
          currentDataSubject = name
          currentDomainName = ''
          currentDeptCode = ''
          currentDeptName = ''
          currentGovFilterTab = 'subject'
          paginationInstance = null
          renderAllSidebar()
          loadGovList(1)
        }
        subjectListEl.appendChild(li)
      })(subjects[s])
    }

    deptListEl.innerHTML = ''
    ;(function () {
      var li = document.createElement('li')
      li.textContent = '全部(' + 10659 + ')'
      li.classList.toggle(
        'active',
        govActive &&
          currentGovFilterTab === 'dept' &&
          !currentDeptCode &&
          !currentDeptName
      )
      li.onclick = function () {
        switchToGovMode()
        clearSearchInput()
        activeDataSource = 'mock'
        currentDeptCode = ''
        currentDeptName = ''
        currentDomainName = ''
        currentDataSubject = ''
        currentGovFilterTab = 'dept'
        paginationInstance = null
        renderAllSidebar()
        loadGovList(1)
      }
      deptListEl.appendChild(li)
    })()
    getDeptList().forEach(function (item) {
      var deptCode = normalizeStr(item.deptCode || item)
      var deptName = normalizeStr(item.deptName || item)
      var count = Number(item.count || 0)
      var li = document.createElement('li')
      li.setAttribute('data-dept-code', deptCode)
      li.textContent = deptName + '(' + count + ')'
      li.classList.toggle('active', govActive && currentDeptCode === deptCode)
      li.onclick = function () {
        switchToGovMode()
        clearSearchInput()
        activeDataSource = 'mock'
        currentDeptCode = deptCode
        currentDeptName = deptName
        currentDomainName = ''
        currentDataSubject = ''
        currentGovFilterTab = 'dept'
        paginationInstance = null
        renderAllSidebar()
        loadGovList(1)
      }
      deptListEl.appendChild(li)
    })
  }

  // ================================================================
  // 左侧边栏 - 联合实验室（参考 old shujuListNew.js renderLabSection）
  // ================================================================
  function renderLabSection(rootNode) {
    var sectionTitle = document.querySelector('.topic-filter-panel[data-panel="lab"] .left-lhsys')
    var listEl = document.getElementById('labCatalogList')
    if (!sectionTitle) return

    labRootNode = rootNode || labRootNode
    labRootCatalogId = labRootNode
      ? toIdStr(labRootNode.idStr || labRootNode.id)
      : ''

    sectionTitle.innerHTML =
      '<span></span>' +
      (labRootNode && labRootNode.catalogName
        ? labRootNode.catalogName
        : '联合实验室数据') +
      '(' +
      // getCountValue(labRootNode) +
      Number((labRootNode && labRootNode.resourceCount)+18)+
      ')'
    sectionTitle.classList.toggle(
      'active',
      activeDataSource === 'lab' &&
        (!currentLabCatalogId || currentLabCatalogId === labRootCatalogId) &&
        !socialDataActive &&
        !gaozhiliangDataActive
    )
    sectionTitle.onclick = function () {
      switchToGovMode()
      clearSearchInput()
      currentTopicFilterTab = 'lab'
      activeDataSource = 'lab'
      currentLabCatalogId = labRootCatalogId || ''
      currentLabCatalogName = safeText(
        labRootNode && labRootNode.catalogName
      ).trim()
      paginationInstance = null
      renderAllSidebar()
      queryLabList(1)
    }

    if (!listEl) return
    listEl.innerHTML = ''
    var children =
      labRootNode && Array.isArray(labRootNode.childCatalogList)
        ? labRootNode.childCatalogList
        : []
    children.forEach(function (item) {
      var li = document.createElement('li')
      var idStr = toIdStr(item && (item.idStr || item.id))
      li.setAttribute('data-id', idStr)
      li.textContent =
        safeText(item && item.catalogName) + '(' + getCountValue(item) + ')'
      li.classList.toggle(
        'active',
        activeDataSource === 'lab' &&
          currentLabCatalogId === idStr &&
          !socialDataActive &&
          !gaozhiliangDataActive
      )
      li.addEventListener('click', function () {
        switchToGovMode()
        clearSearchInput()
        currentTopicFilterTab = 'lab'
        activeDataSource = 'lab'
        currentLabCatalogId = idStr
        currentLabCatalogName = safeText(item && item.catalogName).trim()
        paginationInstance = null
        renderAllSidebar()
        queryLabList(1)
      })
      listEl.appendChild(li)
    })
  }

  // ================================================================
  // 左侧边栏 - 社会侧（从接口拉取行业统计）
  // ================================================================
  function getSocialTotalCount() {
    if (typeof window._socialTotalCount === 'number' && window._socialTotalCount >= 0)
      return window._socialTotalCount
    if (socialIndustryCache && typeof socialIndustryCache.total === 'number')
      return socialIndustryCache.total
    if (window.SocialData && typeof window.SocialData.getTotalCount === 'function') {
      var n = Number(window.SocialData.getTotalCount())
      return isFinite(n) ? n : 0
    }
    return 0
  }

  function getSocialIndustries() {
    // 缓存已有，直接返回
    if (socialIndustryCache && socialIndustryCache.list && socialIndustryCache.list.length)
      return socialIndustryCache
    // 正在加载中，不重复请求
    if (socialIndustryCache && socialIndustryCache._loading)
      return { list: [], map: {}, total: getSocialTotalCount() }
    // 触发一次接口加载
    loadSocialIndustryTree()
    return { list: [], map: {}, total: getSocialTotalCount() }
  }

  // 从接口拉取社会侧行业统计
  function loadSocialIndustryTree() {
    socialIndustryCache = { _loading: true }
    $.ajax({
      url: '/portal/db-social-data/industryStatistics',
      method: 'GET',
      credentials: 'include'
    })
      .then(function (res) {
        if (!res || !res.isSuccess || !Array.isArray(res.data)) {
          console.warn('[loadSocialIndustryTree] 接口返回异常:', res)
          socialIndustryCache = null
          return
        }
        var list = []
        var map = {}
        var total = 0
        res.data.forEach(function (item) {
          var name = item.goodsIndustry || '未知行业'
          var count = item.count || 0
          list.push(name)
          map[name] = count
          total += count
        })
        socialIndustryCache = { list: list, map: map, total: total }
        renderSocialAll()
      })
      .fail(function (err) {
        console.error('[loadSocialIndustryTree] 请求失败:', err)
        socialIndustryCache = null
      })
  }

  function getCurrentIndustry() {
    return typeof window.currentIndustry === 'string'
      ? window.currentIndustry
      : ''
  }

  function renderSocialAll() {
    var socialEl = document.querySelector('.left-list.list3 .left-social')
    if (!socialEl) {
      console.warn('[renderSocialAll] 未找到 .left-social 元素')
      return
    }
    var totalCount = getSocialTotalCount()
    var currentIndustry = getCurrentIndustry()

    var industries = getSocialIndustries()
    // 用接口返回的第一条数据作为"全部"的文案
    var allName = industries.list[0] || '全部'
    var allCount = industries.map[allName] != null ? industries.map[allName] : totalCount
    socialEl.innerHTML = '<span></span>' + allName + '(' + allCount + ')'
    socialEl.classList.toggle(
      'active',
      socialDataActive && !currentIndustry && !gaozhiliangDataActive
    )
    socialEl.onclick = function () {
      clearSearchInput()
      if (!socialDataActive) {
        switchToSocialMode()
      }
      window.currentIndustry = ''
      loadSocialList(1)
      renderSocialAll()
    }

    // 渲染行业分类列表（跳过第一条"全部"，已在按钮中展示）
    var industryContainer = document.getElementById('socialIndustryList')
    if (!industryContainer) {
      console.warn('[renderSocialAll] 未找到 #socialIndustryList 容器')
      return
    }
    industryContainer.innerHTML = ''
    for (var i = 1; i < industries.list.length; i++) {
      ;(function (name) {
        var div = document.createElement('div')
        div.className =
          'social-ind-item' + (currentIndustry === name ? ' active' : '')
        div.textContent = name + '(' + industries.map[name] + ')'
        div.setAttribute('data-industry', name)
        div.onclick = function () {
          clearSearchInput()
          if (!socialDataActive) {
            switchToSocialMode()
          }
          window.currentIndustry = name
          loadSocialList(1)
          renderSocialAll()
          renderDeptTree()
          renderLabSection(labRootNode)
        }
        industryContainer.appendChild(div)
      })(industries.list[i])
    }
  }

  function switchToSocialMode() {
    socialDataActive = true
    gaozhiliangDataActive = false
    currentGaozhiliangIndustry = ''
    paginationInstance = null
    clearSearchInput()

    // 先初始化 SocialData 数据准备（不调用 init()，避免 renderIndustryList 覆盖侧栏）
    if (window.SocialData) {
      if (!window.SocialData._initialized) {
        // 只调用数据准备函数，渲染由 shujuListNew.js 统一管理
        if (typeof window.SocialData.collectIndustries === 'function') {
          window.SocialData.collectIndustries()
        }
        window.SocialData._initialized = true
      }
    }

    // 由 shujuListNew.js 统一渲染侧栏（保留正确的点击处理器）
    renderSocialAll()
    renderDeptTree()
    renderLabSection(labRootNode)
    renderTopicTabs()
  }

  function switchToGovMode() {
    if (!socialDataActive && !gaozhiliangDataActive) return
    socialDataActive = false
    gaozhiliangDataActive = false
    window.currentIndustry = ''
    currentGaozhiliangIndustry = ''
    clearSearchInput()
    renderSocialAll()
    renderGaozhiliangAll()
    renderTopicTabs()
    paginationInstance = null
  }

  // ================================================================
  // 左侧边栏 - 高质量数据集
  // ================================================================
  function getGaozhiliangIndustries() {
    // 如果缓存已存在，直接返回
    if (gaozhiliangIndustryCache && gaozhiliangIndustryCache.list.length)
      return gaozhiliangIndustryCache

    // 从 gaozhiliangData 直接使用 数量 字段
    var map = {}
    gaozhiliangData.forEach(function (p) {
      var industry = p['行业'] || '未知行业'
      var count = Number(p['数量']) || 0
      map[industry] = count
    })
    var list = Object.keys(map).sort(function (a, b) {
      return map[b] - map[a]
    })

    if (list.length) {
      gaozhiliangIndustryCache = { list: list, map: map }
    }
    return { list: list, map: map }
  }

  function getCurrentGaozhiliangIndustry() {
    return currentGaozhiliangIndustry || ''
  }

  function renderGaozhiliangAll() {
    var gaozhiliangEl = document.querySelector(
      '.topic-filter-panel[data-panel="gaozhiliang"] .left-gaozhiliang'
    )
    if (!gaozhiliangEl) {
      console.warn('[renderGaozhiliangAll] 未找到 .left-gaozhiliang 元素')
      return
    }

    var totalCount = gaozhiliangData.reduce(function (sum, p) {
      return sum + (Number(p['数量']) || 0)
    }, 0)
    var currentIndustry = getCurrentGaozhiliangIndustry()

    // 渲染"全部"按钮
    gaozhiliangEl.innerHTML = '<span></span>全部(' + totalCount + ')'
    gaozhiliangEl.classList.toggle(
      'active',
      gaozhiliangDataActive && !currentIndustry
    )
    gaozhiliangEl.onclick = function () {
      clearSearchInput()
      currentTopicFilterTab = 'gaozhiliang'
      if (!gaozhiliangDataActive) {
        switchToGaozhiliangMode()
      }
      currentGaozhiliangIndustry = ''
      loadGaozhiliangList(1)
      renderGaozhiliangAll()
    }

    // 渲染行业分类列表
    var industryContainer = document.getElementById('gaozhiliangIndustryList')
    if (!industryContainer) {
      console.warn(
        '[renderGaozhiliangAll] 未找到 #gaozhiliangIndustryList 容器'
      )
      return
    }
    var industries = getGaozhiliangIndustries()
    industryContainer.innerHTML = ''
    industries.list.forEach(function (name) {
      var div = document.createElement('div')
      div.className =
        'gaozhiliang-ind-item' + (currentIndustry === name ? ' active' : '')
      div.textContent = name + '(' + industries.map[name] + ')'
      div.setAttribute('data-industry', name)
      div.onclick = function () {
        clearSearchInput()
        currentTopicFilterTab = 'gaozhiliang'
        if (!gaozhiliangDataActive) {
          switchToGaozhiliangMode()
        }
        currentGaozhiliangIndustry = name
        loadGaozhiliangList(1)
        renderGaozhiliangAll()
        renderDeptTree()
        renderLabSection(labRootNode)
      }
      industryContainer.appendChild(div)
    })
  }

  function switchToGaozhiliangMode() {
    gaozhiliangDataActive = true
    activeDataSource = 'gaozhiliang' // 确保activeDataSource也设置为gaozhiliang
    socialDataActive = false
    paginationInstance = null
    clearSearchInput()

    // 渲染侧栏
    renderGaozhiliangAll()
    renderSocialAll()
    renderDeptTree()
    renderLabSection(labRootNode)
    renderTopicTabs()
  }

  // ================================================================
  // 数据查询 - 高质量数据集（使用统一接口）
  // ================================================================
  function loadGaozhiliangList(page) {
    activeDataSource = 'gaozhiliang'
    var gaozhiliangPage = normalizePage(page, 1)

    // 构建查询参数（和其他数据源格式一致）
    var equalsParams = {}
    var currentIndustry = getCurrentGaozhiliangIndustry()
    if (currentIndustry) {
      equalsParams.industry = currentIndustry
    }

    var likeParams = {}
    if (searchKeyword) {
      likeParams.product_name = searchKeyword
    }

    showListLoading()
    fetchPageData(
      'HIGH_QUALITY_DATASET',
      gaozhiliangPage,
      pageSize,
      equalsParams,
      likeParams
    )
      .then(function (response) {
        hideListLoading()
        var data = (response && response.data) || {}
        var records = Array.isArray(data.records) ? data.records : []

        // 渲染卡片
        renderGaozhiliangCards(records)

        // 使用通用分页函数
        initPagination(data, 'gaozhiliang')
      })
      .fail(function (err) {
        hideListLoading()
        console.error('加载高质量数据集失败:', err)
        // 如果接口调用失败，显示空数据
        renderGaozhiliangCards([])
        initPagination({ total: 0 }, 'gaozhiliang')
      })
  }

  function renderGaozhiliangCards(data) {
    var ul = document.getElementById('shujuList')
    if (!ul) return
    ul.innerHTML = ''

    if (!data || !data.length) {
      ul.innerHTML =
        '<li style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">暂无数据</li>'
      return
    }

    data.forEach(function (item) {
      var li = document.createElement('li')
      li.setAttribute('data-record-index', String(ul.children.length))

      var dataUrl = item['data_url'] || item['product_url'] || item['url'] || ''
      li.onclick = function () {
        if (dataUrl) window.open(dataUrl, '_blank')
      }

      var title = document.createElement('div')
      title.className = 'resource-title'
      title.innerHTML =
        '<div class="resource-title-text">' +
        '<span class="icon"><img src="/images/szml_icon.png" alt=""></span>' +
        escapeHtml(item['product_name'] || '') +
        '</div>'
      li.appendChild(title)

      var meta = document.createElement('div')
      meta.className = 'resource-meta'
      var introRaw = safeText(item['detail_desc_plain'] || item['产品简介'] || '').trim()
      var intro = introRaw
      if (intro.length > 80) intro = intro.substring(0, 80) + '...'
      meta.innerHTML =
        '<span class="meta-item ">行业：' +
        escapeHtml(safeText(item['industry'] || '').trim() || '--') +
        '</span>'
        //  +
        // '<span class="meta-item meta-desc" title="' +
        // escapeHtml(introRaw || '') +
        // '">简介：' +
        // escapeHtml(intro || '--') +
        // '</span>'
      li.appendChild(meta)

      ul.appendChild(li)
    })

    mountFavoriteStars(ul, data, 'HIGH_QUALITY_DATASET')
  }

  // ================================================================
  // 数据查询 - 社会侧（统一 API: SOCIAL_DATA）
  // ================================================================
  function loadSocialList(page) {
    activeDataSource = 'social'
    var socialPage = normalizePage(page, 1)

    var equalsParams = {}
    var currentIndustry = getCurrentIndustry()
    if (currentIndustry) {
      equalsParams.goods_industry = currentIndustry
    }

    var likeParams = {}
    if (searchKeyword) {
      likeParams[searchFieldMap['social']] = searchKeyword
    }

    showListLoading()
    fetchPageData('SOCIAL_DATA', socialPage, pageSize, equalsParams, likeParams)
      .then(function (response) {
        hideListLoading()
        var data = (response && response.data) || {}
        var records = Array.isArray(data.records) ? data.records : []
        renderCards(records, 'social')
        initPagination(data, 'social')
      })
      .fail(function (err) {
        hideListLoading()
        console.error('加载社会侧数据失败:', err)
        renderCards([], 'social')
        initPagination({ total: 0 }, 'social')
      })
  }

  // ===== 初始化联合实验室树（通过 apiService.getStatCnt）=====
  function normalizeTree(resData) {
    var arr = Array.isArray(resData) ? resData : []
    return arr.map(function (node) {
      return {
        id: node && node.id,
        idStr: toIdStr(node && node.id),
        // catalogName: node && node.catalogName,
        catalogName: '全部',
        resourceCount: node && node.resourceCount,
        childCatalogList: Array.isArray(node && node.childCatalogList)
          ? node.childCatalogList.map(function (child) {
              return {
                id: child && child.id,
                idStr: toIdStr(child && child.id),
                catalogName: child && child.catalogName,
                resourceCount: child && child.resourceCount
              }
            })
          : []
      }
    })
  }

  function getRootById(roots, id) {
    var target = toIdStr(id)
    for (var i = 0; i < roots.length; i++) {
      if (toIdStr(roots[i] && roots[i].id) === target) return roots[i]
    }
    return null
  }

  function getRootByName(roots, keyword) {
    var lowerKw = safeText(keyword).toLowerCase()
    for (var i = 0; i < roots.length; i++) {
      var name = safeText(roots[i] && roots[i].catalogName).toLowerCase()
      if (name.indexOf(lowerKw) !== -1) return roots[i]
    }
    return null
  }

  function findTreeNodeByKeyword(nodes, keywords) {
    var list = Array.isArray(nodes) ? nodes : []
    var kwList = Array.isArray(keywords) ? keywords : [keywords]
    for (var i = 0; i < list.length; i++) {
      var node = list[i]
      var name = safeText(node && node.catalogName).toLowerCase()
      for (var j = 0; j < kwList.length; j++) {
        var kw = safeText(kwList[j]).toLowerCase()
        if (kw && name.indexOf(kw) !== -1) return node
      }
      var child = findTreeNodeByKeyword(node && node.childCatalogList, kwList)
      if (child) return child
    }
    return null
  }

  function initLabSection() {
    if (
      typeof apiService === 'undefined' ||
      !apiService ||
      typeof apiService.getStatCnt !== 'function'
    ) {
      console.warn('apiService.getStatCnt 不可用，跳实验室初始化')
      return
    }
    apiService
      .getStatCnt({ resourceType: 'DATA' })
      .then(function (res) {
        if (!res || !res.success) {
          console.error(
            '获取联合实验室统计数据失败:',
            res && (res.message || res.error)
          )
          return
        }
        res.data[1].childCatalogList = res.data[1].childCatalogList.concat([
            { id: '99999999999988',catalogCode: '99999999999988',catalogName: '数智教育实验室数据',
                resourceCount:8
            },
            {
                id: '99999999999987',catalogCode: '99999999999987',catalogName: '国家人工智能应用中试基地(医疗)·北京',
                resourceCount:9
            },
            {
                id: '99999999999986',catalogCode: '99999999999986',catalogName: '数智消费实验室',
                resourceCount:1
            }
        ])
        var normalized = normalizeTree(res.data)
        var lhsysRoot =
          getRootById(normalized, '99999') ||
          getRootByName(normalized, '联合实验室') ||
          getRootByName(normalized, '联合实验室数据') ||
          findTreeNodeByKeyword(normalized, [
            '联合实验室',
            '联合实验室数据',
            '实验室'
          ])
        renderLabSection(lhsysRoot)
        if (activeDataSource === 'lab') {
          queryLabList(currentLabPage || 1)
        }
      })
      .catch(function (err) {
        console.error('获取联合实验室统计数据失败:', err)
      })
  }

  // ================================================================
  // 数据查询 - 政府侧（统一 API: GOV_DATA）
  // ================================================================
  function loadGovList(page) {
    activeDataSource = 'mock'
    currentGovPage = normalizePage(page, currentGovPage || 1)

    // 如果 deptTreeData 是纯名称数组（无 deptCode），走本地分页
    if (deptTreeData.length && typeof deptTreeData[0] === 'string') {
      loadGovListLocal(currentGovPage)
      return
    }

    var equalsParams = {}
    if (currentDeptName) {
      equalsParams.dept_name = currentDeptName
    }
    if (currentDomainName) {
      equalsParams.domain_name = currentDomainName
    }

    var likeParams = {}
    if (currentDataSubject) {
      likeParams.data_subject = currentDataSubject
    }
    if (searchKeyword) {
      likeParams[searchFieldMap['gov']] = searchKeyword
    }

    showListLoading()
    fetchPageData(
      'GOV_DATA',
      currentGovPage,
      pageSize,
      equalsParams,
      likeParams
    )
      .then(function (response) {
        hideListLoading()
        var data = (response && response.data) || {}
        var records = Array.isArray(data.records) ? data.records : []
        renderCards(records, 'gov')
        initPagination(data, 'gov')
      })
      .fail(function (err) {
        hideListLoading()
        console.error('加载政府侧数据失败:', err)
        renderCards([], 'gov')
        initPagination({ total: 0 }, 'gov')
      })
  }

  // 本地分页降级（当 deptTreeData 是纯名称数组时）
  function loadGovListLocal(page) {
    var filtered = cardListData
    if (currentDeptCode) {
      filtered = cardListData.filter(function (item) {
        return safeText(item.deptCode).trim() === currentDeptCode
      })
    }
    var start = (page - 1) * pageSize
    var pageRecords = filtered.slice(start, start + pageSize)
    hideListLoading()
    renderCards(pageRecords, 'gov')
    renderPagination(filtered.length, page)
  }

  // ================================================================
  // 数据查询 - 联合实验室（统一 API: LAB_DATA）
  // ================================================================
  function queryLabList(page) {
    currentLabPage = normalizePage(page, currentLabPage || 1)
    var likeParams = {}
    if (currentLabCatalogId) {
      likeParams.catalog_id = currentLabCatalogId + ','
    } else if (labRootCatalogId) {
      likeParams.catalog_id = labRootCatalogId + ','
    }
    if (searchKeyword) {
      likeParams[searchFieldMap['lab']] = searchKeyword
    }

    showListLoading()
    fetchPageData('LAB_DATA', currentLabPage, pageSize, {}, likeParams)
      .then(function (response) {
        hideListLoading()
        var data = (response && response.data) || {}
        var records = Array.isArray(data.records) ? data.records : []
        renderCards(records, 'lab')
        initPagination(data, 'lab')
      })
      .fail(function (err) {
        hideListLoading()
        console.error('加载联合实验室数据失败:', err)
        renderCards([], 'lab')
        initPagination({ total: 0 }, 'lab')
      })
  }

  // ================================================================
  // 统一卡片渲染（字段使用 SQL snake_case）
  // ================================================================
  function renderCards(records, source) {
    var ul = document.getElementById('shujuList')
    if (!ul) return
    if (!records.length) {
      ul.innerHTML =
        '<li style="grid-column:1/-1;text-align:center;padding:40px 0;color:#999;">暂无数据</li>'
      return
    }

    var html = records
      .map(function (item, index) {
        var title = ''
        var metaHtml = ''

        if (source === 'gov') {
          title = item.data_name || '无标题'
          var descRaw =
            safeText(
              item.description ||
                item.sample_data_keyword ||
                item.short_description ||
                ''
            ).trim()
          var desc = descRaw
          if (desc.length > 90) desc = desc.substring(0, 90) + '...'
          metaHtml =
            '' +
            '<span class="meta-item">是否开放：' +
            escapeHtml(normalizeOpenValue(item.is_open) || '--') +
            '</span>' +
            '<span class="meta-item">是否共享：' +
            escapeHtml(safeText(item.is_shared) || '--') +
            '</span>' 
            // +
            // '<span class="meta-item meta-desc" title="' +
            // escapeHtml(descRaw || '') +
            // '">描述：' +
            // escapeHtml(desc || '--') +
            // '</span>'
        } else if (source === 'lab') {
          title = item.data_name || '无标题'
          var labDescRaw = safeText(
            item.description || item.description_plain || item.short_description || ''
          ).trim()
          var labDesc = labDescRaw
          if (labDesc.length > 90) labDesc = labDesc.substring(0, 90) + '...'
          metaHtml =
            '' +
            '<span class="meta-item">服务类型：' +
            escapeHtml(normalizeServiceType(item.service_type) || '--') +
            '</span>'
            //  +
            // '<span class="meta-item meta-desc" title="' +
            // escapeHtml(labDescRaw || '') 
            // +
            // '">描述：' +
            // escapeHtml(labDesc || '--') +
            // '</span>'
        } else {
          title = item.product_name || '无标题'
          var socialType = normalizeServiceType(item.service_type || item.goods_industry || '')
          var socialDescRaw = safeText(
            item.description_plain || item.description || item.short_description || ''
          ).trim()
          var socialDesc = socialDescRaw
          if (socialDesc.length > 90) socialDesc = socialDesc.substring(0, 90) + '...'
          metaHtml =
            '' +
            '<span class="meta-item">服务类型：' +
            escapeHtml(socialType || '--') +
            '</span>'
            //  +
            // '<span class="meta-item meta-desc" title="' +
            // escapeHtml(socialDescRaw || '')
            //  +
            // '">描述：' +
            // escapeHtml(socialDesc || '--') +
            // '</span>'
        }

        return (
          '' +
          '<li data-record-index="' +
          index +
          '">' +
          '<div class="resource-title"><div class="resource-title-text">' +
          '<span class="icon"><img src="/images/szml_icon.png" alt=""></span>' +
          escapeHtml(title) +
          '</div></div>' +
          '<div class="resource-meta">' +
          metaHtml +
          '</div>' +
          '</li>'
        )
      })
      .join('')

    ul.innerHTML = html

    Array.prototype.forEach.call(
      ul.querySelectorAll('li[data-record-index]'),
      function (li) {
        var idx = Number(li.getAttribute('data-record-index'))
        var item = records[idx]
        if (!item) return
        li.addEventListener('click', function () {
          goToDetail(item, source)
        })
      }
    )

    mountFavoriteStars(ul, records, sourceToTableCode[source] || '')
  }

  // source → tableCode 映射
  var sourceToTableCode = {
    gov: 'GOV_DATA',
    lab: 'LAB_DATA',
    social: 'SOCIAL_DATA',
    gaozhiliang: 'GAOZHILIANG_DATA' // 添加高质量数据集的tableCode
  }

  // ===== 详情跳转 =====
  function goToDetail(item, source) {
    var idValue = safeText(item.id || item.data_code || '')
    // 存储详情数据
    var stored = Object.assign({}, item, {
      __source: source
    })
    try {
      sessionStorage.setItem('szzyxq_lastDetail', JSON.stringify(stored))
      localStorage.setItem('szzyxq_lastDetail', JSON.stringify(stored))
    } catch (e) {}

    var params = new URLSearchParams()
    params.set('id', idValue)
    params.set('type', 'DATA')
    params.set('source', source)
    params.set('tableCode', sourceToTableCode[source] || '')
    params.set('fromList', '1')
    params.set('govPage', String(currentGovPage || 1))
    params.set('labPage', String(currentLabPage || 1))
    if (currentDeptCode) params.set('deptCode', currentDeptCode)
    if (currentLabCatalogId) params.set('labCatalogId', currentLabCatalogId)
    if (currentLabCatalogName)
      params.set('labCatalogName', currentLabCatalogName)
    console.log(source, '--')
    if (source == 'social') {
      window.open(item.original_url, '_blank')
    } else {
      window.open('/cxfuww/szzyml/sjml/xqy/?' + params.toString(), '_blank')
    }
  }

  // ===== 分页 =====
  function initPagination(data, source) {
    var wrapper = document.querySelector('.fenye')
    if (!wrapper) return
    var total = Number(data.total) || 0
    if (!total) {
      wrapper.style.display = 'none'
      paginationInstance = null
      return
    }
    wrapper.style.display = 'block'
    var totalPages = Math.max(1, Math.ceil(total / pageSize))
    var currentPage = Number(data.current || data.pageNum) || 1

    if (typeof Pagination !== 'function') {
      console.warn('Pagination 组件未加载')
      return
    }
    if (paginationInstance) {
      try {
        if (typeof paginationInstance.destroy === 'function')
          paginationInstance.destroy()
      } catch (e) {}
      paginationInstance = null
    }
    paginationInstance = new Pagination({
      containerId: 'pagination',
      current: currentPage,
      totalPages: totalPages,
      pageSize: pageSize,
      onPageChange: function (page) {
        if (socialDataActive) loadSocialList(page)
        else if (gaozhiliangDataActive) loadGaozhiliangList(page)
        else if (activeDataSource === 'lab') queryLabList(page)
        else loadGovList(page)
      }
    })
  }

  function renderPagination(total, currentPage) {
    var wrapper = document.querySelector('.fenye')
    if (!wrapper) return
    if (!total) {
      wrapper.style.display = 'none'
      paginationInstance = null
      return
    }
    wrapper.style.display = 'block'
    var totalPages = Math.max(1, Math.ceil(total / pageSize))
    if (typeof Pagination !== 'function') return
    if (!paginationInstance) {
      paginationInstance = new Pagination({
        containerId: 'pagination',
        current: currentPage,
        totalPages: totalPages,
        pageSize: pageSize,
        onPageChange: function (page) {
          if (socialDataActive) loadSocialList(page)
          else if (gaozhiliangDataActive) loadGaozhiliangList(page)
          else if (activeDataSource === 'lab') queryLabList(page)
          else loadGovList(page)
        }
      })
      return
    }
    paginationInstance.currentPage = currentPage
    paginationInstance.totalPages = totalPages
    paginationInstance.render()
  }

  // ===== 初始化 =====
  function init() {
    if (!document.getElementById('shujuList')) return
    applyListStateFromUrl()
    showListLoading()

    // 加载高质量数据集JSON数据
    loadGaozhiliangData()

    // 渲染搜索栏
    renderSearchBar()

    // 渲染侧栏
    renderAllSidebar()
    initSidebarAccordion()

    // 初始化联合实验室树
    initLabSection()

    // 初始化社会侧（从接口拉取行业目录）
    if (window.SocialData) {
      window.SocialData.onIndustryReady = function (payload) {
        if (payload && payload.list && payload.list.length) {
          socialIndustryCache = {
            list: payload.list,
            map: payload.map || {},
            total: Number(payload.total) || getSocialTotalCount()
          }
        }
        renderSocialAll()
      }
      window.SocialData.onIndustryClick = function () {
        socialDataActive = true
        paginationInstance = null
        renderSocialAll()
        renderDeptTree()
        renderLabSection(labRootNode)
      }
      if (typeof window.SocialData.collectIndustries === 'function') {
        window.SocialData.collectIndustries()
      }
    }
    renderSocialAll()

    applyBrowserCompat()

    // 默认加载（若 URL 带状态则恢复）
    if (gaozhiliangDataActive) loadGaozhiliangList(1)
    else if (socialDataActive) loadSocialList(1)
    else if (activeDataSource === 'lab') queryLabList(currentLabPage || 1)
    else loadGovList(currentGovPage || 1)
  }

  function applyListStateFromUrl() {
    try {
      var href = window.location && window.location.href ? window.location.href : ''
      if (href && (href.indexOf('&amp;') >= 0 || href.indexOf('&#38;') >= 0)) {
        var cleanHref = href.replace(/&amp;|&#38;/g, '&')
        if (cleanHref !== href && window.history && window.history.replaceState) {
          window.history.replaceState(null, '', cleanHref)
        }
      }
    } catch (e) {}

    var sp = null
    try {
      var search = window.location && window.location.search ? window.location.search : ''
      search = safeText(search).replace(/&amp;|&#38;/g, '&')
      sp = new URLSearchParams(search)
    } catch (e) {
      sp = null
    }
    if (!sp) return

    var keyword = safeText(sp.get('keyword') || sp.get('amp;keyword')).trim()
    var source = safeText(sp.get('source') || sp.get('amp;source')).trim()
    var deptCode = safeText(sp.get('deptCode') || sp.get('amp;deptCode')).trim()
    var domainName = safeText(sp.get('domain_name') || sp.get('amp;domain_name')).trim()
    var dataSubject = safeText(sp.get('data_subject') || sp.get('amp;data_subject')).trim()
    var deptName = safeText(sp.get('dept_name') || sp.get('amp;dept_name')).trim()
    var labCatalogId = safeText(sp.get('labCatalogId') || sp.get('amp;labCatalogId')).trim()
    var govPageStr = safeText(sp.get('govPage') || sp.get('amp;govPage')).trim()
    var labPageStr = safeText(sp.get('labPage') || sp.get('amp;labPage')).trim()
    var govPageNum = parseInt(govPageStr, 10)
    var labPageNum = parseInt(labPageStr, 10)

    if (keyword) searchKeyword = keyword

    if (govPageStr && isFinite(govPageNum) && govPageNum > 0) currentGovPage = govPageNum
    if (labPageStr && isFinite(labPageNum) && labPageNum > 0) currentLabPage = labPageNum

    if (source === 'social') {
      socialDataActive = true
      gaozhiliangDataActive = false
      activeDataSource = 'social'
      currentDeptCode = ''
      currentDeptName = ''
      currentDomainName = ''
      currentDataSubject = ''
      currentGovFilterTab = 'domain'
      currentLabCatalogId = ''
      currentLabCatalogName = ''
      return
    }
    if (source === 'gaozhiliang') {
      gaozhiliangDataActive = true
      socialDataActive = false
      activeDataSource = 'gaozhiliang'
      currentTopicFilterTab = 'gaozhiliang'
      currentDeptCode = ''
      currentDeptName = ''
      currentDomainName = ''
      currentDataSubject = ''
      currentGovFilterTab = 'domain'
      currentLabCatalogId = ''
      currentLabCatalogName = ''
      return
    }

    if (source === 'lab' || labCatalogId) {
      activeDataSource = 'lab'
      socialDataActive = false
      gaozhiliangDataActive = false
      currentTopicFilterTab = 'lab'
      currentLabCatalogId = labCatalogId || currentLabCatalogId
      currentDeptCode = ''
      currentDeptName = ''
      currentDomainName = ''
      currentDataSubject = ''
      currentGovFilterTab = 'domain'
      return
    }

    if (source === 'mock' || deptCode) {
      activeDataSource = 'mock'
      socialDataActive = false
      gaozhiliangDataActive = false
      currentDeptCode = deptCode || currentDeptCode
      if (deptName) currentDeptName = deptName
      if (currentDeptCode) {
        for (var i = 0; i < deptTreeData.length; i++) {
          var d = deptTreeData[i]
          if (safeText(d.deptCode).trim() === currentDeptCode) {
            currentDeptName = safeText(d.deptName).trim()
            break
          }
        }
      }
      if (domainName) {
        currentDomainName = domainName
        currentDataSubject = ''
        currentDeptCode = ''
        currentDeptName = ''
        currentGovFilterTab = 'domain'
      } else if (dataSubject) {
        currentDataSubject = dataSubject
        currentDomainName = ''
        currentDeptCode = ''
        currentDeptName = ''
        currentGovFilterTab = 'subject'
      } else if (currentDeptCode || currentDeptName) {
        currentDomainName = ''
        currentDataSubject = ''
        currentGovFilterTab = 'dept'
      }
      currentLabCatalogId = ''
      currentLabCatalogName = ''
    }

  }

  function normalizeFavorited(value) {
    if (value === true) return true
    if (value === false) return false
    var s = safeText(value).trim().toLowerCase()
    if (!s) return false
    return s === '1' || s === 'true' || s === 'yes' || s === 'y'
  }

  var __favoriteUserPromise = null
  var __favoriteUserLoggedIn = false
  var __favoriteUserCheckedAt = 0
  var __favoriteInFlightMap = {}
  var __favoriteLastClickAtMap = {}
  var __favoriteDebounceMs = 800

  function fetchCurrentUser(force) {
    var now = Date.now()
    if (!force && __favoriteUserPromise && now - __favoriteUserCheckedAt < 10000)
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
        '.resource-title{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;}' +
        '.resource-title-text{flex:1;min-width:0;display:flex;align-items:center;gap:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
        '.favorite-star{flex:0 0 auto;width:24px;height:24px;border-radius:4px;border:1px solid #FDE6D5;background:rgba(255,255,255,.9);color:#999;display:inline-flex;align-items:center;justify-content:center;font-size:16px;line-height:1;cursor:pointer;padding:0;}' +
        '.resource-title .favorite-star.is-favorited{color:#FF7A25;border-color:#FF7A25;}' +
        '.favorite-star:disabled{opacity:.6;cursor:not-allowed;}' +
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
    var base = 'https://dibj.cn/portal/oauth/login/capcloud'
    var target = buildStatefulUrlForLogin()
    if (!target) target = '/'
    link.setAttribute('href', base + '?targetUrl=' + encodeURIComponent(target))
  }

  function buildStatefulUrlForLogin() {
    try {
      var href = window.location && window.location.href ? window.location.href : '/'
      href = safeText(href).replace(/&amp;|&#38;/g, '&')
      var u = new URL(href)
      u.searchParams.delete('targetUrl')
      u.searchParams.delete('amp;keyword')
      u.searchParams.delete('amp;source')
      u.searchParams.delete('amp;deptCode')
      u.searchParams.delete('amp;labCatalogId')
      u.searchParams.delete('amp;govPage')
      u.searchParams.delete('amp;labPage')
      if (searchKeyword) u.searchParams.set('keyword', searchKeyword)
      var source =
        gaozhiliangDataActive
          ? 'gaozhiliang'
          : socialDataActive
            ? 'social'
            : activeDataSource || 'mock'
      if (source) u.searchParams.set('source', source)
      if (currentGovPage && Number(currentGovPage) > 1)
        u.searchParams.set('govPage', String(currentGovPage))
      if (currentLabPage && Number(currentLabPage) > 1)
        u.searchParams.set('labPage', String(currentLabPage))
      if (currentDeptCode) u.searchParams.set('deptCode', String(currentDeptCode))
      if (currentLabCatalogId)
        u.searchParams.set('labCatalogId', String(currentLabCatalogId))
      return u.toString()
    } catch (e) {
      return (window.location && window.location.href) ? window.location.href : '/'
    }
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

  function getBizUniqueId(rawItem) {
    if (!rawItem) return ''
    return (
      rawItem.bizUniqueId ||
      rawItem.biz_unique_id ||
      rawItem.biz_uniqueId ||
      rawItem.uniqueId ||
      rawItem.unique_id ||
      rawItem.productId ||
      rawItem.product_id ||
      rawItem.data_code ||
      rawItem.code ||
      rawItem.id ||
      ''
    )
  }

  function setFavoriteButtonState(btn, favorited) {
    if (!btn) return
    var v = !!favorited
    btn.classList.toggle('is-favorited', v)
    btn.textContent = v ? '★' : '☆'
    btn.setAttribute('aria-label', v ? '取消收藏' : '收藏')
  }

  function toggleFavorite(tableCode, bizUniqueId, btn) {
    if (!tableCode || !bizUniqueId) {
      alert('缺少收藏标识，无法收藏')
      return
    }
    var requestKey = safeText(tableCode) + '::' + safeText(bizUniqueId)
    var now = Date.now()
    var lastAt = __favoriteLastClickAtMap[requestKey] || 0
    if (__favoriteInFlightMap[requestKey] || now - lastAt < __favoriteDebounceMs)
      return
    __favoriteLastClickAtMap[requestKey] = now

    fetchCurrentUser(true).then(function (loggedIn) {
      if (!loggedIn) {
        updateFavoriteLoginLink()
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

  function mountFavoriteStars(ul, records, tableCode) {
    if (!ul || !records || !records.length || !tableCode) return
    ensureFavoriteAssets()
    bindFavoriteLoginModal()

    var children = ul.children
    for (var i = 0; i < children.length; i++) {
      var li = children[i]
      if (!li || li.nodeType !== 1) continue
      var titleEl = li.querySelector && li.querySelector('.resource-title')
      if (!titleEl) continue
      if (titleEl.querySelector && titleEl.querySelector('.favorite-star')) continue

      var idx = i
      var card = li.querySelector && li.querySelector('.resource-card[data-record-index]')
      if (card) {
        var n = Number(card.getAttribute('data-record-index'))
        if (isFinite(n) && n >= 0) idx = n
      }
      var item = records[idx] || records[i]
      if (!item) continue

      var bizUniqueId = getBizUniqueId(item)
      var favoritedFromList = normalizeFavorited(item && item.favorited)

      var btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'favorite-star'
      btn.setAttribute('aria-label', '收藏')
      btn.textContent = '☆'
      if (!bizUniqueId) btn.disabled = true

      ;(function (bizId, btnEl) {
        btnEl.addEventListener('click', function (e) {
          e.preventDefault()
          e.stopPropagation()
          toggleFavorite(tableCode, bizId, btnEl)
        })
      })(bizUniqueId, btn)

      setFavoriteButtonState(btn, favoritedFromList)
      titleEl.appendChild(btn)
    }
  }

  // 高质量数据集行业统计（从JSON提取）
  var gaozhiliangData = [
    { 行业: '教育', 数量: 3 },
    { 行业: '信息传输、软件和信息技术服务业', 数量: 268 },
    { 行业: '交通运输、仓储和邮政业', 数量: 13 },
    { 行业: '科学研究和技术服务业', 数量: 24 },
    { 行业: '卫生和社会工作', 数量: 15 },
    { 行业: '电力、热力、燃气及水生产及供应商', 数量: 5 },
    { 行业: '制造业', 数量: 7 },
    { 行业: '租赁和商务服务业', 数量: 5 },
    { 行业: '采矿业', 数量: 3 },
    { 行业: '建筑业', 数量: 3 },
    { 行业: '房地产业', 数量: 7 },
    { 行业: '金融业', 数量: 9 },
    { 行业: '居民服务、修理和其他服务业', 数量: 1 },
    { 行业: '文化、体育和娱乐业', 数量: 1 }
  ]

  // 加载高质量数据集
  function loadGaozhiliangData() {
    renderGaozhiliangAll()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
