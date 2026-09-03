/* Normalizes common natural-language field expressions before submit. */
(function(window,document){
  'use strict';

  function normalize(value){
    return String(value||'')
      .replace(/(^|[，,；;\s])((?:单位|机构)(?:名称)?)(?![是为叫：:\s])(?=[^，,。；;]{2,40}(?:[，,。；;]|$))/g,'$1$2：')
      .replace(/(^|[，,；;\s])(公司(?:名称)?)(?![是为叫：:\s])(?=[^，,。；;]{2,40}(?:[，,。；;]|$))/g,'$1$2：');
  }

  function normalizeComposer(){
    var input=document.getElementById('chatInput');
    if(!input)return;
    var next=normalize(input.value);
    if(next!==input.value){
      input.value=next;
      input.dispatchEvent(new Event('input',{bubbles:true}));
    }
  }

  /* Window capture runs before the conversation module's document capture listener. */
  window.addEventListener('click',function(event){
    if(event.target&&event.target.closest&&event.target.closest('#chatSend'))normalizeComposer();
  },true);
  window.addEventListener('keydown',function(event){
    if(event.target&&event.target.id==='chatInput'&&event.key==='Enter'&&!event.shiftKey&&!event.isComposing)normalizeComposer();
  },true);

  window.HeheInputNormalizer=Object.freeze({normalize:normalize,normalizeComposer:normalizeComposer});
})(window,document);
