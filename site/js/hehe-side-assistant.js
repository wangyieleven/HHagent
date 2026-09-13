/* Mobile-first companion drawer for the Hehe assistant. Local prototype only. */
(function () {
  'use strict';

  var source = new URL(document.currentScript.src, window.location.href);
  var base = new URL('../', source);
  var stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = new URL('css/hehe-side-assistant.css', base).href + source.search;
  document.head.appendChild(stylesheet);

  var OFFICIAL = {
    catalog: 'https://dibj.cn/cxfuww/szzyml/sjml/',
    scene: 'https://dibj.cn/fzpt/cjyz/jbz/',
    visit: 'https://dibj.cn/sthz/cgyy/',
    policy: 'https://dibj.cn/zcjdww/'
  };
  var RESOURCE_FALLBACKS = [
    { id: '4792', data_name: '公交站点信息（出行服务）', dept_name: '北京市交通委员会', domain_name: '交通运输', is_open: '是', is_shared: '无条件共享', data_time: '2023-11-01 00:00:00', data_url: 'http://data.beijing.gov.cn/zyml/ajg/sjtw/17453.htm' },
    { id: '4600', data_name: '轨道线路信息（出行）', dept_name: '北京市交通委员会', domain_name: '交通运输', is_open: '是', is_shared: '无条件共享', data_time: '2023-11-01 00:00:00', data_url: 'http://data.beijing.gov.cn/zyml/ajg/sjtw/17455.htm' },
    { id: '5143', data_name: '道路运输市场从业人员诚信考核数据', dept_name: '北京市交通委员会', domain_name: '交通运输', is_open: '是', is_shared: '有条件共享', data_time: '2023-01-15 13:01:06', data_url: 'http://data.beijing.gov.cn/zyml/ajg/sjtw/76e025908db14ef49935f709bc7e2e5c.htm' }
  ];
  var SCENE_FALLBACKS = [
    { id: '191', scene_name: '“两客一危一重”跨区域联合监管场景', data_time: '2026-08-13 00:00:00', scene_innovation_demand: '融合多源交通数据，实现运行状态监测、异常预警和跨区域协同监管。' },
    { id: '190', scene_name: '出租网约跨区域联合监管场景', data_time: '2026-08-13 00:00:00', scene_innovation_demand: '依托卫星定位与 OD 路径分析，开展出租车与网约车协同监测。' },
    { id: '189', scene_name: '国省干线事件协同处置场景', data_time: '2026-08-13 00:00:00', scene_innovation_demand: '融合高速路况、ETC 等数据，提升跨域路网协同处置能力。' }
  ];
  var QUESTIONS = [
    {
      label: '了解平台', icon: 'message-3-fill',
      batches: [
        ['创新中心主要提供哪些服务？', '在这里能找到哪些创新资源？', '有哪些创新成果可以参考？'],
        ['创新中心面向哪些创新主体？', '场景创新和政府采购是一回事吗？', '如何找到适合企业的服务入口？'],
        ['如何申请入驻创新中心？', '可以获得哪些生态合作支持？', '平台中的法人和个人权限有什么区别？']
      ]
    },
    {
      label: '查找数据', icon: 'database-2-fill',
      batches: [
        ['市交通委有哪些开放数据目录？', '交通运输领域的数据来自哪些部门？', '公交站点和轨道线路目录有什么不同？'],
        ['有哪些公交客流相关数据？', '只看无条件共享的数据目录。', '目录可见是否代表可以直接下载？'],
        ['有哪些开放数据可以用于出行分析？', '如何比较两个数据目录？', '按部门和开放标识筛选数据。']
      ]
    },
    {
      label: '办理指引', icon: 'clipboard-fill',
      batches: [
        ['想参加场景揭榜，要怎么申报？', '帮我准备一份需求反馈。', '我们单位想预约参观创新中心。'],
        ['能否以联合体形式参与场景揭榜？', '场景申报需要准备哪些材料？', '数据创新项目如何开始准备？'],
        ['如何查看我的办理进度？', '想提供组件，需要准备什么？', '如何申请加入创新伙伴？']
      ]
    }
  ];
  var SERVICE_GROUPS = [
    { title: '我要了解', items: [
      ['创新服务', '了解平台服务内容', 'message-3-fill', 'blue', function () { openChat('创新中心主要提供哪些服务？'); }],
      ['数据资源', '查找各类数据资源', 'database-2-fill', 'blue', showDataResults],
      ['创新成果', '查看创新成果案例', 'lightbulb-flash-fill', 'blue', function () { openChat('有哪些创新成果可以参考？'); }],
      ['入驻指南', '了解入驻流程指引', 'clipboard-fill', 'blue', function () { openChat('如何申请入驻创新中心？'); }]
    ]},
    { title: '我要办理', items: [
      ['场景揭榜', '参与应用场景征集', 'flag-2-fill', 'orange', showScenes],
      ['数据项目', '准备数据创新项目', 'database-fill', 'purple', function () { openChat('如何申请公共数据进行数据创新？'); }],
      ['预约参观', '预约线下参观交流', 'calendar-check-fill', 'purple', showBooking],
      ['需求反馈', '提交问题与建议', 'chat-check-fill', 'blue', startFeedback]
    ]},
    { title: '生态合作', items: [
      ['提供数据', '共享数据资源', 'database-fill', 'green', function () { startContribution('提供数据'); }],
      ['提供组件', '贡献能力组件', 'puzzle-fill', 'blue', function () { startContribution('提供组件'); }],
      ['加入伙伴', '共建创新生态', 'team-fill', 'blue', function () { openChat('如何申请加入创新伙伴？'); }],
      ['联系专家', '对接专家资源', 'user-star-fill', 'orange', function () { openChat('如何联系创新中心专家？'); }]
    ]}
  ];

  var state = {
    view: 'home',
    previousView: 'home',
    homeTab: 0,
    homeBatches: [0, 0, 0],
    sheet: null,
    resources: RESOURCE_FALLBACKS.slice(),
    scenes: SCENE_FALLBACKS.slice(),
    resource: RESOURCE_FALLBACKS[0],
    compare: [RESOURCE_FALLBACKS[0], RESOURCE_FALLBACKS[1]],
    filters: { department: '北京市交通委员会', domains: ['交通运输'], open: '是', shared: '无条件共享' },
    sceneTab: '全部',
    sceneQuery: '',
    scene: SCENE_FALLBACKS[0],
    selectedDate: 18,
    selectedSlot: '10:00—11:00',
    bookingStep: 2,
    draft: null,
    records: [],
    recordTab: '进行中',
    feedback: { company: '', contact: '', phone: '', detail: '' }
  };
  var panel;
  var app;
  var content;
  var toastTimer;

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function icon(name, cls) {
    return el('i', 'ri-' + name + (cls ? ' ' + cls : ''));
  }
  function button(label, cls, fn, iconName) {
    var node = el('button', cls || '', label || '');
    node.type = 'button';
    if (iconName) node.prepend(icon(iconName));
    if (fn) node.addEventListener('click', fn);
    return node;
  }
  function image(path, cls, alt) {
    var node = el('img', cls || '');
    node.src = new URL(path, base).href;
    node.alt = alt || '';
    return node;
  }
  function formatDate(value) {
    var d = new Date(value);
    if (Number.isNaN(d.getTime())) return value || '待核对';
    return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }
  function toast(text) {
    var old = app.querySelector('.hsm-toast');
    if (old) old.remove();
    var node = el('div', 'hsm-toast', text);
    node.setAttribute('role', 'status');
    app.append(node);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { node.remove(); }, 3200);
  }
  function setView(view) {
    state.previousView = state.view;
    state.view = view;
    state.sheet = null;
    render();
  }
  function goBack() {
    var map = { 'data-detail': 'data-results', compare: 'data-detail', 'scene-detail': 'scenes', booking: 'home', records: 'home', feedback: 'home', chat: 'home', 'data-results': 'home', scenes: 'home' };
    setView(map[state.view] || 'home');
  }
  function freshChat() {
    state.view = 'home';
    state.sheet = null;
    render();
  }
  function header(title, back) {
    var head = el('header', 'hsm-header');
    if (back) {
      var left = button('', 'hsm-header-icon', goBack, 'arrow-left-s-line');
      left.setAttribute('aria-label', '返回');
      head.append(left);
    } else {
      var menu = button('', 'hsm-header-icon', function () { state.sheet = 'menu'; renderSheet(); }, 'menu-line');
      menu.setAttribute('aria-label', '打开菜单');
      head.append(menu);
    }
    var brand = el('button', 'hsm-header-title', title || '合合助手');
    brand.type = 'button';
    brand.addEventListener('click', function () { setView('home'); });
    if (state.view !== 'home' && !back) brand.prepend(image('images/assistant-mascot.png', 'hsm-header-mascot', ''));
    head.append(brand);
    var expandWorkbench = function () {
      var trigger = panel.querySelector('#hhExpand');
      if (trigger) trigger.click();
    };
    var expand = button('', 'hsm-expand-workbench', expandWorkbench, 'sidebar-unfold-line');
    expand.setAttribute('aria-label', '展开工作台');
    expand.title = '展开工作台';
    if (back) {
      var singleAction = el('div', 'hsm-header-actions single');
      singleAction.append(expand);
      head.append(singleAction);
    } else {
      var fresh = button('新对话', 'hsm-new-chat', freshChat, 'chat-new-line');
      var actions = el('div', 'hsm-header-actions');
      actions.append(expand, fresh);
      head.append(actions);
    }
    return head;
  }
  function sectionTitle(label, iconName) {
    var head = el('div', 'hsm-section-title');
    if (iconName) head.append(icon(iconName));
    head.append(el('h2', '', label));
    return head;
  }
  function chip(label, cls, fn, iconName) {
    var node = button(label, 'hsm-chip' + (cls ? ' ' + cls : ''), fn, iconName);
    return node;
  }
  function sourceNote(label) {
    var node = el('div', 'hsm-source');
    node.append(icon('file-text-line'), el('span', '', label));
    return node;
  }
  function footerNote() {
    return el('div', 'hsm-footer-note', '答复附来源，办理以业务系统为准');
  }
  function userBubble(text) {
    var row = el('div', 'hsm-bubble-row user');
    row.append(el('div', 'hsm-user-bubble', text), icon('user-fill', 'hsm-user-avatar'));
    return row;
  }
  function assistantLead(text) {
    var row = el('div', 'hsm-bubble-row assistant');
    row.append(image('images/assistant-mascot.png', 'hsm-bot-avatar', '合合'), el('div', 'hsm-assistant-bubble', text));
    return row;
  }
  function makeComposer(placeholder) {
    var wrap = el('div', 'hsm-composer-wrap');
    var form = el('form', 'hsm-composer');
    var tools = button('', 'hsm-composer-plus', function () { toast('附件与扩展工具入口；当前原型仅演示文字输入。'); }, 'add-circle-line');
    tools.setAttribute('aria-label', '打开扩展工具');
    var input = el('textarea', '');
    input.rows = 1;
    input.placeholder = placeholder || '有什么想了解或办理的？';
    input.setAttribute('aria-label', '向合合提问');
    var submit = button('', 'hsm-composer-send', null, 'send-plane-fill');
    submit.type = 'submit';
    submit.disabled = true;
    submit.setAttribute('aria-label', '发送');
    input.addEventListener('input', function () { submit.disabled = !input.value.trim(); });
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
        event.preventDefault();
        form.requestSubmit();
      }
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var value = input.value.trim();
      if (!value) return;
      dispatchQuestion(value);
    });
    form.append(tools, input, submit);
    wrap.append(form, footerNote());
    return wrap;
  }
  function pageShell(title, viewClass, back) {
    app.replaceChildren();
    app.className = 'hsm-app ' + (viewClass || '');
    app.append(header(title, back));
    content = el('main', 'hsm-content');
    app.append(content);
    return content;
  }

  function renderHome() {
    var host = pageShell('合合助手', 'hsm-home', false);
    var scroll = el('div', 'hsm-home-scroll');
    var hero = el('section', 'hsm-home-hero');
    hero.append(image('images/hehe-ui/home-skyline-v2.png', 'hsm-home-skyline', ''));
    hero.append(image('images/assistant-mascot.png', 'hsm-home-mascot', '合合'));
    hero.append(el('span', 'hsm-home-slogan', '让创新更简单'));
    var welcome = el('div', 'hsm-home-welcome');
    var title = el('h1', '', '您好，我是');
    title.append(el('strong', '', '合合'));
    welcome.append(title, el('p', '', '了解创新服务、查找数据、准备申请'));
    hero.append(welcome);
    scroll.append(hero);

    var ask = el('section', 'hsm-ask-card');
    ask.append(sectionTitle('可以这样问我'));
    var tabs = el('div', 'hsm-question-tabs');
    QUESTIONS.forEach(function (group, index) {
      var tab = button('', 'hsm-question-tab' + (state.homeTab === index ? ' active' : ''), function () {
        state.homeTab = index;
        renderHome();
      });
      tab.setAttribute('aria-pressed', String(state.homeTab === index));
      tab.append(icon(group.icon), el('span', '', group.label));
      tabs.append(tab);
    });
    ask.append(tabs);
    var list = el('div', 'hsm-question-list');
    var current = QUESTIONS[state.homeTab];
    current.batches[state.homeBatches[state.homeTab] % current.batches.length].forEach(function (question) {
      var item = button('', 'hsm-question-row', function () { dispatchQuestion(question); });
      item.append(el('span', '', question), icon('arrow-right-s-line'));
      list.append(item);
    });
    ask.append(list);
    var refresh = button('换一批', 'hsm-refresh', function () {
      state.homeBatches[state.homeTab] = (state.homeBatches[state.homeTab] + 1) % current.batches.length;
      renderHome();
    }, 'refresh-line');
    ask.append(refresh);
    scroll.append(ask);

    if (state.draft) {
      var resume = button('', 'hsm-resume', function () { setView(state.draft.kind === 'visit' ? 'booking' : 'feedback'); });
      resume.append(icon(state.draft.kind === 'visit' ? 'calendar-check-fill' : 'file-list-3-fill'));
      var copy = el('span', 'hsm-resume-copy');
      copy.append(el('strong', '', '继续准备' + state.draft.title), el('small', '', state.draft.missing));
      resume.append(copy, el('span', 'hsm-resume-action', '继续'), icon('arrow-right-s-line'));
      scroll.append(resume);
    }

    var bottom = el('div', 'hsm-home-bottom');
    var quick = el('div', 'hsm-quick-row');
    [
      ['场景揭榜', 'flag-2-fill', 'orange', showScenes],
      ['预约参观', 'calendar-check-fill', 'purple', showBooking],
      ['需求反馈', 'chat-check-fill', 'blue', startFeedback],
      ['全部服务', 'apps-2-fill', 'blue', function () { state.sheet = 'services'; renderSheet(); }]
    ].forEach(function (item) { quick.append(chip(item[0], item[2], item[3], item[1])); });
    bottom.append(quick, makeComposer('有什么想了解或办理的？'));
    host.append(scroll, bottom);
  }

  function renderChat() {
    var host = pageShell('合合助手', 'hsm-chat', false);
    var stream = el('div', 'hsm-chat-stream');
    var backdrop = el('div', 'hsm-chat-backdrop');
    backdrop.append(image('images/hehe-ui/home-skyline-v2.png', '', ''));
    stream.append(backdrop, userBubble(state.chatQuestion || '创新中心主要提供哪些服务？'));
    stream.append(assistantLead('您好！创新中心主要面向政府、企业、高校和社会创新主体，提供以下服务：'));
    var answer = el('article', 'hsm-answer-card');
    [
      ['创新咨询', '了解中心服务、场景方向与合作方式。', 'message-3-fill', 'blue'],
      ['数据与资源', '查询数据目录、创新资源与成果信息。', 'database-2-fill', 'purple'],
      ['办理支持', '场景揭榜、需求反馈、预约参观等准备指引。', 'clipboard-fill', 'green']
    ].forEach(function (item, index) {
      var row = el('div', 'hsm-answer-item');
      row.append(icon(item[2], item[3]));
      var copy = el('div');
      copy.append(el('strong', '', (index + 1) + '. ' + item[0]), el('p', '', item[1]));
      row.append(copy);
      answer.append(row);
    });
    answer.append(el('p', 'hsm-answer-tail', '如需了解更具体的内容，我可以继续为您介绍相关详情。'));
    answer.append(sourceNote('来源：创新中心公开服务信息'));
    stream.append(answer, el('time', 'hsm-message-time', '09:41'));
    var suggestions = el('div', 'hsm-followups');
    suggestions.append(chip('找资源', 'purple', showDataResults, 'database-2-fill'));
    suggestions.append(chip('场景创新', 'orange', showScenes, 'flag-2-fill'));
    suggestions.append(chip('预约参观', 'purple', showBooking, 'calendar-check-fill'));
    stream.append(suggestions);
    host.append(stream, makeComposer('继续提问或描述需求…'));
  }

  function resourceIcon(resource, index) {
    if (/公交|道路运输/.test(resource.data_name)) return index === 2 ? 'parking-box-fill' : 'bus-2-fill';
    if (/轨道|地铁/.test(resource.data_name)) return 'train-fill';
    return 'database-2-fill';
  }
  function resourceCard(resource, index) {
    var card = el('article', 'hsm-resource-card');
    card.append(icon(resourceIcon(resource, index), 'hsm-resource-icon tone-' + index));
    var copy = el('div', 'hsm-resource-copy');
    copy.append(el('h3', '', resource.data_name), el('p', '', resource.dept_name));
    var tags = el('div', 'hsm-tags');
    tags.append(el('span', 'green', '开放标识：' + resource.is_open), el('span', 'blue', '共享方式：' + resource.is_shared));
    copy.append(tags);
    var detail = button('查看详情', 'hsm-resource-detail', function () {
      state.resource = resource;
      if (!state.compare.some(function (item) { return item.id === resource.id; })) state.compare.unshift(resource);
      setView('data-detail');
    });
    detail.append(icon('arrow-right-s-line'));
    card.append(copy, detail);
    return card;
  }
  function showDataResults() {
    state.view = 'data-results';
    state.sheet = null;
    render();
  }
  function renderDataResults() {
    var host = pageShell('合合助手', 'hsm-data-results', false);
    var stream = el('div', 'hsm-data-stream');
    var backdrop = el('div', 'hsm-chat-backdrop compact');
    backdrop.append(image('images/hehe-ui/home-skyline-v2.png', '', ''));
    stream.append(backdrop, userBubble(state.dataQuestion || '市交通委有哪些开放数据目录？'));
    stream.append(assistantLead('已按北京市交通委员会、交通运输领域和开放标识“是”为您筛选目录，以下为示例结果。'));
    var filterRow = el('div', 'hsm-filter-chips');
    filterRow.append(chip('北京市交通委员会', 'blue', function () { state.sheet = 'filters'; renderSheet(); }, 'building-2-fill'));
    filterRow.append(chip('开放标识：是', 'blue', function () { state.sheet = 'filters'; renderSheet(); }, 'filter-3-line'));
    stream.append(filterRow);
    state.resources.slice(0, 3).forEach(function (resource, index) { stream.append(resourceCard(resource, index)); });
    var snapshot = el('div', 'hsm-snapshot');
    snapshot.append(icon('time-line'), el('span', '', '目录快照：2026-09-02'));
    stream.append(snapshot);
    host.append(stream, makeComposer('继续筛选、比较或追问…'));
  }

  function renderDataDetail() {
    var resource = state.resource || state.resources[0];
    var host = pageShell('合合助手', 'hsm-data-detail', false);
    var stream = el('div', 'hsm-detail-stream');
    stream.append(userBubble('查看' + resource.data_name));
    stream.append(assistantLead('为您找到该数据资源的目录详细信息：'));
    var card = el('article', 'hsm-detail-card');
    var title = el('div', 'hsm-detail-title');
    title.append(icon(resourceIcon(resource, 0)), el('h2', '', resource.data_name));
    card.append(title);
    var table = el('dl', 'hsm-detail-table');
    [
      ['提供部门', resource.dept_name],
      ['开放标识', resource.is_open],
      ['共享方式', resource.is_shared],
      ['适用方向', /公交/.test(resource.data_name) ? '出行分析、站点研究、服务优化' : /轨道/.test(resource.data_name) ? '线路规划、走向分析、运营研究' : '交通治理、行业信用、服务研究']
    ].forEach(function (row) { table.append(el('dt', '', row[0]), el('dd', '', row[1])); });
    card.append(table);
    var actions = el('div', 'hsm-card-actions');
    actions.append(button('加入比较', 'hsm-outline-action', function () {
      if (!state.compare.some(function (item) { return item.id === resource.id; })) state.compare.push(resource);
      if (state.compare.length > 1) setView('compare');
      else toast('已加入比较，请继续选择另一项数据。');
    }, 'bar-chart-grouped-line'));
    actions.append(button('准备需求', 'hsm-outline-action', function () { startContribution('数据资源需求'); }, 'clipboard-fill'));
    card.append(actions);
    stream.append(card);
    var compare = el('section', 'hsm-selected-compare');
    var compareHead = el('div', 'hsm-compare-head');
    compareHead.append(sectionTitle('已选比较', 'book-2-fill'), button('清空全部', 'hsm-clear', function () { state.compare = []; renderDataDetail(); }, 'delete-bin-6-line'));
    compare.append(compareHead);
    var selected = el('div', 'hsm-selected-items');
    state.compare.slice(0, 2).forEach(function (item, index) {
      var row = el('div', 'hsm-selected-item');
      row.append(icon(resourceIcon(item, index)), el('span', '', item.data_name));
      var remove = button('', '', function () { state.compare = state.compare.filter(function (x) { return x.id !== item.id; }); renderDataDetail(); }, 'close-line');
      remove.setAttribute('aria-label', '移除' + item.data_name);
      row.append(remove);
      selected.append(row);
    });
    compare.append(selected, button('继续添加对比项', 'hsm-add-more', showDataResults, 'add-circle-line'));
    var caution = el('p', 'hsm-caution');
    caution.append(icon('information-line'), document.createTextNode('目录信息仅供参考，使用权限需另行核对'));
    compare.append(caution);
    if (state.compare.length > 1) compare.append(button('查看数据对比', 'hsm-primary block', function () { setView('compare'); }, 'bar-chart-grouped-line'));
    stream.append(compare);
    host.append(stream, makeComposer('继续比较、筛选或提需求…'));
  }

  function renderCompare() {
    var left = state.compare[0] || state.resources[0];
    var right = state.compare[1] || state.resources[1];
    var host = pageShell('数据对比', 'hsm-compare-page', true);
    var stream = el('div', 'hsm-page-scroll');
    var hero = el('section', 'hsm-compare-hero');
    hero.append(image('images/assistant-mascot.png', 'hsm-compare-mascot', '合合'), el('p', '', '数据对比更清晰\n助您做出更合适的选择'));
    var versus = el('div', 'hsm-versus');
    [left, right].forEach(function (item, index) {
      var resource = el('div', 'hsm-versus-item');
      resource.append(icon(resourceIcon(item, index)), el('strong', '', item.data_name), el('span', '', item.dept_name));
      versus.append(resource);
      if (!index) versus.append(el('b', '', 'VS'));
    });
    hero.append(versus);
    stream.append(hero);
    var result = el('section', 'hsm-comparison-card');
    result.append(sectionTitle('数据对比结果'));
    var grid = el('div', 'hsm-comparison-grid');
    var rows = [
      ['对比项', left.data_name, right.data_name],
      ['提供部门', left.dept_name, right.dept_name],
      ['开放标识', left.is_open, right.is_open],
      ['共享方式', left.is_shared, right.is_shared],
      ['更新日期', formatDate(left.data_time), formatDate(right.data_time)],
      ['适用方向', /公交/.test(left.data_name) ? '站点分布、设施与客流服务研究' : '交通行业研究', /轨道/.test(right.data_name) ? '线路规划、走向与运营分析' : '交通行业研究']
    ];
    rows.forEach(function (row, rowIndex) {
      row.forEach(function (cell, columnIndex) {
        var node = el('div', (rowIndex === 0 ? 'head ' : '') + (columnIndex === 0 ? 'label' : ''), cell);
        grid.append(node);
      });
    });
    result.append(grid);
    stream.append(result);
    var advice = el('section', 'hsm-advice');
    advice.append(sectionTitle('合合建议'));
    var bubble = el('div', 'hsm-advice-bubble');
    bubble.append(image('images/assistant-mascot.png', '', '合合'));
    var copy = el('p', '');
    copy.append(document.createTextNode('根据对比结果：\n“' + left.data_name + '”更适合站点与出行服务研究；\n“' + right.data_name + '”更适合线路规划和运营分析。\n您可以根据具体业务目的选择，目录可见不代表已取得使用权限。'));
    bubble.append(copy);
    advice.append(bubble);
    stream.append(advice);
    var actions = el('div', 'hsm-bottom-actions');
    actions.append(button('继续添加对比', 'hsm-secondary', showDataResults, 'add-circle-line'));
    actions.append(button('发起需求', 'hsm-primary', function () { startContribution('数据资源需求'); }, 'send-plane-line'));
    stream.append(actions);
    host.append(stream);
  }

  function showScenes() {
    state.view = 'scenes';
    state.sheet = null;
    render();
  }
  function sceneCard(scene, index) {
    var card = el('article', 'hsm-scene-card');
    var visual = el('div', 'hsm-scene-visual tone-' + index);
    visual.append(image('images/hehe-ui/home-skyline-v2.png', '', ''));
    var main = el('div', 'hsm-scene-card-main');
    var heading = el('div', 'hsm-scene-heading');
    heading.append(el('h3', '', scene.scene_name), el('span', index === 1 ? 'ending' : 'active', index === 1 ? '最新发布' : '公开目录'));
    main.append(heading);
    var meta = el('p', 'hsm-scene-meta');
    meta.append(icon('building-line'), document.createTextNode(' 公开场景需求 '), icon('time-line'), document.createTextNode(' ' + formatDate(scene.data_time)));
    main.append(meta, el('p', 'hsm-scene-desc', scene.scene_innovation_demand));
    var tags = el('div', 'hsm-scene-tags');
    ['数据融合', index === 1 ? '交通治理' : '协同创新', 'AI应用'].forEach(function (tag, i) { tags.append(el('span', 't' + i, tag)); });
    main.append(tags);
    var action = button('查看详情', 'hsm-scene-detail', function () { state.scene = scene; setView('scene-detail'); });
    action.append(icon('arrow-right-s-line'));
    card.append(visual, main, action);
    return card;
  }
  function renderScenes() {
    var host = pageShell('场景揭榜', 'hsm-scenes-page', true);
    var stream = el('div', 'hsm-page-scroll');
    var tabs = el('div', 'hsm-scene-tabs');
    ['全部', '最新发布', '历史目录'].forEach(function (label) {
      tabs.append(button(label, state.sceneTab === label ? 'active' : '', function () { state.sceneTab = label; renderScenes(); }));
    });
    stream.append(tabs);
    var search = el('label', 'hsm-search');
    search.append(icon('search-line'));
    var input = el('input', '');
    input.type = 'search';
    input.placeholder = '搜索场景名称或方向';
    input.value = state.sceneQuery;
    input.addEventListener('input', function () { state.sceneQuery = input.value; renderSceneList(list); });
    search.append(input);
    stream.append(search);
    var list = el('div', 'hsm-scene-list');
    stream.append(list);
    function renderSceneList(target) {
      target.replaceChildren();
      var query = state.sceneQuery.trim();
      var scenes = state.scenes.filter(function (scene) { return !query || (scene.scene_name + scene.scene_innovation_demand).includes(query); });
      if (state.sceneTab === '最新发布') scenes = scenes.slice(0, 2);
      if (state.sceneTab === '历史目录') scenes = scenes.slice().reverse();
      scenes.slice(0, 3).forEach(function (scene, index) { target.append(sceneCard(scene, index)); });
      if (!scenes.length) target.append(el('p', 'hsm-empty', '没有找到匹配场景，请换一个关键词。'));
    }
    renderSceneList(list);
    var recommend = button('', 'hsm-scene-recommend', function () { toast('请告诉合合您的行业、能力和合作目标，我会据此整理匹配方向。'); });
    recommend.append(image('images/assistant-mascot.png', '', '合合'), el('strong', '', '让合合帮我推荐场景'), icon('arrow-right-s-line'));
    stream.append(recommend, el('p', 'hsm-recommend-note', '— 基于您的兴趣和需求，智能推荐合适的场景 —'));
    host.append(stream);
  }

  function renderSceneDetail() {
    var scene = state.scene || state.scenes[0];
    var host = pageShell('场景详情', 'hsm-scene-detail-page', true);
    var stream = el('div', 'hsm-page-scroll');
    var intro = el('section', 'hsm-scene-intro');
    var top = el('div', 'hsm-scene-intro-top');
    top.append(icon('bus-2-fill'), el('h1', '', scene.scene_name), el('span', '', '公开目录'));
    intro.append(top, el('p', 'hsm-scene-subtitle', '目录快照中的公开场景创新需求'));
    var meta = el('dl', 'hsm-scene-detail-meta');
    meta.append(el('dt', '', '收录时间'), el('dd', '', formatDate(scene.data_time)));
    meta.append(el('dt', '', '目录来源'), el('dd', '', '数智北京创新中心公开场景目录'));
    meta.append(el('dt', '', '场景简介'), el('dd', '', scene.scene_innovation_demand));
    intro.append(meta);
    stream.append(intro);
    var facts = el('section', 'hsm-scene-facts');
    [
      ['场景目标', ['围绕公开需求推动多源数据融合与创新应用', '提升业务协同和智能决策能力'], 'target-line'],
      ['参与对象', ['面向具备相关技术、数据应用经验或解决方案能力的创新主体', '具体资格条件按当前批次通知核对'], 'user-line'],
      ['申报材料', ['公开目录未包含完整材料清单', '请进入正式场景页面核对模板、时限和提交要求'], 'file-list-3-line'],
      ['联系方式', ['公开快照未提供联系人信息', '需在正式业务页面或批次通知中核对'], 'phone-line']
    ].forEach(function (item) {
      var row = el('div', 'hsm-scene-fact');
      row.append(icon(item[2]), el('strong', '', item[0]));
      var list = el('ul', '');
      item[1].forEach(function (line) { list.append(el('li', '', line)); });
      row.append(list);
      facts.append(row);
    });
    stream.append(facts);
    var assist = el('section', 'hsm-scene-assist');
    assist.append(image('images/assistant-mascot.png', '', '合合'));
    var copy = el('div');
    copy.append(el('h2', '', '合合可帮您'), el('p', '', '基于公开需求，提供申报准备辅助'));
    assist.append(copy);
    var helpers = el('div', 'hsm-helper-grid');
    [['解读申报条件', '快速理解要求要点', 'message-3-fill'], ['整理报名信息', '梳理资料并生成草稿', 'database-2-fill'], ['生成问题清单', '提前核对常见问题', 'clipboard-fill']].forEach(function (item) {
      var helper = button('', '', function () { toast(item[0] + '已加入当前准备清单。'); });
      helper.append(icon(item[2]), el('strong', '', item[0]), el('small', '', item[1]));
      helpers.append(helper);
    });
    assist.append(helpers);
    stream.append(assist);
    var actions = el('div', 'hsm-bottom-actions');
    actions.append(button('让合合协助准备', 'hsm-primary', function () { startSceneDraft(scene); }, 'sparkling-fill'));
    var official = el('a', 'hsm-secondary', '打开正式场景页');
    official.href = OFFICIAL.scene;
    official.target = '_blank';
    official.rel = 'noopener noreferrer';
    official.prepend(icon('external-link-line'));
    actions.append(official);
    stream.append(actions);
    host.append(stream);
  }

  function showBooking() {
    if (!state.draft || state.draft.kind !== 'visit') {
      state.draft = { kind: 'visit', title: '预约参观', missing: '请选择日期与时间段' };
      upsertRecord('visit', '预约参观', '待核对', '请选择参观日期与时间');
    }
    setView('booking');
  }
  function renderBooking() {
    var host = pageShell('预约参观', 'hsm-booking-page', true);
    var stream = el('div', 'hsm-page-scroll');
    var steps = el('div', 'hsm-steps');
    [['1', '填写信息'], ['2', '选择时间'], ['3', '提交核对']].forEach(function (item, index) {
      var step = el('div', 'hsm-step' + (state.bookingStep === index + 1 ? ' active' : '') + (state.bookingStep > index + 1 ? ' done' : ''));
      step.append(el('b', '', item[0]), el('span', '', item[1]));
      steps.append(step);
    });
    stream.append(steps);
    if (state.bookingStep === 2) {
      var calendar = el('section', 'hsm-calendar');
      var month = el('header', '');
      month.append(el('h2', '', '2026 年 9 月'), button('', '', function () { toast('原型固定展示 2026 年 9 月。'); }, 'arrow-left-s-line'), button('', '', function () { toast('原型固定展示 2026 年 9 月。'); }, 'arrow-right-s-line'));
      calendar.append(month);
      var grid = el('div', 'hsm-calendar-grid');
      ['日', '一', '二', '三', '四', '五', '六'].forEach(function (day) { grid.append(el('span', 'weekday', day)); });
      [30, 31].forEach(function (day) { grid.append(el('span', 'muted', String(day))); });
      for (var day = 1; day <= 30; day += 1) {
        (function (value) {
          var date = button(String(value), value === state.selectedDate ? 'selected' : '', function () { state.selectedDate = value; renderBooking(); });
          if (value === 16 || value === 23) date.classList.add('has-slot');
          grid.append(date);
        }(day));
      }
      [1, 2, 3].forEach(function (day) { grid.append(el('span', 'muted', String(day))); });
      calendar.append(grid);
      stream.append(calendar);
      var timeHead = el('div', 'hsm-time-head');
      timeHead.append(sectionTitle('可选择的时间段'), el('span', '', '选择 9 月 ' + state.selectedDate + ' 日的参观时间'));
      stream.append(timeHead);
      var slots = el('div', 'hsm-slots');
      ['10:00—11:00', '14:00—15:00', '15:00—16:00'].forEach(function (slot) {
        slots.append(button(slot, slot === state.selectedSlot ? 'active' : '', function () { state.selectedSlot = slot; renderBooking(); }));
      });
      stream.append(slots);
      var note = el('section', 'hsm-booking-note');
      note.append(sectionTitle('参观说明', 'clipboard-fill'));
      var list = el('ul', '');
      ['请提前 10 分钟到场，配合现场登记。', '团体预约需填写领队信息，以便统一安排。', '当前日期和场次为交互演示，真实可约时间需由业务服务返回。'].forEach(function (line) { list.append(el('li', '', line)); });
      note.append(list);
      stream.append(note);
      stream.append(button('下一步：核对信息', 'hsm-primary block', function () {
        state.bookingStep = 3;
        state.draft.missing = '请核对领队信息与联系方式';
        upsertRecord('visit', '预约参观', '待核对', '已选 9 月 ' + state.selectedDate + ' 日 ' + state.selectedSlot);
        renderBooking();
      }, 'arrow-right-line'));
    } else {
      var review = el('section', 'hsm-booking-review');
      review.append(sectionTitle('提交前核对'));
      var table = el('dl', 'hsm-detail-table');
      [['预约日期', '2026 年 9 月 ' + state.selectedDate + ' 日'], ['预约时段', state.selectedSlot], ['预约类型', '团体参观（待填写领队信息）'], ['当前状态', '助手草稿，尚未提交业务系统']].forEach(function (row) { table.append(el('dt', '', row[0]), el('dd', '', row[1])); });
      review.append(table, el('p', 'hsm-caution', '请在正式预约入口核对真实场次并完成身份与联系方式填写。'));
      var row = el('div', 'hsm-bottom-actions');
      row.append(button('返回选择时间', 'hsm-secondary', function () { state.bookingStep = 2; renderBooking(); }));
      row.append(button('保存助手草稿', 'hsm-primary', function () { toast('预约信息已保存为助手草稿，未提交业务系统。'); setView('records'); }));
      review.append(row);
      stream.append(review);
    }
    host.append(stream);
  }

  function startFeedback() {
    state.draft = { kind: 'feedback', title: '需求反馈', missing: '还需补充：联系电话、需求详情' };
    upsertRecord('feedback', '需求反馈', '待补充', '还需填写联系电话、需求详情');
    setView('feedback');
  }
  function startContribution(title) {
    state.draft = { kind: 'feedback', title: title, missing: '还需补充单位、联系人和需求详情' };
    upsertRecord('contribution', title, '待补充', '助手正在整理基础信息');
    state.feedback.detail = title === '数据资源需求' ? '希望进一步了解所选数据目录的使用条件。' : '';
    setView('feedback');
  }
  function startSceneDraft(scene) {
    state.draft = { kind: 'feedback', title: '场景揭榜报名准备', missing: '还需核对主体资格与申报材料' };
    upsertRecord('scene', '场景揭榜报名准备', '进行中', '已选择：' + scene.scene_name);
    state.feedback.detail = '拟参与“' + scene.scene_name + '”，请协助整理申报准备信息。';
    setView('feedback');
  }
  function renderFeedback() {
    var title = state.draft ? state.draft.title : '需求反馈';
    var host = pageShell(title, 'hsm-feedback-page', true);
    var stream = el('div', 'hsm-page-scroll');
    var intro = el('section', 'hsm-form-intro');
    intro.append(image('images/assistant-mascot.png', '', '合合'), el('h1', '', '我来帮您准备' + title), el('p', '', '先整理必要信息，完成后保存为助手草稿；不会自动提交业务系统。'));
    stream.append(intro);
    var form = el('form', 'hsm-feedback-form');
    [
      ['company', '单位名称', '请输入单位名称', 'text'],
      ['contact', '联系人', '请输入联系人姓名', 'text'],
      ['phone', '联系电话', '请输入 11 位手机号', 'tel'],
      ['detail', '需求详情', '请描述您的问题、资源需求或合作目标', 'textarea']
    ].forEach(function (field) {
      var label = el('label', '');
      label.append(el('span', '', field[1]));
      var input = field[3] === 'textarea' ? el('textarea', '') : el('input', '');
      if (field[3] !== 'textarea') input.type = field[3];
      input.placeholder = field[2];
      input.value = state.feedback[field[0]];
      input.addEventListener('input', function () { state.feedback[field[0]] = input.value; });
      label.append(input);
      form.append(label);
    });
    var actions = el('div', 'hsm-bottom-actions');
    actions.append(button('暂存草稿', 'hsm-secondary', function () {
      upsertRecord(state.draft.kind, title, '待补充', '助手草稿已暂存，尚未提交');
      toast('草稿已保存在本次原型会话中。');
      setView('home');
    }));
    actions.append(button('核对信息', 'hsm-primary', function () {
      var missing = ['company', 'contact', 'phone', 'detail'].filter(function (key) { return !state.feedback[key].trim(); });
      if (missing.length) { toast('请先补全单位、联系人、联系电话和需求详情。'); return; }
      state.draft.missing = '信息已齐全，等待您核对并进入正式入口';
      upsertRecord(state.draft.kind, title, '待核对', '信息已整理齐全，等待用户核对');
      toast('信息已整理为草稿；正式提交仍需进入业务系统。');
      setView('records');
    }));
    form.append(actions);
    stream.append(form);
    host.append(stream);
  }

  function upsertRecord(kind, title, status, description) {
    var record = state.records.find(function (item) { return item.title === title; });
    if (!record) {
      record = { id: 'draft-' + Date.now(), kind: kind, title: title, status: status, description: description, updated: Date.now() };
      state.records.unshift(record);
    } else {
      record.status = status;
      record.description = description;
      record.updated = Date.now();
    }
  }
  function renderRecords() {
    var host = pageShell('我的办理', 'hsm-records-page', true);
    var stream = el('div', 'hsm-page-scroll');
    var hero = el('section', 'hsm-records-hero');
    hero.append(image('images/hehe-ui/home-skyline-v2.png', 'hsm-records-skyline', ''));
    var copy = el('div');
    var title = el('h1', '', '我的');
    title.append(el('strong', '', '办理'));
    copy.append(title, el('p', '', '高效跟进 · 轻松办理'));
    hero.append(copy, image('images/assistant-mascot.png', 'hsm-records-mascot', '合合'), el('span', '', '让创新更简单'));
    stream.append(hero);
    var overview = el('section', 'hsm-record-overview');
    var tabs = el('div', 'hsm-record-tabs');
    ['进行中', '已完成'].forEach(function (label) { tabs.append(button(label, state.recordTab === label ? 'active' : '', function () { state.recordTab = label; renderRecords(); })); });
    overview.append(tabs);
    var activeRows = state.records.filter(function (row) { return row.status !== '已完成'; });
    var metrics = el('div', 'hsm-record-metrics');
    [
      ['待补充', activeRows.filter(function (x) { return x.status === '待补充'; }).length, 'file-list-3-fill', 'blue'],
      ['待核对', activeRows.filter(function (x) { return x.status === '待核对'; }).length, 'shield-check-fill', 'orange'],
      ['已完成', state.records.filter(function (x) { return x.status === '已完成'; }).length, 'checkbox-circle-fill', 'green']
    ].forEach(function (item) {
      var stat = el('div', 'hsm-record-stat ' + item[3]);
      stat.append(icon(item[2]), el('span', '', item[0]), el('strong', '', String(item[1])));
      metrics.append(stat);
    });
    overview.append(metrics);
    stream.append(overview);
    stream.append(sectionTitle(state.recordTab === '进行中' ? '进行中的任务' : '已完成的任务'));
    var rows = state.records.filter(function (record) { return state.recordTab === '已完成' ? record.status === '已完成' : record.status !== '已完成'; });
    if (!rows.length) {
      var empty = el('section', 'hsm-empty-card');
      empty.append(icon('file-search-line'), el('h2', '', state.recordTab === '已完成' ? '暂无已完成记录' : '暂无进行中的助手草稿'), el('p', '', '从需求反馈、预约参观或场景准备开始，草稿会显示在这里。'), button('返回首页开始', 'hsm-primary', function () { setView('home'); }));
      stream.append(empty);
    } else {
      rows.forEach(function (record) {
        var row = el('article', 'hsm-record-row');
        row.append(icon(record.kind === 'visit' ? 'calendar-check-fill' : record.kind === 'scene' ? 'flag-2-fill' : 'file-list-3-fill'));
        var copy = el('div', 'hsm-record-copy');
        copy.append(el('h3', '', record.title), el('p', '', record.description));
        var time = el('time', '');
        time.append(icon('time-line'), document.createTextNode(' 更新于 ' + new Date(record.updated).toLocaleString('zh-CN', { hour12: false })));
        copy.append(time);
        var right = el('div', 'hsm-record-right');
        right.append(el('span', 'status ' + (record.status === '待核对' ? 'orange' : 'blue'), record.status));
        right.append(button('继续', '', function () { setView(record.kind === 'visit' ? 'booking' : 'feedback'); }, 'arrow-right-s-line'));
        row.append(copy, right);
        stream.append(row);
      });
    }
    stream.append(el('p', 'hsm-record-boundary', '助手草稿不等于正式业务记录，办理结果以业务系统为准'));
    host.append(stream);
  }

  function dispatchQuestion(question) {
    if (/市交通委|交通运输|公交站点|轨道线路|开放数据|筛选数据|数据目录|比较两个/.test(question)) {
      state.dataQuestion = question;
      showDataResults();
      return;
    }
    if (/预约参观/.test(question)) { showBooking(); return; }
    if (/需求反馈/.test(question)) { startFeedback(); return; }
    if (/场景揭榜|场景申报|场景目录/.test(question)) {
      if (/参加|参与|查看|揭榜/.test(question)) { showScenes(); return; }
    }
    state.chatQuestion = question;
    setView('chat');
  }

  function renderServiceSheet() {
    var overlay = el('div', 'hsm-overlay');
    overlay.addEventListener('click', function (event) { if (event.target === overlay) { state.sheet = null; renderSheet(); } });
    var sheet = el('section', 'hsm-sheet hsm-services-sheet');
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-label', '全部服务');
    sheet.append(el('span', 'hsm-sheet-handle'));
    var head = el('header', '');
    head.append(el('h2', '', '全部服务'), button('', 'hsm-sheet-close', function () { state.sheet = null; renderSheet(); }, 'close-line'));
    sheet.append(head);
    SERVICE_GROUPS.forEach(function (group) {
      sheet.append(sectionTitle(group.title));
      var grid = el('div', 'hsm-service-grid');
      group.items.forEach(function (item) {
        var tile = button('', 'hsm-service-tile', function () { state.sheet = null; item[4](); });
        tile.append(icon(item[2], item[3]));
        var copy = el('span', '');
        copy.append(el('strong', '', item[0]), el('small', '', item[1]));
        tile.append(copy, icon('arrow-right-s-line'));
        grid.append(tile);
      });
      sheet.append(grid);
    });
    overlay.append(sheet);
    return overlay;
  }
  function option(label, active, fn) {
    var item = button('', 'hsm-filter-option' + (active ? ' active' : ''), fn);
    item.append(el('span', '', label));
    if (active) item.append(icon('check-line'));
    return item;
  }
  function renderFilterSheet() {
    var overlay = el('div', 'hsm-overlay');
    overlay.addEventListener('click', function (event) { if (event.target === overlay) { state.sheet = null; renderSheet(); } });
    var sheet = el('section', 'hsm-sheet hsm-filter-sheet');
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-label', '筛选数据');
    sheet.append(el('span', 'hsm-sheet-handle'));
    var head = el('header', '');
    var copy = el('div', '');
    copy.append(el('h2', '', '筛选数据'), el('p', '', '按条件筛选，快速找到符合您需求的数据资源'));
    head.append(copy, button('', 'hsm-sheet-close', function () { state.sheet = null; renderSheet(); }, 'close-line'));
    sheet.append(head);
    var groups = [
      ['来源部门', '单选', ['全部', '市交通委', '市经信局', '市发展改革委'], function (label) { return label === '全部' ? !state.filters.department : state.filters.department.includes(label.replace('市交通委', '交通')); }, function (label) { state.filters.department = label === '全部' ? '' : label === '市交通委' ? '北京市交通委员会' : label; renderSheet(); }],
      ['数据领域', '多选', ['交通运输', '城市治理', '公共服务', '产业经济'], function (label) { return state.filters.domains.includes(label); }, function (label) { var index = state.filters.domains.indexOf(label); if (index >= 0) state.filters.domains.splice(index, 1); else state.filters.domains.push(label); renderSheet(); }],
      ['开放标识', '单选', ['全部', '是', '否'], function (label) { return label === '全部' ? !state.filters.open : state.filters.open === label; }, function (label) { state.filters.open = label === '全部' ? '' : label; renderSheet(); }],
      ['共享方式', '单选', ['无条件共享', '有条件共享'], function (label) { return state.filters.shared === label; }, function (label) { state.filters.shared = label; renderSheet(); }]
    ];
    groups.forEach(function (group) {
      var title = el('div', 'hsm-filter-title');
      title.append(el('h3', '', group[0]), el('span', '', group[1]));
      sheet.append(title);
      var options = el('div', 'hsm-filter-options');
      group[2].forEach(function (label) { options.append(option(label, group[3](label), function () { group[4](label); })); });
      sheet.append(options);
    });
    var actions = el('div', 'hsm-sheet-actions');
    actions.append(button('重置', 'hsm-secondary', function () { state.filters = { department: '', domains: [], open: '', shared: '' }; renderSheet(); }));
    actions.append(button('查看结果', 'hsm-primary', function () { state.sheet = null; showDataResults(); }));
    sheet.append(actions);
    overlay.append(sheet);
    return overlay;
  }
  function renderMenuSheet() {
    var overlay = el('div', 'hsm-overlay hsm-menu-overlay');
    overlay.addEventListener('click', function (event) { if (event.target === overlay) { state.sheet = null; renderSheet(); } });
    var sheet = el('aside', 'hsm-menu-sheet');
    var head = el('div', 'hsm-menu-brand');
    head.append(image('images/assistant-mascot.png', '', '合合'), el('strong', '', '合合助手'), button('', '', function () { state.sheet = null; renderSheet(); }, 'close-line'));
    sheet.append(head);
    [
      ['新对话', 'chat-new-line', freshChat],
      ['我的办理', 'file-list-3-line', function () { setView('records'); }],
      ['服务导航', 'apps-2-line', function () { state.sheet = 'services'; renderSheet(); }],
      ['资源收藏', 'star-line', function () { toast('当前原型暂无收藏资源。'); }],
      ['帮助与反馈', 'question-line', function () { toast('可直接输入问题，或从首页快捷入口开始。'); }]
    ].forEach(function (item) {
      var row = button(item[0], 'hsm-menu-row', function () { state.sheet = null; item[2](); }, item[1]);
      row.append(icon('arrow-right-s-line'));
      sheet.append(row);
    });
    overlay.append(sheet);
    return overlay;
  }
  function renderSheet() {
    app.querySelectorAll('.hsm-overlay').forEach(function (node) { node.remove(); });
    if (state.sheet === 'services') app.append(renderServiceSheet());
    if (state.sheet === 'filters') app.append(renderFilterSheet());
    if (state.sheet === 'menu') app.append(renderMenuSheet());
  }

  function render() {
    if (!app) return;
    panel.dataset.hsmView = state.view;
    if (state.view === 'home') renderHome();
    else if (state.view === 'chat') renderChat();
    else if (state.view === 'data-results') renderDataResults();
    else if (state.view === 'data-detail') renderDataDetail();
    else if (state.view === 'compare') renderCompare();
    else if (state.view === 'scenes') renderScenes();
    else if (state.view === 'scene-detail') renderSceneDetail();
    else if (state.view === 'booking') renderBooking();
    else if (state.view === 'records') renderRecords();
    else if (state.view === 'feedback') renderFeedback();
    renderSheet();
  }

  function loadData() {
    fetch(new URL('data/hehe-catalog-20260902.json', base)).then(function (response) {
      if (!response.ok) throw new Error('catalog request failed');
      return response.json();
    }).then(function (data) {
      function pick(pattern) { return data.gov.find(function (row) { return pattern.test(row.data_name); }); }
      var resources = [pick(/^公交站点信息/), pick(/^轨道线路信息/), pick(/^道路运输市场从业人员诚信考核数据$/)].filter(Boolean);
      if (resources.length === 3) {
        state.resources = resources;
        state.resource = resources[0];
        state.compare = [resources[0], resources[1]];
      }
      if (Array.isArray(data.scenes) && data.scenes.length) state.scenes = data.scenes.slice(0, 3);
      if (state.view !== 'home') render();
    }).catch(function () {
      /* The exact snapshot rows above keep the prototype usable offline. */
    });
  }

  function boot(attempt) {
    panel = document.getElementById('aiChatPanel');
    var main = panel && panel.querySelector('.hh-main');
    if (!panel || !main || !main.querySelector('.hb-app')) {
      if (attempt < 200) setTimeout(function () { boot(attempt + 1); }, 50);
      return;
    }
    if (panel.querySelector('.hsm-app')) return;
    app = el('div', 'hsm-app');
    main.append(app);
    panel.classList.add('hsm-enabled');
    render();
    loadData();
    window.HeheSideAssistant = {
      state: state,
      render: render,
      open: function (view) { setView(view || 'home'); },
      services: function () { state.sheet = 'services'; renderSheet(); },
      filters: function () { state.sheet = 'filters'; renderSheet(); }
    };
  }
  boot(0);
}());
