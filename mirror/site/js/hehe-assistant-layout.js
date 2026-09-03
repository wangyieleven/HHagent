/* Conversation first. Service navigation stays available inside More. */
(function(){
  'use strict';
  function boot(){
    if(!window.HeheV4||!window.HeheIO){setTimeout(boot,60);return;}
    var panel=document.getElementById('aiChatPanel');if(!panel||panel.classList.contains('hehe-workbench'))return;
    var assistant=panel.closest('.ai-assistant'),stream=document.getElementById('chatStream'),input=document.getElementById('chatInput');
    var tabs=document.getElementById('chatTabs'),cards=document.getElementById('chatCards'),scenario=document.getElementById('scenarioRow');
    var reset=document.getElementById('chatReset'),mode='welcome',anchor=null,follow=true,frame=0,lastTask=null,seen=new WeakSet();
    function node(tag,cls,text){var n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;}
    function button(text,cls,fn){var b=node('button',cls,text);b.type='button';b.addEventListener('click',fn);return b;}
    assistant.classList.add('hehe-dock');panel.classList.add('hehe-workbench','hehe-conversation-first');
    panel.setAttribute('role','region');panel.setAttribute('aria-label','合合助手');
    var mascot='./images/assistant-mascot.png';
    panel.querySelector('.chat-logo').replaceChildren(Object.assign(document.createElement('img'),{src:mascot,alt:'合合助手吉祥物'}));
    panel.querySelector('.chat-sub').textContent='您的创新服务伙伴';
    var fab=document.getElementById('heheFab');if(fab){fab.setAttribute('aria-label','打开合合助手');fab.querySelector('img').src=mascot;}
    var legacy=assistant.querySelector('.mascot-wrap');if(legacy)legacy.removeAttribute('aria-hidden');
    input.setAttribute('aria-label','向合合助手提问');input.placeholder='找资源、问政策、说说您想办的事…';
    reset.setAttribute('aria-label','新对话');reset.title='新对话';
    var start=node('section','hh-start');start.setAttribute('aria-label','开始与合合对话');
    var greeting=node('div','hh-intro');
    greeting.innerHTML='<img src="'+mascot+'" alt="合合助手吉祥物"><div><h2>Hi，我是合合</h2><p>很高兴为您服务。<br>说说您的需求，我们一起把事情办好。</p></div>';
    start.appendChild(greeting);
    var suggestions=node('section','hh-suggestions'),suggestHead=node('div','hh-suggestion-head'),questions=node('div','hh-question-list'),batch=0;
    var questionSets=[['我们做医疗影像，能找到哪些数据？','想预约参观创新中心，怎么安排？','帮我看看申请办理到哪一步了'],['我第一次来，这个平台能帮我什么？','申请算力资源需要准备什么？','我们有创新成果，想找合作场景']];
    function send(text){if(window.HeheAgent)window.HeheAgent.start(text);else{input.value=text;input.dispatchEvent(new Event('input',{bubbles:true}));document.getElementById('chatSend').click();}}
    function renderQuestions(){questions.replaceChildren();questionSets[batch].forEach(function(q){var b=button(q,'hh-question',function(){send(q);});b.insertAdjacentHTML('beforeend',window.HeheV4.icon('arrowR'));questions.appendChild(b);});}
    suggestHead.append(node('h3','','可以这样问我'),button('换一组','hh-link-button',function(){batch=(batch+1)%questionSets.length;renderQuestions();}));
    suggestions.append(suggestHead,questions);start.appendChild(suggestions);renderQuestions();
    var recent=node('section','hh-recent'),recentHead=node('div','hh-suggestion-head'),recentList=node('div','hh-recent-list'),recentQueries=[];
    recentHead.append(node('h3','','最近聊过'),button('清空','hh-link-button',function(){recentQueries=[];renderRecent();}));recent.append(recentHead,recentList);start.appendChild(recent);
    function renderRecent(){recent.hidden=!recentQueries.length;recentList.replaceChildren();recentQueries.slice(0,3).forEach(function(q){recentList.appendChild(button(q,'hh-recent-item',function(){send(q);}));});}
    var resume=button('继续当前对话','hh-resume',function(){setMode('conversation');scheduleScroll();});start.appendChild(resume);
    panel.insertBefore(start,stream);
    var menu=node('section','hh-menu');menu.setAttribute('aria-label','更多能力与记录');
    var menuHead=node('div','hh-suggestion-head');menuHead.append(node('h2','','更多'),button('返回对话','hh-link-button',function(){setMode(stream.children.length?'conversation':'welcome');}));menu.appendChild(menuHead);
    var context=document.getElementById('chatContext');menu.appendChild(context);
    var identity=context.querySelector('[title="点击切换身份"]');if(identity){identity.setAttribute('role','button');identity.tabIndex=0;identity.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();identity.click();}});}
    var menuActions=node('div','hh-menu-actions');
    [['我的办理记录','progress'],['我的创新方案','bundle'],['身份与偏好','identity']].forEach(function(x){menuActions.appendChild(button(x[0],'hh-menu-row',function(){window.HeheV4.run(x[1]);}));});menu.appendChild(menuActions);
    var plan=document.getElementById('hehePlanBar');if(plan)menu.appendChild(plan);
    var serviceDetails=node('details','hh-service-details');serviceDetails.appendChild(node('summary','','查看服务范围 · 21个场景'));serviceDetails.appendChild(scenario);menu.appendChild(serviceDetails);
    var capability=node('details','hh-service-details');capability.appendChild(node('summary','','按能力浏览'));
    var heading=node('h3','hh-cards-label','问平台');capability.append(tabs,heading,cards);menu.appendChild(capability);
    panel.insertBefore(menu,stream);
    var more=button('更多','chat-btn hh-entry-button',function(){setMode(mode==='menu'?(stream.children.length?'conversation':'welcome'):'menu');});more.setAttribute('aria-label','更多能力与记录');panel.querySelector('.chat-actions').prepend(more);
    var taskbar=node('div','hh-taskbar'),taskInfo=node('div','hh-task-info'),taskTitle=node('strong'),taskStep=node('span');taskInfo.append(taskTitle,taskStep);
    taskbar.append(taskInfo,button('回到对话','hh-link-button',function(){setMode('conversation');}));panel.insertBefore(taskbar,stream);
    stream.replaceChildren();stream.setAttribute('role','region');stream.setAttribute('aria-label','问答内容');stream.tabIndex=0;
    var footer=node('div','hh-footer'),quick=node('div','hh-chat-tools');
    [['找资源','帮我找合适的数据资源','search'],['问政策','申请算力资源需要准备什么','doc'],['帮我办','我想办一件事','brief']].forEach(function(x){var b=button(x[0],'hh-chat-tool',function(){send(x[1]);});b.insertAdjacentHTML('afterbegin',window.HeheV4.icon(x[2]));quick.appendChild(b);});
    var jump=button('查看最新回复','hh-link-button hh-jump',function(){follow=true;anchor=stream.lastElementChild;scheduleScroll();});jump.hidden=true;
    footer.append(jump,quick,panel.querySelector('.chat-input-bar'));var disclaimer=document.getElementById('heheDisclaimer');if(disclaimer){disclaimer.textContent='本地交互原型 · 未连接真实 AI 与业务系统';footer.appendChild(disclaimer);}panel.appendChild(footer);
    function setMode(next){mode=next;panel.dataset.view=next;start.hidden=next!=='welcome';menu.hidden=next!=='menu';stream.hidden=next==='welcome'||next==='menu';taskbar.hidden=next!=='task';resume.hidden=!stream.children.length;more.setAttribute('aria-expanded',String(next==='menu'));jump.hidden=true;renderRecent();}
    function syncTabs(){var active=tabs.querySelector('.active');if(active)heading.textContent=active.textContent;tabs.querySelectorAll('.chat-tab').forEach(function(t,i){t.id='hhCapability'+i;t.tabIndex=t===active?0:-1;t.setAttribute('aria-controls','chatCards');});if(active)cards.setAttribute('aria-labelledby',active.id);}
    tabs.addEventListener('click',syncTabs);tabs.addEventListener('keydown',function(e){if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key))return;var list=Array.from(tabs.querySelectorAll('.chat-tab')),i=list.indexOf(document.activeElement);if(i<0)return;e.preventDefault();var step=e.key==='ArrowDown'?3:e.key==='ArrowUp'?-3:e.key==='ArrowLeft'?-1:1;var next=e.key==='Home'?0:e.key==='End'?list.length-1:(i+step+list.length)%list.length;list[next].click();list[next].focus();});syncTabs();
    function scheduleScroll(){if(frame)cancelAnimationFrame(frame);frame=requestAnimationFrame(function(){frame=0;if(!['conversation','task'].includes(mode)||!follow||!anchor||!anchor.isConnected)return;stream.scrollTop+=anchor.getBoundingClientRect().top-stream.getBoundingClientRect().top-14;jump.hidden=true;});}
    window.HeheLayoutScroll=scheduleScroll;window.HeheIO.scrollStream=scheduleScroll;
    document.addEventListener('hehe:task-complete',function(){setMode('conversation');});
    stream.addEventListener('wheel',function(){follow=false;},{passive:true});stream.addEventListener('touchstart',function(){follow=false;},{passive:true});
    new MutationObserver(function(mutations){
      var added=mutations.some(function(m){return Array.from(m.addedNodes).some(function(n){return n.nodeType===1&&n.classList.contains('chat-msg');});});
      stream.querySelectorAll('.chat-msg.user').forEach(function(m){if(seen.has(m))return;seen.add(m);anchor=m;follow=true;setMode('conversation');var bubble=m.querySelector('.msg-bubble'),q=(bubble?bubble.textContent:m.textContent).trim();if(q.length>5&&q.length<65&&!/\d{8}|联系人|手机号|联系电话/.test(q)&&/(?:[?？]|^(帮我|我想|我要|申请|查询|推荐|找|了解|我们|这个平台))/.test(q)){recentQueries=recentQueries.filter(function(t){return t!==q;});recentQueries.unshift(q);recentQueries=recentQueries.slice(0,3);}});
      stream.querySelectorAll('.chat-msg.bot').forEach(function(m){m.classList.toggle('hh-continuation',!!(m.previousElementSibling&&m.previousElementSibling.classList.contains('bot')));var a=m.querySelector('.msg-avatar');if(a&&!a.hasAttribute('aria-label')){a.textContent='';a.setAttribute('role','img');a.setAttribute('aria-label','合合助手吉祥物');}});
      var last=stream.lastElementChild,active=last&&last.querySelector('.hh-flow');
      stream.querySelectorAll('.hh-task-message').forEach(function(m){if(m!==last)m.classList.remove('hh-task-message');});
      if(active){last.classList.add('hh-task-message');taskTitle.textContent=active.dataset.taskTitle||'核对办理信息';var step=active.querySelector('.hh-step-summary,.w-step.cur .w-label');taskStep.textContent=step?step.textContent:'填写与核对';if(active!==lastTask){lastTask=active;setMode('task');anchor=last;follow=true;added=true;}}
      if(added&&follow)scheduleScroll();else if(added)jump.hidden=!['conversation','task'].includes(mode);
    }).observe(stream,{childList:true,subtree:true});
    reset.addEventListener('click',function(){window.HeheConversationVersion=(window.HeheConversationVersion||0)+1;if(window.HeheAgent)window.HeheAgent.cancel();stream.replaceChildren();anchor=null;lastTask=null;follow=true;input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));setMode('welcome');});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&mode==='menu'){setMode(stream.children.length?'conversation':'welcome');more.focus();}});
    setMode('welcome');
  }boot();
})();
