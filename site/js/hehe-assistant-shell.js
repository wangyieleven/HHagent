/* Shared drawer/workbench: move existing live nodes; never recreate a conversation on resize. */
(function () {
  'use strict';
  var source = new URL(document.currentScript.src);
  var base = new URL('../', source);
  ['css/remixicon.css', 'css/hehe-assistant-shell.css'].forEach(function (path) {
    var link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = new URL(path, base).href + source.search;
    document.body.appendChild(link);
  });
  function icon(name) { return name==='chat-smile-3-fill' ? '<i class="hh-chat-icon" aria-hidden="true"></i>' : '<i class="ri-' + name + '" aria-hidden="true"></i>'; }
  function node(tag, cls, html) {
    var el = document.createElement(tag); el.className = cls;
    if (html) el.innerHTML = html;
    return el;
  }
  function boot(attempt) {
    var panel = document.getElementById('aiChatPanel');
    if (!panel || !panel.classList.contains('hehe-picmatch-bound') || !window.HeheAgent) {
      if (attempt < 150) setTimeout(function () { boot(attempt + 1); }, 60);
      return;
    }
    if (panel.classList.contains('hh-redesign')) return;
    panel.classList.add('hh-redesign');
    panel.classList.remove('hehe-workbench');
    panel.querySelectorAll('.hehe-beta-chip,.hehe-sc-badge,.chat-disclaimer').forEach(function(el){el.hidden=true;});
    var input = document.getElementById('chatInput');
    var stream = document.getElementById('chatStream');
    stream.querySelectorAll('.jy-greet').forEach(function(el){el.remove();});
    var launcher = document.getElementById('aiAssistantToggle');
    var assistant = panel.closest('.ai-assistant');
    var header = panel.querySelector('.chat-header');
    var actions = panel.querySelector('.chat-actions');
    var main = node('main', 'hh-main');
    var welcome = node('div', 'hh-welcome');
    var hero = panel.querySelector('.hh-hero');
    var greet = panel.querySelector('.hh-greet-text');
    var cards = document.getElementById('hhPicCards');
    var suggestions = document.getElementById('hhPicSuggestions');
    var composer = panel.querySelector('.hh-input-area');
    var chatWrap = panel.querySelector('.hh-stream-wrap');
    var wide = false;
    var previousFocus = null;
    var history = [];

    header.prepend(node('span', 'hh-brand-spark', icon('sparkling-fill')));
    var expand = node('button', 'hh-expand', icon('expand-diagonal-line') + '<span>工作台</span>');
    expand.type = 'button'; expand.id = 'hhExpand'; actions.prepend(expand);
    var newChat = node('button', 'hh-new-mini', icon('chat-new-line'));
    newChat.type = 'button'; newChat.setAttribute('aria-label', '新建对话');
    actions.prepend(newChat);
    hero.querySelector('.hh-ribbon').remove();
    hero.querySelector('.hh-bubble').remove();
    var title = greet.querySelector('h2');
    title.innerHTML = '<span class="hh-narrow-copy">您好，我是合合助手</span><span class="hh-wide-copy">您好，<br>我是<strong>合合助手</strong></span>';
    greet.querySelector('p').innerHTML = '<span class="hh-narrow-copy">我可以帮您查服务、查资源、查政策、边聊边办</span><span class="hh-wide-copy">我可以帮您查询数据、解读政策、获取资源、<br>以及办理相关业务，让数据更好地服务社会。</span>';
    hero.querySelector('.hh-slogan').innerHTML = '<span class="hh-narrow-copy">数智相伴<br>服务就在身边！</span><span class="hh-wide-copy">让数据创造<br>更美好的北京</span>';
    var heroGroup = node('div', 'hh-hero-group');
    heroGroup.append(hero, greet); welcome.append(heroGroup);

    var modes = node('div', 'hh-modes');
    modes.setAttribute('role', 'tablist'); modes.setAttribute('aria-label', '助手能力');
    var modeData = [['问答','通用问答，知识解答','chat-smile-3-fill'],['问数','数据查询，图表分析','bar-chart-grouped-fill'],['边聊边办','对话式办理，高效便捷','flashlight-fill']];
    modeData.forEach(function (item, index) {
      var b = node('button', 'hh-mode' + (!index ? ' is-active' : ''), icon(item[2]) + '<span><b>' + item[0] + '</b><small>' + item[1] + '</small></span>');
      b.type = 'button'; b.setAttribute('role','tab'); b.setAttribute('aria-selected', String(!index));
      b.addEventListener('click', function () {
        modes.querySelectorAll('button').forEach(function (tab) { tab.classList.remove('is-active'); tab.setAttribute('aria-selected','false'); });
        b.classList.add('is-active'); b.setAttribute('aria-selected','true');
        input.placeholder = ['请输入您的问题，或输入“/”选择技能…','请描述您想查询的数据或分析问题…','请告诉合合您想办理的事项…'][index];
        input.focus();
      });
      modes.append(b);
    });
    welcome.append(modes);
    var specs = [
      ['consult','green','chat-smile-3-fill','咨询创新服务','咨询创新服务','解答政策、服务、<br>平台使用等问题','了解平台功能、服务内容<br>和操作指引'],
      ['data','red','database-2-fill','查询数据资源','查询数据资源目录','快速查找数据资源、<br>产品能力和相关信息','查找可用数据资源<br>了解数据详情与使用条件'],
      ['policy','blue','file-text-fill','查看政策解读','查看政策解读','获取最新政策文件','获取最新政策文件<br>解读政策要点与适用场景'],
      ['apply','yellow','layout-grid-fill','发起办理','发起数据申请','在线发起申请<br>获取办事指引','在线提交数据使用申请<br>跟踪办理进度']
    ];
    cards.replaceChildren();
    specs.forEach(function (s) {
      var b = node('button', 'hh-card hh-card-' + s[1] + ' hh-service-' + s[0], '<span class="hh-card-ico">' + icon(s[2]) + '</span><span class="hh-card-title"><span class="hh-narrow-copy">' + s[3] + '</span><span class="hh-wide-copy">' + s[4] + '</span><span class="hh-card-arrow">' + icon('arrow-right-s-line') + '</span></span><span class="hh-card-desc"><span class="hh-narrow-copy">' + s[5] + '</span><span class="hh-wide-copy">' + s[6] + '</span></span><span class="hh-card-go">' + icon('arrow-right-line') + '</span>');
      b.type = 'button'; b.dataset.card = s[0];
      b.addEventListener('click', function () { window.HeheAgent.start({consult:'平台有哪些创新服务？',data:'查询数据资源目录',policy:'最新的数字经济政策有哪些？',apply:'如何申请数据资源使用？'}[s[0]]); });
      cards.append(b);
    });
    welcome.append(cards, suggestions);
    main.append(welcome, chatWrap, composer);

    var sidebar = node('aside','hh-sidebar'); sidebar.setAttribute('aria-label','助手导航');
    var brand = node('button','hh-sidebar-brand');
    brand.type='button';brand.dataset.nav='home';brand.setAttribute('aria-label','返回合合助手首页');
    var logo = document.createElement('img'); logo.className='hh-brand-mark';logo.src = new URL('images/hehe-ui/four-color-mark.png',base).href; logo.alt='';
    brand.append(logo,node('span','hh-brand-name','合合助手'),node('em','hh-brand-beta','Beta'));
    sidebar.append(brand);
    var nav = node('nav','hh-side-nav');
    var navItems = [['新建对话','chat-new-line','new'],['历史对话','history-line','history'],['我的收藏','star-line','favorites'],['数据空间','database-2-line','data'],['应用广场','apps-2-line','apps']];
    navItems.forEach(function (item) {
      var b = node('button','hh-nav-item',icon(item[1]) + '<span>' + item[0] + '</span>');
      b.type='button'; b.dataset.nav=item[2]; nav.append(b);
    });
    sidebar.append(nav);
    var miniBanner = node('div','hh-mini-banner','<img src="' + new URL('images/assistant-mascot.png',base).href + '" alt=""><span>让数据创造<br>更美好的北京</span>');
    sidebar.append(miniBanner);
    sidebar.append(node('div','hh-side-footer','<button type="button" data-nav="settings">'+icon('settings-3-line')+'设置</button><button type="button" data-nav="help">'+icon('question-line')+'帮助与反馈</button>'));
    var right = node('aside','hh-right'); right.setAttribute('aria-label','推荐与常用');
    right.innerHTML = '<section class="hh-recommend"><header><h3>'+icon('sparkling-fill')+'热门推荐</h3><button type="button" id="hhHotRefresh">'+icon('refresh-line')+'换一换</button></header><div id="hhHotList"></div></section><section class="hh-frequent"><header><h3>'+icon('shopping-bag-3-fill')+'我的常用</h3><button type="button" id="hhManage">管理</button></header><div id="hhFrequentList"></div></section><img class="hh-city-banner" src="'+new URL('images/hehe-ui/beijing-banner.png',base).href+'" alt="数聚北京 智创未来，打造全球领先的数字创新生态">';
    var hotIndex=0;
    var hotSets=[['北京有哪些人工智能相关的创新服务？','我想查询相关的数据资源目录','如何申请数据资源使用？','最新的数字经济政策有哪些？','帮我生成一份北京数字经济发展报告大纲'],['如何申请入驻创新中心？','公共数据资源有哪些开放条件？','如何跟踪我的申请进度？','企业可以申请哪些创新服务？','算力申请需要准备哪些材料？']];
    function hotRender() {
      var host=right.querySelector('#hhHotList'); host.replaceChildren();
      hotSets[hotIndex].forEach(function(q){ var b=node('button','hh-right-row'); b.type='button'; b.append(document.createTextNode(q),node('span','',icon('arrow-right-s-line'))); b.addEventListener('click',function(){window.HeheAgent.start(q);});host.append(b);});
    }
    hotRender(); right.querySelector('#hhHotRefresh').addEventListener('click',function(){hotIndex=1-hotIndex;hotRender();});
    var editing=false;
    var frequent=[['数据资源目录','database-2-fill','green','查询数据资源目录'],['政策法规库','file-text-fill','orange','查看政策解读'],['申请记录','clipboard-fill','blue','查询我的申请进度'],['收藏内容','star-fill','purple',null]];
    frequent.forEach(function(f){var b=node('button','hh-right-row hh-frequent-row','<span class="hh-small-icon '+f[2]+'">'+icon(f[1])+'</span><span>'+f[0]+'</span>'+icon('arrow-right-s-line'));b.type='button';b.setAttribute('aria-pressed','true');b.addEventListener('click',function(){if(editing){b.classList.toggle('is-muted');b.setAttribute('aria-pressed',String(!b.classList.contains('is-muted')));}else if(f[3])window.HeheAgent.start(f[3]);else showUtility('favorites');});right.querySelector('#hhFrequentList').append(b);});
    right.querySelector('#hhManage').addEventListener('click',function(e){editing=!editing;e.currentTarget.textContent=editing?'完成':'管理';right.classList.toggle('is-editing',editing);right.querySelectorAll('.hh-frequent-row').forEach(function(b){b.hidden=!editing&&b.classList.contains('is-muted');});});

    var shell = node('div','hh-shell'); shell.append(sidebar,main,right); panel.append(shell);
    var utility = node('section','hh-utility'); utility.hidden=true; utility.setAttribute('aria-label','助手功能'); main.insertBefore(utility,composer);
    var attach=node('button','hh-attachment',icon('attachment-2')); attach.type='button';attach.setAttribute('aria-label','添加附件');
    var fileInput=document.createElement('input');fileInput.type='file';fileInput.hidden=true;fileInput.id='hhLocalFile';
    var fileTag=node('div','hh-file-tag');fileTag.hidden=true;
    attach.addEventListener('click',function(){fileInput.click();});
    fileInput.addEventListener('change',function(){fileTag.replaceChildren();if(fileInput.files.length){fileTag.append(document.createTextNode(fileInput.files[0].name));var remove=node('button','',icon('close-line'));remove.type='button';remove.setAttribute('aria-label','移除附件');remove.addEventListener('click',function(){fileInput.value='';fileTag.hidden=true;});fileTag.append(remove);fileTag.hidden=false;}});
    composer.append(attach,fileInput,fileTag);
    document.getElementById('hhDeep').querySelector('svg').outerHTML=icon('node-tree');
    document.getElementById('hhWeb').querySelector('svg').outerHTML=icon('global-line');
    document.getElementById('chatSend').innerHTML=icon('send-plane-fill');

    function syncTop() {
      var navEl=document.getElementById('pageNav')||document.querySelector('.header');
      var bottom=navEl?navEl.getBoundingClientRect().bottom:0;
      panel.style.setProperty('--hh-nav-bottom',Math.max(0,Math.min(bottom,window.innerHeight-180))+'px');
    }
    function setWide(value) {
      wide=value;panel.classList.toggle('hh-is-workbench',wide);
      expand.innerHTML=icon(wide?'collapse-diagonal-line':'expand-diagonal-line')+'<span>'+(wide?'收起工作台':'工作台')+'</span>';
      expand.setAttribute('aria-label',wide?'切换为侧边抽屉':'展开为工作台');expand.title=expand.getAttribute('aria-label');expand.setAttribute('aria-expanded',String(wide));
      input.placeholder=wide?'请输入您的问题，或输入“/”选择技能…':'请输入您的问题';
      syncTop();syncOpen();
    }
    expand.addEventListener('click',function(){setWide(!wide);});
    function syncOpen() {
      var open=panel.classList.contains('open');
      panel.inert=!open;launcher.setAttribute('aria-expanded',String(open));
      document.body.classList.toggle('hh-workbench-open',open&&wide);
      assistant.classList.toggle('open',open);
      if(open) syncTop();
    }
    var wasOpen=panel.classList.contains('open');
    new MutationObserver(function(){var open=panel.classList.contains('open');if(open&&!wasOpen){previousFocus=document.activeElement;setWide(false);}if(!open&&wasOpen&&previousFocus&&previousFocus.isConnected)previousFocus.focus({preventScroll:true});wasOpen=open;syncOpen();}).observe(panel,{attributes:true,attributeFilter:['class']});
    var navEl=document.getElementById('pageNav')||document.querySelector('.header');
    if(navEl)new ResizeObserver(syncTop).observe(navEl);
    window.addEventListener('resize',syncTop);window.addEventListener('scroll',syncTop,{passive:true});
    launcher.setAttribute('role','button');launcher.tabIndex=0;launcher.setAttribute('aria-controls','aiChatPanel');launcher.setAttribute('aria-label','打开合合助手');
    launcher.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();launcher.click();}});
    function syncChat(){var has=stream.children.length>0;panel.classList.toggle('hh-mode-chat',has);panel.classList.toggle('hh-mode-welcome',!has);}
    new MutationObserver(syncChat).observe(stream,{childList:true});
    function hideUtility(){utility.hidden=true;panel.classList.remove('hh-utility-open');nav.querySelectorAll('button').forEach(function(b){b.classList.remove('is-active');});}
    function resetChat(){
      if(stream.children.length)history.unshift({title:(stream.querySelector('.chat-msg.user')||stream).textContent.trim().slice(0,45),nodes:Array.from(stream.childNodes)});
      window.HeheAgent.cancel();stream.replaceChildren();input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));hideUtility();syncChat();input.focus();
    }
    newChat.addEventListener('click',resetChat);
    function showUtility(kind){
      utility.replaceChildren();utility.hidden=false;panel.classList.add('hh-utility-open');
      var labels={history:'历史对话',favorites:'我的收藏',data:'数据空间',apps:'应用广场',settings:'设置',help:'帮助与反馈'};
      utility.append(node('h2','',labels[kind]));
      if(kind==='history'){
        utility.append(node('p','','本次访问中的对话保存在这里。'));
        if(!history.length)utility.append(node('div','hh-empty','还没有历史对话，开始一次新的交流吧。'));
        history.forEach(function(h){var b=node('button','hh-history-item');b.type='button';b.textContent=h.title;b.addEventListener('click',function(){window.HeheAgent.cancel();stream.replaceChildren.apply(stream,h.nodes);hideUtility();syncChat();});utility.append(b);});
      }else if(kind==='favorites')utility.append(node('div','hh-empty','暂无收藏内容'));
      else if(kind==='data'||kind==='apps'){
        utility.append(node('p','',kind==='data'?'查询可用数据资源，了解申请条件。':'选择您想了解的创新服务。'));
        var qs=kind==='data'?['查询公共数据目录','查询企业数据资源','了解数据申请条件']:['平台有哪些创新服务？','如何申请入驻创新中心？','如何申请算力服务？'];
        qs.forEach(function(q){var b=node('button','hh-history-item');b.type='button';b.textContent=q;b.addEventListener('click',function(){hideUtility();window.HeheAgent.start(q);});utility.append(b);});
      }else if(kind==='settings'){
        var b=node('button','hh-history-item','减少界面动效');b.type='button';b.setAttribute('aria-pressed',String(panel.classList.contains('hh-reduce-motion')));b.addEventListener('click',function(){panel.classList.toggle('hh-reduce-motion');b.setAttribute('aria-pressed',String(panel.classList.contains('hh-reduce-motion')));});utility.append(b);
      }else utility.append(node('p','','点击服务卡片或输入问题开始交流。通过右上角“工作台”可以展开助手，再次点击可回到侧边抽屉。按 Esc 或关闭按钮收起助手。'));
      var back=node('button','hh-back','返回合合助手');back.type='button';back.addEventListener('click',hideUtility);utility.append(back);
    }
    sidebar.addEventListener('click',function(e){var b=e.target.closest('[data-nav]');if(!b)return;var key=b.dataset.nav;if(key==='new')resetChat();else if(key==='home')hideUtility();else{showUtility(key);nav.querySelectorAll('button').forEach(function(n){n.classList.toggle('is-active',n===b);});}});
    // Generated answers arrive in the same stream in both sizes.
    new MutationObserver(function(){if(stream.children.length&&panel.classList.contains('hh-utility-open'))hideUtility();}).observe(stream,{childList:true});
    setWide(false);syncChat();syncOpen();
  }
  boot(0);
})();
