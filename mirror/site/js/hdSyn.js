/* Privacy-preserving analytics compatibility layer for the HHagent prototype. */
(function(window,document){
  'use strict';

  var config=window.__HH_RUNTIME_CONFIG__||{};
  var startedAt=Date.now();
  var pageViewId=createId('pv');

  function createId(prefix){
    if(window.crypto&&typeof window.crypto.randomUUID==='function')return prefix+'-'+window.crypto.randomUUID();
    return prefix+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);
  }

  function sameOriginEndpoint(value){
    if(!value||typeof value!=='string')return '';
    try{
      var url=new URL(value,window.location.origin);
      return url.origin===window.location.origin?url.pathname+url.search:'';
    }catch(error){return '';}
  }

  var endpoint=sameOriginEndpoint(config.hdSynEndpoint||'');
  var enabled=config.mode!=='demo'&&config.enableHdSyn===true&&!!endpoint;
  var privateKeys=/^(?:password|pwd|passcode|token|accessToken|refreshToken|secret|authorization|cookie|apiKey|api_key|idCard|identityCard|credential|phone|mobile|contact|user|userId|userName|userAccount)$/i;

  function scrub(value,depth){
    depth=depth||0;
    if(depth>4)return '[truncated]';
    if(Array.isArray(value))return value.slice(0,30).map(function(item){return scrub(item,depth+1);});
    if(value&&typeof value==='object'){
      var clean={};
      Object.keys(value).slice(0,50).forEach(function(key){
        if(!privateKeys.test(key))clean[key]=scrub(value[key],depth+1);
      });
      return clean;
    }
    if(typeof value==='string'){
      return value.slice(0,500)
        .replace(/1\d{10}/g,'[redacted-phone]')
        .replace(/\b\d{17}[\dXx]\b/g,'[redacted-id]');
    }
    return value;
  }

  function eventName(params){
    var raw=params&&(params.event_name||params['X-Log-Event']);
    if(!raw)return 'custom';
    var name=String(raw).trim();
    if(name.toLowerCase()==='pageview')return 'pageView';
    if(name.toLowerCase()==='pageleave')return 'pageLeave';
    return name.slice(0,80);
  }

  function send(params){
    if(!enabled)return Promise.resolve(false);
    var name=eventName(params||{});
    var payload={
      eventId:createId('evt'),
      eventName:name,
      pageViewId:pageViewId,
      path:window.location.pathname,
      title:document.title||'',
      recordedAt:new Date().toISOString(),
      durationMs:name==='pageLeave'?Math.max(0,Date.now()-startedAt):undefined,
      properties:scrub(params&&params.event_properties?params.event_properties:params||{},0)
    };
    return fetch(endpoint,{
      method:'POST',
      credentials:'same-origin',
      keepalive:true,
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload)
    }).then(function(response){return response.ok;}).catch(function(){return false;});
  }

  window.xSend=send;
  window.commonHdSyn={
    enabled:enabled,
    send:send,
    pageViewId:pageViewId
  };

  if(!enabled)return;
  send({event_name:'pageView'});
  window.addEventListener('pagehide',function(){send({event_name:'pageLeave'});},{once:true});
})(window,document);
