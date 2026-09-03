/* Security, storage and rich-text hardening for the HHagent static prototype. */
(function(){
  'use strict';

  var PRIVATE_VALUE_FIELDS=/^(?:password|pwd|passcode|token|accessToken|refreshToken|secret|authorization|cookie|apiKey|api_key|idCard|identityCard|credential|phone|mobile|contact)$/i;
  var PRIVATE_VALUE_LABELS=/(?:联系人|联系电话|手机号|手机号码|身份证|证件号码|密码|令牌|Token|API\s*Key)/i;
  var BLOCKED_STORAGE_KEYS=/^(?:tokenId|accessToken|refreshToken|authorization|apiKey|api_key|secret|password|pwd|IdList|userId|userName)$/i;
  var ASSISTANT_STORAGE_PREFIX='hehe-ui-v2:';

  function scrubPrivate(value){
    if(Array.isArray(value)){
      if(value.length===2&&typeof value[0]==='string'&&PRIVATE_VALUE_LABELS.test(value[0])){
        return [value[0],'（未保存）'];
      }
      return value.map(scrubPrivate);
    }
    if(value&&typeof value==='object'){
      var clean={};
      Object.keys(value).forEach(function(key){
        if(!PRIVATE_VALUE_FIELDS.test(key))clean[key]=scrubPrivate(value[key]);
      });
      return clean;
    }
    if(typeof value==='string'){
      return value
        .replace(/1\d{10}/g,'[手机号未保存]')
        .replace(/\b\d{17}[\dXx]\b/g,'[证件号未保存]');
    }
    return value;
  }

  function sanitizeAssistantStorage(value,key){
    var text=String(value);
    if(key.indexOf(ASSISTANT_STORAGE_PREFIX)!==0)return text;
    try{
      var data=scrubPrivate(JSON.parse(text));
      if(key.indexOf(ASSISTANT_STORAGE_PREFIX+'draft:')===0&&data&&typeof data==='object'&&!data.expiresAt){
        data.expiresAt=Date.now()+8*60*60*1000;
      }
      return JSON.stringify(data);
    }catch(error){
      return scrubPrivate(text);
    }
  }

  function installStorageGuard(){
    if(typeof Storage==='undefined'||Storage.prototype.__hhSafeSetItem)return;
    var nativeSetItem=Storage.prototype.setItem;
    var config=window.__HH_RUNTIME_CONFIG__||{};
    Storage.prototype.setItem=function(key,value){
      var name=String(key);
      if(config.mode==='demo'&&BLOCKED_STORAGE_KEYS.test(name)){
        console.warn('[HHagent] 已阻止演示页写入敏感认证信息：'+name);
        return;
      }
      if(name.indexOf(ASSISTANT_STORAGE_PREFIX)===0){
        return nativeSetItem.call(this,name,sanitizeAssistantStorage(value,name));
      }
      return nativeSetItem.call(this,name,String(value));
    };
    Object.defineProperty(Storage.prototype,'__hhSafeSetItem',{value:true,configurable:false});

    if(config.mode==='demo'){
      ['isLoggedIn','tokenId','IdList','userId'].forEach(function(key){
        try{localStorage.removeItem(key);}catch(error){}
      });
      ['userId','userName'].forEach(function(key){
        try{sessionStorage.removeItem(key);}catch(error){}
      });
    }

    try{
      for(var i=sessionStorage.length-1;i>=0;i-=1){
        var storageKey=sessionStorage.key(i);
        if(storageKey&&storageKey.indexOf(ASSISTANT_STORAGE_PREFIX)===0){
          var current=sessionStorage.getItem(storageKey);
          nativeSetItem.call(sessionStorage,storageKey,sanitizeAssistantStorage(current,storageKey));
        }
      }
    }catch(error){}
  }

  function runtimeNotice(message){
    var live=document.getElementById('hhRuntimeNotice');
    if(!live){
      live=document.createElement('div');
      live.id='hhRuntimeNotice';
      live.className='hh-runtime-notice';
      live.setAttribute('role','status');
      live.setAttribute('aria-live','polite');
      document.body.appendChild(live);
    }
    live.textContent=message;
    live.classList.add('show');
    window.clearTimeout(runtimeNotice.timer);
    runtimeNotice.timer=window.setTimeout(function(){live.classList.remove('show');},3600);
  }

  function installRuntimeStyles(){
    if(document.getElementById('hhRuntimeStyles'))return;
    var style=document.createElement('style');
    style.id='hhRuntimeStyles';
    style.textContent=[
      '.ai-assistant.hehe-dock{z-index:10000!important;}',
      '#heheFab{z-index:10001!important;}',
      '#aiChatPanel.hehe-workbench .hh-demo-banner{display:flex;align-items:flex-start;gap:8px;padding:8px 14px;background:#fff8e8;border-bottom:1px solid #f2dfae;color:#765b20;font-size:11px;line-height:1.5;}',
      '#aiChatPanel.hehe-workbench .hh-demo-banner strong{flex:0 0 auto;padding:1px 6px;border-radius:5px;background:#f7d77f;color:#5c4616;font-size:10px;}',
      '#aiChatPanel.hehe-workbench .hh-danger-row{color:#a84650!important;}',
      '.hh-runtime-notice{position:fixed;left:50%;bottom:24px;z-index:10020;max-width:min(520px,calc(100vw - 32px));padding:10px 14px;border-radius:10px;background:#263552;color:#fff;font:500 13px/1.5 -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;box-shadow:0 8px 24px rgba(20,35,60,.24);opacity:0;visibility:hidden;transform:translate(-50%,12px);transition:.2s ease;}',
      '.hh-runtime-notice.show{opacity:1;visibility:visible;transform:translate(-50%,0);}'
    ].join('');
    document.head.appendChild(style);
  }

  function sanitizeRichText(html){
    var template=document.createElement('template');
    template.innerHTML=String(html==null?'':html);
    var allowedTags=new Set(['A','B','BR','CODE','EM','I','LI','MARK','OL','P','SMALL','SPAN','STRONG','UL']);
    Array.from(template.content.querySelectorAll('*')).forEach(function(element){
      if(!allowedTags.has(element.tagName)){
        element.replaceWith(document.createTextNode(element.textContent||''));
        return;
      }
      Array.from(element.attributes).forEach(function(attribute){
        var name=attribute.name.toLowerCase();
        var allowed=name==='class'||name==='title'||(element.tagName==='A'&&['href','target','rel'].includes(name));
        if(!allowed)element.removeAttribute(attribute.name);
      });
      if(element.tagName==='A'){
        var href=element.getAttribute('href')||'';
        try{
          var url=new URL(href,window.location.href);
          if(!['http:','https:'].includes(url.protocol))element.removeAttribute('href');
        }catch(error){element.removeAttribute('href');}
        if(element.getAttribute('target')==='_blank')element.setAttribute('rel','noopener noreferrer');
      }
    });
    return template.innerHTML;
  }

  function escapeText(value){
    var span=document.createElement('span');
    span.textContent=String(value==null?'':value);
    return span.innerHTML;
  }

  function installUiSanitizer(api){
    var ui=api&&api.ui;
    if(!ui||ui.__hhSanitized)return;
    var originalBotHTML=ui.botHTML;
    if(typeof originalBotHTML==='function'){
      ui.botHTML=function(html,delay){return originalBotHTML(sanitizeRichText(html),delay);};
    }
    if(api.scenarios&&typeof api.scenarios.zero==='function'&&!api.scenarios.zero.__hhSafe){
      var originalZero=api.scenarios.zero;
      var safeZero=function(query){
        var text=String(query==null?'':query);
        return originalZero(/[<>]/.test(text)?escapeText(text):text);
      };
      Object.defineProperty(safeZero,'__hhSafe',{value:true});
      api.scenarios.zero=safeZero;
    }
    Object.defineProperty(ui,'__hhSanitized',{value:true,configurable:false});
  }

  function clearDemoData(){
    try{
      for(var i=sessionStorage.length-1;i>=0;i-=1){
        var key=sessionStorage.key(i);
        if(key&&(key.indexOf('hehe-ui-v2:')===0||key==='heheRemind'))sessionStorage.removeItem(key);
      }
    }catch(error){}
    try{
      ['isLoggedIn','tokenId','IdList','userId'].forEach(function(key){localStorage.removeItem(key);});
    }catch(error){}
    if(window.HeheAgent&&typeof window.HeheAgent.clearDrafts==='function')window.HeheAgent.clearDrafts();
    if(window.HeheV4&&window.HeheV4.state){
      window.HeheV4.state.plan=[];
      if(window.HeheV4.ui&&typeof window.HeheV4.ui.persist==='function')window.HeheV4.ui.persist();
      if(window.HeheV4.ui&&typeof window.HeheV4.ui.renderPlanBar==='function')window.HeheV4.ui.renderPlanBar();
    }
  }

  installStorageGuard();
  installRuntimeStyles();
  window.HeheHardening=Object.freeze({
    installUiSanitizer:installUiSanitizer,
    clearDemoData:clearDemoData,
    runtimeNotice:runtimeNotice
  });
})();