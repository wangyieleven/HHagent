/* v8 picmatch layout: a static welcome view that mirrors the design
   reference. The base markup now lives directly in aiChatPanel; this
   module only wires interactive behaviours and removes the legacy
   conversation-first shims that would otherwise overwrite the header
   or inject extra regions. */
(function(){
  'use strict';

  var bootAttempts=0;
  var MAX_BOOT_ATTEMPTS=150;

  function bootFailure(){
    var disclaimer=document.getElementById('hhPicDisclaimer');
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
    if(!panel||panel.classList.contains('hehe-picmatch-bound'))return;

    var stream=document.getElementById('chatStream');
    var input=document.getElementById('chatInput');
    var sendBtn=document.getElementById('chatSend');
    var questionsHost=document.getElementById('hhPicQuestions');
    var refreshBtn=document.getElementById('hhRefresh');
    var deepBtn=document.getElementById('hhDeep');
    var webBtn=document.getElementById('hhWeb');

    if(!panel||!stream||!input||!sendBtn||!questionsHost){bootFailure();return;}

    panel.classList.add('hehe-workbench');
    panel.setAttribute('role','region');
    panel.setAttribute('aria-label','合合助手');
    panel.setAttribute('aria-hidden',String(!panel.classList.contains('open')));
    panel.classList.add('hehe-picmatch-bound');

    var hardening=window.HeheHardening;
    if(hardening.installUiSanitizer)hardening.installUiSanitizer(window.HeheV4);

    var batch=0;
    var questionSets=[
      ['北京有哪些可申请的创新服务?','我想查找人工智能相关的数据集','如何申请入驻创新中心?'],
      ['数据资源目录里有哪些热门数据集?','算力申请需要准备哪些材料?','如何跟踪我的申请进度?']
    ];
    function sendText(text){
      if(!text)return;
      if(window.HeheAgent)window.HeheAgent.start(text);
      else{
        input.value=text;
        input.dispatchEvent(new Event('input',{bubbles:true}));
        sendBtn.click();
      }
    }
    function renderQuestions(){
      questionsHost.replaceChildren();
      questionSets[batch].forEach(function(q){
        var b=document.createElement('button');
        b.type='button';
        b.className='hh-question';
        b.textContent=q;
        b.addEventListener('click',function(){sendText(q);});
        questionsHost.appendChild(b);
      });
    }
    renderQuestions();
    if(refreshBtn)refreshBtn.addEventListener('click',function(){
      batch=(batch+1)%questionSets.length;
      renderQuestions();
    });

    var cards=document.querySelectorAll('#hhPicCards .hh-card');
    cards.forEach(function(card){
      card.addEventListener('click',function(){
        var map={
          consult:'您好!我可以帮您解答创新服务相关的问题,请问您想了解什么?',
          data:'您好!请告诉我您要找的数据方向(例如医疗、交通、教育等),我帮您匹配数据资源。',
          apply:'您好!我可以帮您发起办理,请告诉我您想办的具体事项。'
        };
        sendText(map[card.getAttribute('data-card')]||card.querySelector('.hh-card-title').firstChild.textContent.trim());
      });
    });

    function toggleChip(btn){
      if(!btn)return;
      var active=btn.getAttribute('aria-pressed')==='true';
      btn.setAttribute('aria-pressed',String(!active));
      btn.classList.toggle('is-on',!active);
    }
    if(deepBtn)deepBtn.addEventListener('click',function(){toggleChip(deepBtn);});
    if(webBtn)webBtn.addEventListener('click',function(){toggleChip(webBtn);});

    input.setAttribute('aria-label','向合合助手提问');
    input.placeholder='请输入您的问题';
    sendBtn.setAttribute('aria-label','发送');

    function syncSendState(){
      sendBtn.disabled=!input.value.trim();
    }
    input.addEventListener('input',syncSendState);
    syncSendState();

    stream.setAttribute('role','log');
    stream.setAttribute('aria-label','问答内容');
    stream.setAttribute('aria-live','polite');
    stream.setAttribute('aria-relevant','additions text');

    function updateInputBarVisibility(){
      var hasMessages=stream.children.length>0;
      panel.classList.toggle('hh-mode-chat',hasMessages);
      panel.classList.toggle('hh-mode-welcome',!hasMessages);
    }
    updateInputBarVisibility();

    var streamObserver=new MutationObserver(function(mutations){
      var added=0;
      mutations.forEach(function(mutation){
        Array.from(mutation.addedNodes).forEach(function(node){
          if(node.nodeType!==1)return;
          if(node.classList&&node.classList.contains('chat-msg')){added+=1;}
          if(node.querySelectorAll){
            var messages=node.querySelectorAll('.chat-msg');
            added+=messages.length;
          }
        });
      });
      if(added)updateInputBarVisibility();
    });
    streamObserver.observe(stream,{childList:true,subtree:true});

    var panelObserver=new MutationObserver(function(){
      var open=panel.classList.contains('open');
      panel.setAttribute('aria-hidden',String(!open));
    });
    panelObserver.observe(panel,{attributes:true,attributeFilter:['class']});

    var closeBtn=document.getElementById('closeChat');
    var closeX=document.getElementById('closeChatX');
    function closePanel(){
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden','true');
    }
    if(closeBtn)closeBtn.addEventListener('click',closePanel);
    if(closeX)closeX.addEventListener('click',closePanel);
  }

  boot();
})();
