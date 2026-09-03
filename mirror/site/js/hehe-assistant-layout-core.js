/* Conversation-first layout and accessibility behavior. */
(function(){
  'use strict';

  var bootAttempts=0;
  var MAX_BOOT_ATTEMPTS=150;

  function bootFailure(){
    var disclaimer=document.getElementById('heheDisclaimer');
    if(disclaimer)disclaimer.textContent='合合助手加载失败，请刷新页面后重试';
    console.error('[HHagent] layout module dependencies were not ready.');
  }

  function boot(){
    if(!window.HeheV4||!window.HeheIO||!window.HeheHardening){
      bootAttempts+=1;
      if(bootAttempts>MAX_BOOT_ATTEMPTS){bootFailure();return;}
      setTimeout(boot,60);
      return;
    }

    var panel=document.getElementById('aiChatPanel');
    if(!panel||panel.classList.contains('hehe-workbench'))return;

    var assistant=panel.closest('.ai-assistant');
    var stream=document.getElementById('chatStream');
    var input=document.getElementById('chatInput');
    var tabs=document.getElementById('chatTabs');
    var cards=document.getElementById('chatCards');
    var scenario=document.getElementById('scenarioRow');
    var reset=document.getElementById('chatReset');
    var context=document.getElementById('chatContext');

    if(!assistant||!stream||!input||!tabs||!cards||!scenario||!reset||!context){
      bootFailure();
      return;
    }

    var hardening=window.HeheHardening;
    hardening.installUiSanitizer(window.HeheV4);

    var mode='welcome',anchor=null,follow=true,frame=0,lastTask=null,seen=new WeakSet();
    function node(tag,cls,text){var n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;}
    function button(text,cls,fn){var b=node('button',cls,text);b.type='button';b.addEventListener('click',fn);return b;}
    assistant.classList.add('hehe-dock');
    panel.classList.add('hehe-workbench','hehe-conversation-first');
    panel.setAttribute('role','region');
    panel.setAttribute('aria-label','合合助手');
    panel.setAttribute('aria-hidden',String(!panel.classList.contains('open')));

    var mascot='./images/assistant-mascot.png';
    var chatLogo=panel.querySelector('.chat-logo');
    if(chatLogo)chatLogo.replaceChildren(Object.assign(document.createElement('img'),{src:mascot,alt:'合合助手吉祥物'}));
    var chatSub=panel.querySelector('.chat-sub');
    if(chatSub)chatSub.textContent='您的创新服务伙伴';

    var fab=document.getElementById('heheFab');
    if(fab){
      fab.setAttribute('aria-label','打开合合助手');
      fab.setAttribute('aria-controls','aiChatPanel');
      fab.setAttribute('aria-expanded',String(panel.classList.contains('open')));
      var fabImage=fab.querySelector('img');
      if(fabImage)fabImage.src=mascot;
    }

    var legacy=assistant.querySelector('.mascot-wrap');
    if(legacy)legacy.removeAttribute('aria-hidden');
    input.setAttribute('aria-label','向合合助手提问');
    input.placeholder='找资源、问政策、说说您想办的事…';
    reset.setAttribute('aria-label','新对话');
    reset.title='新对话';

    var start=node('section','hh-start');
    start.setAttribute('aria-label','开始与合合对话');
    var greeting=node('div','hh-intro');
    greeting.innerHTML='<img src="'+mascot+'" alt="合合助手吉祥物"><div><h2>Hi，我是合合</h2><p>很高兴为您服务。<br>说说您的需求，我们一起把事情办好。</p></div>';
    start.appendChild(greeting);

    var suggestions=node('section','hh-suggestions');
    var suggestHead=node('div','hh-suggestion-head');
    var questions=node('div','hh-question-list');
    var batch=0;
    var questionSets=[
      ['我们做医疗影像，能找到哪些数据？','想预约参观创新中心，怎么安排？','帮我看看申请办理到哪一步了'],
      ['我第一次来，这个平台能帮我什么？','申请算力资源需要准备什么？','我们有创新成果，想找合作场景']
    ];
    function send(text){
      if(window.HeheAgent)window.HeheAgent.start(text);
      else{
        input.value=text;
        input.dispatchEvent(new Event('input',{bubbles:true}));
        var sendButton=document.getElementById('chatSend');
        if(sendButton)sendButton.click();
      }
    }
    function renderQuestions(){
      questions.replaceChildren();
      questionSets[batch].forEach(function(q){
        var b=button(q,'hh-question',function(){send(q);});
        b.insertAdjacentHTML('beforeend',window.HeheV4.icon('arrowR'));
        questions.appendChild(b);
      });
    }
    suggestHead.append(node('h3','','可以这样问我'),button('换一组','hh-link-button',function(){
      batch=(batch+1)%questionSets.length;renderQuestions();
    }));
    suggestions.append(suggestHead,questions);
    start.appendChild(suggestions);
    renderQuestions();

    var recent=node('section','hh-recent');
    var recentHead=node('div','hh-suggestion-head');
    var recentList=node('div','hh-recent-list');
    var recentQueries=[];
    recentHead.append(node('h3','','最近聊过'),button('清空','hh-link-button',function(){recentQueries=[];renderRecent();}));
    recent.append(recentHead,recentList);
    start.appendChild(recent);
    function renderRecent(){
      recent.hidden=!recentQueries.length;
      recentList.replaceChildren();
      recentQueries.slice(0,3).forEach(function(q){
        recentList.appendChild(button(q,'hh-recent-item',function(){send(q);}));
      });
    }

    var resume=button('继续当前对话','hh-resume',function(){setMode('conversation');scheduleScroll();});
    start.appendChild(resume);
    panel.insertBefore(start,stream);

    var demoBanner=node('div','hh-demo-banner');
    demoBanner.setAttribute('role','note');
    demoBanner.append(node('strong','','演示环境'),node('span','','未连接真实 AI、身份认证、上传或审批系统；请勿录入真实敏感信息。'));
    panel.insertBefore(demoBanner,start);

    var menu=node('section','hh-menu');
    menu.setAttribute('aria-label','更多能力与记录');
    var menuHead=node('div','hh-suggestion-head');
    var menuTitle=node('h2','','更多');
    menuTitle.tabIndex=-1;
    menuHead.append(menuTitle,button('返回对话','hh-link-button',function(){setMode(stream.children.length?'conversation':'welcome');}));
    menu.appendChild(menuHead);
    menu.appendChild(context);

    var identity=context.querySelector('[title="点击切换身份"]');
    if(identity){
      identity.setAttribute('role','button');
      identity.tabIndex=0;
      identity.addEventListener('keydown',function(e){
        if(e.key==='Enter'||e.key===' '){e.preventDefault();identity.click();}
      });
    }

    var menuActions=node('div','hh-menu-actions');
    [['我的办理记录','progress'],['我的创新方案','bundle'],['身份与偏好','identity']].forEach(function(x){
      menuActions.appendChild(button(x[0],'hh-menu-row',function(){window.HeheV4.run(x[1]);}));
    });
    menuActions.appendChild(button('清除本次演示数据','hh-menu-row hh-danger-row',function(){
      if(!window.confirm('将清除本次会话中的草稿、办理记录、身份缓存和创新方案。确定继续吗？'))return;
      hardening.clearDemoData();
      recentQueries=[];
      reset.click();
      hardening.runtimeNotice('本次演示数据已清除。');
    }));
    menu.appendChild(menuActions);

    var plan=document.getElementById('hehePlanBar');
    if(plan)menu.appendChild(plan);
    var serviceDetails=node('details','hh-service-details');
    serviceDetails.appendChild(node('summary','','查看服务范围 · 21个场景'));
    serviceDetails.appendChild(scenario);
    menu.appendChild(serviceDetails);

    var capability=node('details','hh-service-details');
    capability.appendChild(node('summary','','按能力浏览'));
    var heading=node('h3','hh-cards-label','问平台');
    capability.append(tabs,heading,cards);
    menu.appendChild(capability);
    panel.insertBefore(menu,stream);

    var more=button('更多','chat-btn hh-entry-button',function(){
      setMode(mode==='menu'?(stream.children.length?'conversation':'welcome'):'menu');
    });
    more.setAttribute('aria-label','更多能力与记录');
    more.setAttribute('aria-controls','hhAssistantMenu');
    menu.id='hhAssistantMenu';
    var chatActions=panel.querySelector('.chat-actions');
    if(chatActions)chatActions.prepend(more);

    var taskbar=node('div','hh-taskbar');
    var taskInfo=node('div','hh-task-info');
    var taskTitle=node('strong'),taskStep=node('span');
    taskInfo.append(taskTitle,taskStep);
    taskbar.append(taskInfo,button('回到对话','hh-link-button',function(){setMode('conversation');}));
    panel.insertBefore(taskbar,stream);

    stream.replaceChildren();
    stream.setAttribute('role','log');
    stream.setAttribute('aria-label','问答内容');
    stream.setAttribute('aria-live','polite');
    stream.setAttribute('aria-relevant','additions text');
    stream.tabIndex=0;

    var footer=node('div','hh-footer'),quick=node('div','hh-chat-tools');
    [['找资源','帮我找合适的数据资源','search'],['问政策','申请算力资源需要准备什么','doc'],['帮我办','我想办一件事','brief']].forEach(function(x){
      var b=button(x[0],'hh-chat-tool',function(){send(x[1]);});
      b.insertAdjacentHTML('afterbegin',window.HeheV4.icon(x[2]));
      quick.appendChild(b);
    });

    var jump=button('查看最新回复','hh-link-button hh-jump',function(){
      follow=true;anchor=stream.lastElementChild;scheduleScroll();
    });
    jump.hidden=true;
    var inputBar=panel.querySelector('.chat-input-bar');
    footer.append(jump,quick);
    if(inputBar)footer.appendChild(inputBar);

    var disclaimer=document.getElementById('heheDisclaimer');
    if(disclaimer){
      disclaimer.textContent='演示原型 · AI 生成及业务结果均需结合来源和正式系统核验';
      footer.appendChild(disclaimer);
    }
    panel.appendChild(footer);

    function setMode(next){
      mode=next;
      panel.dataset.view=next;
      start.hidden=next!=='welcome';
      menu.hidden=next!=='menu';
      stream.hidden=next==='welcome'||next==='menu';
      taskbar.hidden=next!=='task';
      resume.hidden=!stream.children.length;
      more.setAttribute('aria-expanded',String(next==='menu'));
      jump.hidden=true;
      renderRecent();
      if(next==='menu')window.requestAnimationFrame(function(){menuTitle.focus();});
    }

    function syncTabs(){
      tabs.setAttribute('role','tablist');
      cards.setAttribute('role','tabpanel');
      var active=tabs.querySelector('.active');
      if(active)heading.textContent=active.textContent;
      tabs.querySelectorAll('.chat-tab').forEach(function(tab,i){
        tab.id='hhCapability'+i;
        tab.setAttribute('role','tab');
        tab.tabIndex=tab===active?0:-1;
        tab.setAttribute('aria-selected',String(tab===active));
        tab.setAttribute('aria-controls','chatCards');
      });
      if(active)cards.setAttribute('aria-labelledby',active.id);
    }

    tabs.addEventListener('click',syncTabs);
    tabs.addEventListener('keydown',function(e){
      if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key))return;
      var list=Array.from(tabs.querySelectorAll('.chat-tab'));
      var i=list.indexOf(document.activeElement);
      if(i<0)return;
      e.preventDefault();
      var step=e.key==='ArrowDown'?3:e.key==='ArrowUp'?-3:e.key==='ArrowLeft'?-1:1;
      var next=e.key==='Home'?0:e.key==='End'?list.length-1:(i+step+list.length)%list.length;
      list[next].click();
      list[next].focus();
    });
    syncTabs();

    function scheduleScroll(){
      if(frame)cancelAnimationFrame(frame);
      frame=requestAnimationFrame(function(){
        frame=0;
        if(!['conversation','task'].includes(mode)||!follow||!anchor||!anchor.isConnected)return;
        stream.scrollTop+=anchor.getBoundingClientRect().top-stream.getBoundingClientRect().top-14;
        jump.hidden=true;
      });
    }

    function addedMessages(mutations){
      var result=[];
      mutations.forEach(function(mutation){
        Array.from(mutation.addedNodes).forEach(function(added){
          if(added.nodeType!==1)return;
          if(added.classList.contains('chat-msg'))result.push(added);
          added.querySelectorAll&&added.querySelectorAll('.chat-msg').forEach(function(message){result.push(message);});
        });
      });
      return Array.from(new Set(result));
    }

    function processUserMessage(message){
      if(seen.has(message))return;
      seen.add(message);
      anchor=message;follow=true;setMode('conversation');
      var bubble=message.querySelector('.msg-bubble');
      var q=(bubble?bubble.textContent:message.textContent).trim();
      if(q.length>5&&q.length<65&&!/\d{8}|联系人|手机号|联系电话/.test(q)&&/(?:[?？]|^(帮我|我想|我要|申请|查询|推荐|找|了解|我们|这个平台))/.test(q)){
        recentQueries=recentQueries.filter(function(item){return item!==q;});
        recentQueries.unshift(q);
        recentQueries=recentQueries.slice(0,3);
      }
    }

    function processBotMessage(message){
      if(seen.has(message))return;
      seen.add(message);
      message.classList.toggle('hh-continuation',!!(message.previousElementSibling&&message.previousElementSibling.classList.contains('bot')));
      var avatar=message.querySelector('.msg-avatar');
      if(avatar&&!avatar.hasAttribute('aria-label')){
        avatar.textContent='';
        avatar.setAttribute('role','img');
        avatar.setAttribute('aria-label','合合助手吉祥物');
      }
    }

    window.HeheLayoutScroll=scheduleScroll;
    window.HeheIO.scrollStream=scheduleScroll;
    document.addEventListener('hehe:task-complete',function(){setMode('conversation');});
    stream.addEventListener('wheel',function(){follow=false;},{passive:true});
    stream.addEventListener('touchstart',function(){follow=false;},{passive:true});

    var streamObserver=new MutationObserver(function(mutations){
      var messages=addedMessages(mutations);
      messages.forEach(function(message){
        if(message.classList.contains('user'))processUserMessage(message);
        else if(message.classList.contains('bot'))processBotMessage(message);
      });

      var last=stream.lastElementChild;
      var active=last&&last.querySelector('.hh-flow');
      if(lastTask&&lastTask!==active){
        var oldMessage=lastTask.closest('.chat-msg');
        if(oldMessage)oldMessage.classList.remove('hh-task-message');
      }
      if(active){
        last.classList.add('hh-task-message');
        taskTitle.textContent=active.dataset.taskTitle||'核对办理信息';
        var step=active.querySelector('.hh-step-summary,.w-step.cur .w-label');
        taskStep.textContent=step?step.textContent:'填写与核对';
        if(active!==lastTask){
          lastTask=active;
          setMode('task');
          anchor=last;
          follow=true;
        }
      }

      var added=messages.length>0||!!active;
      if(added&&follow)scheduleScroll();
      else if(messages.length)jump.hidden=!['conversation','task'].includes(mode);
    });
    streamObserver.observe(stream,{childList:true,subtree:true});

    var panelObserver=new MutationObserver(function(){
      var open=panel.classList.contains('open');
      panel.setAttribute('aria-hidden',String(!open));
      if(fab)fab.setAttribute('aria-expanded',String(open));
    });
    panelObserver.observe(panel,{attributes:true,attributeFilter:['class']});

    reset.addEventListener('click',function(){
      window.HeheConversationVersion=(window.HeheConversationVersion||0)+1;
      if(window.HeheAgent)window.HeheAgent.cancel();
      stream.replaceChildren();
      anchor=null;lastTask=null;follow=true;
      input.value='';
      input.dispatchEvent(new Event('input',{bubbles:true}));
      setMode('welcome');
    });

    document.addEventListener('keydown',function(e){
      if(e.key==='Escape'&&mode==='menu'){
        setMode(stream.children.length?'conversation':'welcome');
        more.focus();
      }
    });
    setMode('welcome');
  }

  boot();
})();