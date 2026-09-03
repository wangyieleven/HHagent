/* Loads the hardening layer before the conversation-first layout. */
(function(){
  'use strict';
  var current=document.currentScript;
  var source=current&&current.src?new URL(current.src,window.location.href):new URL('./js/hehe-assistant-layout.js',window.location.href);
  var base=new URL('.',source);
  var version=source.search||'';

  function load(name,ready){
    if(ready&&ready())return Promise.resolve();
    return new Promise(function(resolve,reject){
      var script=document.createElement('script');
      script.src=new URL(name,base).href+version;
      script.defer=true;
      script.onload=resolve;
      script.onerror=function(){reject(new Error('无法加载 '+name));};
      document.head.appendChild(script);
    });
  }

  load('hehe-assistant-hardening.js',function(){return !!window.HeheHardening;})
    .then(function(){return load('hehe-assistant-layout-core.js');})
    .catch(function(error){
      console.error('[HHagent] layout modules failed to load.',error);
      var disclaimer=document.getElementById('heheDisclaimer');
      if(disclaimer)disclaimer.textContent='合合助手加载失败，请刷新页面后重试';
    });
})();