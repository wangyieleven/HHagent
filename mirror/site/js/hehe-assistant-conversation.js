/* Local, rule-based conversational prototype. No model or business API calls. */
(function(){
  'use strict';
  function boot(){
    if(!window.HeheV4||!window.HeheForms){setTimeout(boot,60);return;}
    var api=window.HeheV4,ui=api.ui,scenes=api.scenarios,pending=null,lastInput='',topic='';
    var input=document.getElementById('chatInput'),sendButton=document.getElementById('chatSend');
    function el(tag,cls,text){var n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;}
    function button(label,fn,primary){var b=el('button','v4-btn '+(primary?'primary':'ghost'),label);b.type='button';b.addEventListener('click',function(){fn();});return b;}
    function escape(text){var n=el('span','',String(text));return n.innerHTML;}
    function say(text){ui.botHTML(escape(text).replace(/\n/g,'<br>'),220);}
    function rows(config,values){return config.steps.reduce(function(all,s){return all.concat(typeof s.fields==='function'?s.fields(values):s.fields);},[]);}
    function missing(p){return rows(p.config,p.values).filter(function(f){return f.required&&(p.values[f.key]==null||String(p.values[f.key]).trim()==='');});}
    function dateValue(text){
      var d=new Date(),match=text.match(/(20\d{2})[-年/](\d{1,2})[-月/](\d{1,2})/);
      if(match)return match[1]+'-'+match[2].padStart(2,'0')+'-'+match[3].padStart(2,'0');
      match=text.match(/(\d{1,2})月(\d{1,2})[日号]?/);if(match){d.setMonth(Number(match[1])-1,Number(match[2]));}
      else if(/后天/.test(text))d.setDate(d.getDate()+2);
      else if(/明天/.test(text))d.setDate(d.getDate()+1);
      else if(/今天/.test(text)){}
      else if((match=text.match(/(下|本)?(?:周|星期)([一二三四五六日天])/))){var target='日一二三四五六'.indexOf(match[2]==='天'?'日':match[2]);var delta=target-d.getDay();if(match[1]==='下')delta+=7;else if(delta<0)delta+=7;d.setDate(d.getDate()+delta);}
      else return '';
      return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    }
    function parse(p,text,allowFallback){
      var values=p.values,fields=rows(p.config,values),changed=[];
      function set(key,value){if(value&&fields.some(function(f){return f.key===key;})){values[key]=value;changed.push(key);}}
      var date=dateValue(text);if(date)set('date',date);
      if(/下午/.test(text))set('slot',p.config.key==='visit'?'下午 14:00–16:00':'14:00–17:00');
      else if(/上午/.test(text))set('slot',p.config.key==='visit'?'上午 09:30–11:30':'09:00–12:00');
      var people=text.match(/([一二两三四五六七八九十]|\d+)\s*(?:个)?(?:人|位)/);
      if(people){var digits={'一':1,'二':2,'两':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10};set('number',String(digits[people[1]]||people[1]));}
      var phone=text.match(/1\d{10}/);if(phone)set('phone',phone[0]);
      var contact=text.match(/(?:联系人|联系我|我叫|姓名)[是为：:\s]*([^，,。；;\s\d]{2,8})/);if(contact)set('contact',contact[1]);
      var org=text.match(/(?:单位|公司|机构)(?:名称)?[是为：:\s]+([^，,。；;]+)/);if(org){set('org',org[1].trim());set('company',org[1].trim());}
      var purpose=text.match(/(?:来访目的|目的是|来访想|想来)[：:\s]*([^，,。；;]+)/);if(purpose)set('purpose',purpose[1].trim());
      fields.forEach(function(f){
        if(f.type==='select')f.options.forEach(function(o){if(text.includes(o))set(f.key,o);});
        var label=f.label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
        var match=text.match(new RegExp(label+'[：:]\\s*([^；;\\n]+)'));if(match&&f.type!=='file')set(f.key,match[1].trim());
      });
      if(allowFallback!==false&&!changed.length){var next=missing(p)[0];if(next&&['text','textarea','tel','number'].includes(next.type)){set(next.key,text);}}
      return changed;
    }
    function persist(p){try{sessionStorage.setItem('hehe-ui-v2:draft:'+p.config.key,JSON.stringify({model:p.values,step:0,savedAt:new Date().toISOString()}));}catch(e){}}
    function retire(p){if(p&&p.card){var message=p.card.closest('.chat-msg');if(message)message.remove();else p.card.remove();p.card=null;}}
    function prompt(p){
      var missingFields=missing(p),next=missingFields[0];
      if(!next)return '信息已经整理好了。请打开核对页，确认无误后再提交。';
      if(p.config.key==='visit'){
        var schedule=missingFields.filter(function(f){return ['date','slot','number'].includes(f.key);});
        if(schedule.length)return '您计划哪天来、上午还是下午、大约几位？例如：“下周三下午，5个人”。';
        if(next.key==='org')return '方便告诉我单位名称和联系人吗？手机号也可以一起补充。';
        if(next.key==='purpose')return '这次参观主要想了解什么？比如数据资源合作或创新成果展示。';
      }
      if(next.type==='file')return '还需要一份“'+next.label+'”。请打开核对页选择附件，再确认提交。';
      if(next.type==='select')return '关于“'+next.label+'”，您倾向哪一种？'+next.options.join('、')+'。';
      return '再告诉我'+missingFields.slice(0,2).map(function(f){return f.label;}).join('和')+'，我继续为您整理。';
    }
    function showIntake(p,initial){
      retire(p);
      var remaining=missing(p);
      say((initial?(p.config.key==='visit'?'可以，我来帮您预约参观。\n':'可以，我们先准备'+p.config.title+'所需的信息。\n'):'已记下。\n')+prompt(p));
      var c=ui.card('',null);c.classList.add('hh-agent-inline');
      var filled=rows(p.config,p.values).filter(function(f){return p.values[f.key];});
      if(filled.length){var detail=el('details','hh-collected');detail.appendChild(el('summary','','已整理 '+filled.length+' 项信息'));var list=el('dl','hh-review');filled.forEach(function(f){var r=el('div');r.append(el('dt','',f.label),el('dd','',typeof p.values[f.key]==='object'?p.values[f.key].name:String(p.values[f.key])));list.appendChild(r);});detail.appendChild(list);c.appendChild(detail);}
      var actions=el('div','hh-agent-inline-actions');
      actions.appendChild(button(remaining.length?'打开表单补充':'核对并继续',function(){
        if(p!==pending){say('请继续最新的办理对话，避免使用旧信息。');return;}
        var next=Object.assign({},p.config,{expand:true,collected:p.values,reviewOnly:!missing(p).length,prompt:'核对'+p.config.title+'信息'});retire(p);pending=null;p.open(next);
      },!remaining.length));
      actions.appendChild(button('先不办理',function(){if(p!==pending)return;retire(p);pending=null;say('好的，已填写的信息留作草稿。您可以继续问我其他问题。');}));c.appendChild(actions);p.card=c;ui.botCard(c,260);
    }
    function prepare(config,open){
      retire(pending);
      var saved=null;try{saved=JSON.parse(sessionStorage.getItem('hehe-ui-v2:draft:'+config.key)||'null');}catch(e){}
      pending={config:config,open:open,values:Object.assign({},config.defaults||{},saved?saved.model:{})};
      ui.userSay(config.prompt||config.title);
      if(lastInput)parse(pending,lastInput,false);persist(pending);showIntake(pending,true);
    }
    function detect(text){
      if(/成果.*(合作|对接|推广)|成果对接/.test(text))return ['match'];
      if(/发布场景|找企业共建/.test(text))return ['govPublish'];
      if(/申报|报名.*场景/.test(text))return ['applyProject'];
      if(/资源申请|申请.*(GPU|算力|数据资源)/i.test(text)&&!/(需要|准备|条件|材料|政策)/.test(text))return ['resource'];
      if(/参观|预约看/.test(text))return ['visit'];
      if(/反馈|意见/.test(text))return ['feedback'];
      if(/进度|申请.*(到哪|哪一步)|办理到|待办/.test(text))return ['progress'];
      if(/人工|客服|预约专家|回电/.test(text))return ['handoff'];
      if(/政策|申请.*(准备|材料|条件)|算力.*准备/.test(text))return ['policy'];
      if(/第一次|平台.*(什么|帮)|导览/.test(text))return ['firstvisit'];
      if(/方案|清单|组合/.test(text))return ['bundle'];
      if(/推荐|适合我/.test(text))return ['recommend'];
      if(/多少|目录|教委|部门.*数据/.test(text))return ['catalog'];
      if(/工位|进场|场地|设备/.test(text))return ['chain'];
      if(/完整链路|全流程/.test(text))return ['journey'];
      if(/揭榜/.test(text))return ['juebang',/医疗/.test(text)?'医疗':undefined];
      if(/提供|供给/.test(text))return ['provide'];
      if(/成果|评审|转化|可信空间/.test(text))return ['transform'];
      if(/我的项目|项目工作台/.test(text))return ['project'];
      if(/身份|登录|注册/.test(text))return ['identity'];
      if(/找不到|没找到/.test(text))return ['zero',text];
      if(/找|数据|算力|医疗|交通|组件/.test(text))return ['discover',/GPU|算力/i.test(text)?'算力':/交通|客流/.test(text)?'客流':'医疗'];
      return null;
    }
    function send(text){
      text=String(text||'').trim();if(!text)return;window.HeheIO.ensureOpen();input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));
      if(pending&&/^(取消|先不办|不办了|结束办理)/.test(text)){retire(pending);pending=null;ui.userSay(text);say('好的，我们先停在这里。您还想了解什么？');return;}
      var target=detect(text),newTopic=/^(帮我找|我要查|换个|转人工|查进度|我想预约|我要预约|问一下政策|了解政策)|申请.*(需要准备|需要什么材料)/.test(text);
      if(pending&&!newTopic){ui.userSay(text);parse(pending,text);persist(pending);showIntake(pending,false);return;}
      if(topic==='policy'&&!newTopic&&/^(数据|算力|GPU|云网算)(申请|资源|方面|呢|的|。|？|\s)*$/i.test(text))target=['policy'];
      retire(pending);pending=null;lastInput=text;
      if(target){if(target[0]==='resource')window.HeheForms.resource(/GPU|算力/i.test(text)?'GPU 训练算力':'数据资源');else ui.runPrompt(text,target[0],target[1]);}
      else{ui.userSay(text);say(/你好|您好|hello|hi/i.test(text)?'您好！我是合合。想了解什么，或有什么事需要我帮忙？':'您想找资源、了解办理条件，还是办理一件具体的事？可以直接说，例如“帮我找医疗影像数据”或“我想预约参观”。');}
      lastInput='';
    }
    var fullDiscover=scenes.discover,fullCatalog=scenes.catalog,fullPolicy=scenes.policy,fullRecommend=scenes.recommend;
    scenes.firstvisit=function(){ui.userSay('这个平台能帮我什么？');say('我是合合，陪您使用数智北京创新中心的服务。\n您可以直接说想做什么：找数据和算力、了解政策与材料，或预约参观、跟踪申请。我会先帮您理清需求，必要时再打开办理页面。');};
    scenes.discover=function(kind){
      kind=kind||'医疗';ui.userSay('帮我找'+kind+'资源');say('先为您看这两个方向。您也可以继续告诉我具体用途，我再帮您缩小范围。');
      var c=ui.card('',null);c.classList.add('hh-agent-results');
      var data=kind==='算力'?[['GPU 训练型服务器','适合模型训练，申请时需说明规模和周期'],['模型评测服务','用于模型质量与安全评测']]:kind==='客流'?[['城市交通流量数据集','用于客流预测与交通研究'],['时空预测算法组件','配合交通数据进行模型验证']]:[['脱敏医学影像数据集','用于医学影像算法研发与验证'],['图像预处理组件','用于影像整理、清洗与模型前处理']];
      data.forEach(function(d){var item=el('div','hh-agent-resource');item.append(el('strong','',d[0]),el('p','',d[1]),button('帮我申请',function(){window.HeheForms.resource(d[0]);}));c.appendChild(item);});
      c.appendChild(el('small','hh-field-hint','预置资源示例，实际供给与授权条件以平台为准。'));
      c.appendChild(button('查看更多匹配资源',function(){fullDiscover(kind);}));ui.botCard(c,260);
    };
    scenes.policy=function(){
      topic='policy';ui.userSay('申请资源需要准备什么？');var compute=/算力|GPU|云网算/i.test(lastInput),data=/数据/.test(lastInput);
      say(compute?'可以，先为您整理算力申请的材料要点：\n1. 项目名称与训练、推理等具体用途；\n2. GPU / 存储等资源规格、数量和使用周期；\n3. 申请机构、联系人及相关方案材料。\n这是原型材料清单，正式要求以平台办理指南为准。':data?'数据资源申请可以先准备：\n1. 项目名称、数据用途和所需字段范围；\n2. 使用周期、数据安全措施与相关方案；\n3. 申请机构和负责人的联系方式。\n这是原型材料清单，实际开放范围与授权条件以平台为准。':'申请前，需要明确项目用途、资源规模和使用周期，并准备机构、联系人与相关方案材料。\n您想了解数据申请，还是算力申请？');
      var c=ui.card('',null);c.classList.add('hh-agent-inline');
      if(compute||data)c.appendChild(button('帮我准备'+(compute?'算力':'数据')+'申请',function(){window.HeheForms.resource(compute?'GPU 训练算力':'数据资源');}));
      c.appendChild(button('查看政策与材料示例',fullPolicy));ui.botCard(c,260);
    };
    scenes.catalog=function(){if(/教委|医疗|交通|部门/.test(lastInput)){fullCatalog();return;}ui.userSay('查询数据目录');say('可以按部门、行业或具体资源查询。比如“市教委有哪些数据集”或“医疗领域有哪些开放数据”。');var c=ui.card('',null);c.classList.add('hh-agent-inline');c.appendChild(button('展开目录统计示例',fullCatalog));ui.botCard(c,260);};
    scenes.recommend=function(){ui.userSay('推荐适合我的服务');say('您目前主要做什么方向，最需要数据、算力，还是合作场景？先告诉我需求，推荐会更有针对性。');var c=ui.card('',null);c.classList.add('hh-agent-inline');c.appendChild(button('调整推荐偏好',fullRecommend));ui.botCard(c,260);};
    document.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('#chatSend')){e.preventDefault();e.stopImmediatePropagation();send(input.value);}},true);
    document.addEventListener('keydown',function(e){if(e.target===input&&e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();e.stopImmediatePropagation();send(input.value);}},true);
    window.HeheAgent={send:send,start:function(text){retire(pending);pending=null;topic='';send(text);},prepare:prepare,cancel:function(){retire(pending);pending=null;topic='';}};
  }boot();
})();
