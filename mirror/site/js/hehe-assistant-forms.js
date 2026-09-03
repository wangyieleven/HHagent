/* Shared, local-only prototype workflows. No submission or upload endpoint. */
(function () {
  'use strict';
  function boot() {
    if (!window.HeheV4) { setTimeout(boot,60); return; }
    var api=window.HeheV4, ui=api.ui, scenes=api.scenarios, seq=0;
    var prefix='hehe-ui-v2:', originalProgress=scenes.progress;
    function read(key,fallback) { try { return JSON.parse(sessionStorage.getItem(prefix+key))||fallback; } catch(e) { return fallback; } }
    function write(key,value) { try { sessionStorage.setItem(prefix+key,JSON.stringify(value));return true; } catch(e) { return false; } }
    function remove(key) { try { sessionStorage.removeItem(prefix+key); } catch(e) {} }
    function el(tag,cls,text) { var n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n; }
    function button(label,cls,fn) { var n=el('button','v4-btn '+(cls||''),label);n.type='button';n.addEventListener('click',fn);return n; }
    function localDate() { var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
    function field(key,label,type,opts) { return Object.assign({key:key,label:label,type:type||'text',required:true},opts||{}); }
    function select(key,label,options,opts) { return field(key,label,'select',Object.assign({options:options},opts)); }
    var contact=[field('contact','联系人'),field('phone','联系电话','tel',{hint:'请输入 11 位手机号，仅用于本地原型演示。'})];
    function flow(config) {
      if(window.HeheAgent&&!config.expand)return window.HeheAgent.prepare(config,flow);
      if(config.requireLegal&&api.state.role!=='legal') {
        ui.userSay(config.title);var gate=ui.card('办理前 · 身份确认',null);
        gate.appendChild(el('p','','此事项需以企业或机构身份办理。当前为演示环境，切换身份不会进行真实认证。'));
        gate.appendChild(button('切换为法人身份（演示）','primary',function(){ui.setRole('legal',true);flow(config);}));
        gate.appendChild(button('先浏览资源','ghost',function(){api.run('discover');}));ui.botCard(gate,160);return gate;
      }
      ui.userSay(config.prompt||config.title);
      var saved=read('draft:'+config.key,null);
      var model=Object.assign({},config.defaults||{},saved?saved.model:{},config.collected||{});
      var cur=config.reviewOnly?config.steps.length:saved?Math.min(saved.step,config.steps.length):0, complete=false, controls=[];
      var c=ui.card(config.title,null);c.classList.add('hh-flow');c.dataset.taskTitle=config.title;
      var body=el('div'), status=el('div','hh-form-status');status.setAttribute('role','status');
      status.textContent=saved?'已恢复本次会话草稿 · 可继续填写':'原型演示 · 草稿只保存在当前浏览器会话，不会提交真实业务。';
      c.append(status,body);
      var id='hhForm'+(++seq);
      function fieldsAt(index) { var fields=config.steps[index].fields;return typeof fields==='function'?fields(model):fields; }
      function allFields() { return config.steps.reduce(function(all,_,i){return all.concat(fieldsAt(i));},[]); }
      function invalid(f) {
        var v=model[f.key];
        if(f.required && (v==null||String(v).trim()===''||(Array.isArray(v)&&!v.length)))return '请填写'+f.label;
        if(!v)return '';
        if(f.type==='tel'&&!/^1\d{10}$/.test(v))return '请输入正确的 11 位手机号';
        if(f.type==='number'&&(!Number.isFinite(Number(v))||Number(v)<(f.min==null?1:f.min)||!Number.isInteger(Number(v))))return '请输入不小于 '+(f.min==null?1:f.min)+' 的整数';
        if(f.type==='select'&&!f.options.includes(v))return '请选择有效的'+f.label;
        if(f.type==='date'&&(!/^\d{4}-\d{2}-\d{2}$/.test(v)||Number.isNaN(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v))return '请选择有效日期';
        if(f.type==='date'&&v<localDate())return '请选择今天或之后的日期';
        if(f.max&&String(v).length>f.max)return '最多填写 '+f.max+' 字';
        if(f.type==='file'&&v&&!v.demo&&!v.live)return '请重新选择附件；刷新后不会保留文件内容';
        return '';
      }
      function cache(manual) {
        var clean=Object.assign({},model);
        allFields().filter(function(f){return f.type==='file';}).forEach(function(f){if(clean[f.key])clean[f.key]=Object.assign({},clean[f.key],{live:false});});
        var ok=write('draft:'+config.key,{model:clean,step:cur,savedAt:new Date().toISOString()});
        if(manual){status.className='hh-form-status '+(ok?'success':'error');status.textContent=ok?'草稿已保存 · 下次从同一入口打开可继续':'浏览器存储不可用，请保留当前页面继续填写';}
        return ok;
      }
      function showError(control,message) {
        control.input.setAttribute('aria-invalid',message?'true':'false');
        control.error.textContent=message;control.error.hidden=!message;
      }
      function validate() {
        var first;
        controls.forEach(function(control){var error=invalid(control.field);showError(control,error);if(error&&!first)first=control.input;});
        if(first){status.className='hh-form-status error';status.textContent='还有信息需要完善，请检查下方标记的字段。';first.focus();first.scrollIntoView({block:'nearest'});return false;}
        return true;
      }
      function inputFor(f) {
        var wrap=el('div','sf-field'), head=el('div','f-head'), label=el('label',f.required?'req':'',f.label), input;
        label.htmlFor=id+'-'+f.key;head.appendChild(label);wrap.appendChild(head);
        if(f.type==='select') {
          input=el('select');input.appendChild(new Option('请选择'+f.label,''));
          f.options.forEach(function(o){input.appendChild(new Option(o,o));});
        } else if(f.type==='textarea')input=el('textarea');
        else { input=el('input');input.type=f.type; }
        input.id=label.htmlFor;input.setAttribute('aria-label',f.label);
        input.required=!!f.required;input.setAttribute('aria-required',String(!!f.required));
        if(f.type==='file')input.accept=f.accept||'.pdf,.doc,.docx,.ppt,.pptx,.png,.jpg';
        else input.value=model[f.key]||'';
        if(f.placeholder)input.placeholder=f.placeholder;
        if(f.max)input.maxLength=f.max;
        if(f.type==='number'){input.min=f.min||1;input.step='1';}
        if(f.type==='date')input.min=localDate();
        if(f.type==='tel'){input.inputMode='tel';input.maxLength=11;}
        var error=el('p','hh-field-error');error.id=input.id+'-error';error.hidden=true;error.setAttribute('role','alert');
        var hint=el('small','hh-field-hint',f.type==='file'?'支持 PDF / Word / PPT / 图片，最大 20MB。仅选择本地文件，不上传。':f.hint||'');hint.id=input.id+'-hint';
        input.setAttribute('aria-describedby',hint.id+' '+error.id);
        var control={field:f,input:input,error:error};controls.push(control);
        input.addEventListener('input',function(){
          if(f.type==='select'||f.type==='file')return;
          if(f.type!=='file')model[f.key]=input.value;
          showError(control,'');cache(false);
        });
        input.addEventListener('change',function(){
          if(config.key==='provide'&&f.key==='type'&&model.type!==input.value)delete model.specific;
          if(f.type==='file') {
            var file=input.files[0];
            if(file&&(file.size>20*1024*1024||!(/\.(pdf|docx?|pptx?|png|jpe?g)$/i.test(file.name)))) {
              model[f.key]=null;input.value='';showError(control,'请选择支持格式的文件，且不超过 20MB');fileName.textContent='尚未选择附件';return;
            }
            model[f.key]=file?{name:file.name,live:true,demo:false}:null;
            fileName.textContent=file?'已选择：'+file.name:'尚未选择附件';
          } else model[f.key]=input.value;
          showError(control,'');cache(false);if(f.refresh)render();
        });
        wrap.append(input,hint,error);
        if(f.type==='file') {
          var fileName=el('p','hh-field-hint',model[f.key]?(model[f.key].demo?'演示附件：':'需重新选择：')+model[f.key].name:'尚未选择附件');
          wrap.appendChild(fileName);
          wrap.appendChild(button('使用演示附件','ghost',function(){
            model[f.key]={name:'演示材料.pdf',demo:true,live:false};input.required=false;
            fileName.textContent='已使用演示材料.pdf · 仅用于原型走查';showError(control,'');cache(false);
          }));
        }
        return wrap;
      }
      function advance(next) {
        cur=next;cache(false);
        status.className='hh-form-status';status.textContent='填写进度已暂存 · 可返回修改，提交前会再次核对。';
        render();
        requestAnimationFrame(function(){
          var stream=document.getElementById('chatStream');if(c.isConnected)stream.scrollTop+=c.getBoundingClientRect().top-stream.getBoundingClientRect().top-12;
        });
      }
      function render() {
        body.replaceChildren();controls=[];
        var steps=el('div','v4-wiz');steps.setAttribute('aria-label','办理进度');
        config.steps.map(function(s){return s.label;}).concat(['确认提交']).forEach(function(label,i){
          var s=el('div','w-step'+(i<cur?' done':i===cur?' cur':''));
          if(i===cur)s.setAttribute('aria-current','step');
          s.append(el('span','w-dot',String(i+1)),el('span','w-label',label));steps.appendChild(s);
        });body.appendChild(steps);
        if(cur<config.steps.length) {
          var grid=el('div','hh-form-grid');fieldsAt(cur).forEach(function(f){
            var control=inputFor(f);
            if(['textarea','file'].includes(f.type)||/^(company|org|project|resource|name|title|scene|type|direction|department|qualification|keyword)$/.test(f.key))control.classList.add('hh-field-wide');
            grid.appendChild(control);
          });body.appendChild(grid);
        } else {
          status.className='hh-form-status';status.textContent='请核对以下信息。确认后仅生成本地演示回执，可在进度查询中找到。';
          var review=el('dl','hh-review');
          allFields().forEach(function(f){var row=el('div'),value=model[f.key];row.append(el('dt','',f.label),el('dd','',f.type==='file'?(value?value.name+(value.demo?'（演示）':'（本地选择）'):'未提供'):(value||'未填写')));review.appendChild(row);});
          body.appendChild(review);
        }
        var actions=el('div','v4-btnrow hh-form-actions');
        if(cur>0)actions.appendChild(button('上一步','ghost',function(){advance(cur-1);}));
        actions.appendChild(button('保存草稿','ghost',function(){cache(true);}));
        if(saved)actions.appendChild(button('清除草稿','ghost',function(){
          remove('draft:'+config.key);model=Object.assign({},config.defaults||{});cur=0;saved=null;render();
          status.className='hh-form-status';status.textContent='草稿已清除，已恢复为空白表单。';
        }));
        var next=button(cur===config.steps.length?'确认提交（演示）':'下一步','primary',function(){
          if(complete)return;
          if(cur<config.steps.length){if(validate())advance(cur+1);return;}
          var bad=allFields().find(function(f){return invalid(f);});
          if(bad){cur=config.steps.findIndex(function(_,i){return fieldsAt(i).some(function(f){return f.key===bad.key;});});render();validate();return;}
          complete=true;next.disabled=true;next.textContent='正在生成回执…';
          remove('draft:'+config.key);
          var record=makeRecord(config.title,model,allFields());
          if(config.onComplete){config.onComplete(record,model);updateRecordStatus(record.no,record.status);}
          c.replaceChildren();c.classList.remove('hh-flow');delete c.dataset.taskTitle;
          c.append(el('h3','hh-receipt-heading','演示提交成功'),el('p','',record.saved?'信息已记录在本次浏览器会话，可随时查询。':'浏览器存储不可用，请保留当前回执；刷新后无法恢复。'));
          c.appendChild(el('strong','hh-receipt-number',record.no));
          c.appendChild(button('查看本次办理进度','primary',function(){showRecord(record);}));
          c.appendChild(el('p','hh-field-hint','未发送至真实业务系统，不代表正式受理或审核通过。'));
          document.dispatchEvent(new CustomEvent('hehe:task-complete'));
        });actions.appendChild(next);body.appendChild(actions);
      }
      render();ui.botCard(c,160);
      return c;
    }
    function makeRecord(title,model,fields) {
      var record={no:'HH'+localDate().replace(/-/g,'')+'-'+Date.now().toString(36).toUpperCase(),title:title,time:new Date().toLocaleString('zh-CN'),status:'待受理（演示）',fields:fields.map(function(f){var value=model[f.key];return [f.label,f.type==='file'?(value?value.name:'未提供'):value||'未填写'];})};
      var records=read('records',[]);records.unshift(record);record.saved=write('records',records.slice(0,50));return record;
    }
    function showRecord(record) {
      record=read('records',[]).find(function(r){return r.no===record.no;})||record;
      ui.userSay('查看 '+record.no+' 的办理进度');
      var c=ui.card(record.title,null);c.appendChild(el('strong','hh-receipt-number',record.no));
      c.appendChild(ui.timeline([{state:'done',title:'已生成演示回执',time:record.time,desc:'本次填写的信息已记录。'},{state:'cur',title:record.status,desc:'没有连接真实审核系统，后续状态不会自动变为通过。'},{state:'',title:'处理结果',desc:'正式接入后由业务系统同步。'}]));
      var details=el('details','hh-steps-details');details.appendChild(el('summary','','查看提交信息'));var list=el('dl','hh-review');record.fields.forEach(function(f){var row=el('div');row.append(el('dt','',f[0]),el('dd','',String(f[1])));list.appendChild(row);});details.appendChild(list);c.appendChild(details);ui.botCard(c,160);
    }
    function updateRecordStatus(no,status) {
      if(!no)return;var records=read('records',[]);
      records.forEach(function(r){if(r.no===no)r.status=status;});write('records',records);
    }
    scenes.progress=function(){
      var records=read('records',[]);if(!records.length)return originalProgress();
      ui.userSay('查看我的办理进度');var c=ui.card('本次会话的办理记录',null);
      c.appendChild(el('p','hh-field-hint','以下为本地演示记录，不表示正式受理。'));
      records.forEach(function(r){var b=button(r.title+' · '+r.status,'',function(){showRecord(r);});b.style.width='100%';b.style.marginBottom='8px';c.appendChild(b);});
      c.appendChild(button('查看预置补材料示例','ghost',originalProgress));ui.botCard(c,160);
    };
    originalProgress=function(){
      ui.userSay('查看预置办理示例');var c=ui.card('进度查询 · 演示申请',null);
      c.appendChild(el('p','hh-form-status','以下为预置示例，与您本次提交的记录分开展示。'));
      ['企业入驻申请','云网算力资源申请'].forEach(function(title,i){
        c.appendChild(button(title+' · '+read('example-status-'+i,i===0?'待补材料':'业务审核中'),'ghost',function(){showExample(title,i);}));
      });
      c.appendChild(button('项目验收提醒 · 上报进度','ghost',function(){flow({key:'acceptance',title:'项目验收进度上报',steps:[{label:'本期进展',fields:[field('project','项目名称'),field('progress','完成情况','textarea'),field('next','下期计划','textarea'),field('attachment','阶段材料','file')]}]});}));ui.botCard(c,160);
    };
    function showExample(title,index){
      ui.userSay('查看'+title+'示例');var c=ui.card(title+' · 预置演示',null),status=read('example-status-'+index,index===0?'待补材料':'业务审核中');
      c.appendChild(ui.timeline([{title:'申请提交',state:'done',desc:'预置演示数据'},{title:'形式审查',state:'done'},{title:status,state:'cur',desc:status==='待补材料'?'请补充营业执照与企业简介。':'该状态仅用于展示审批流程。'},{title:'处理结果',state:''}]));
      if(status==='待补材料')c.appendChild(button('补充材料','primary',function(){flow({key:'example-materials-'+index,title:title+'补充材料',steps:[{label:'补充附件',fields:[field('license','营业执照附件','file'),field('profile','企业简介','textarea')]}],onComplete:function(){write('example-status-'+index,'材料已补 · 审核中');}});}));
      if(status!=='已撤回')c.appendChild(button('撤回申请','ghost',function(){flow({key:'example-withdraw-'+index,title:'撤回'+title,steps:[{label:'撤回原因',fields:[select('reason','撤回理由',['填写信息有误','不再申请','材料暂不齐全','其他']),field('note','补充说明','textarea',{required:false})]}],onComplete:function(){write('example-status-'+index,'已撤回');}});}));
      c.appendChild(button('刷新当前进度','ghost',function(){showExample(title,index);}));ui.botCard(c,160);
    }
    scenes.visit=function(){return flow({key:'visit',title:'预约参观',prompt:'我要预约参观',steps:[
      {label:'参观安排',fields:[field('date','预约日期','date'),select('slot','参观时段',['上午 09:30–11:30','下午 14:00–16:00']),field('number','来访人数','number')]},
      {label:'来访信息',fields:[field('org','单位名称')].concat(contact,[field('purpose','来访目的','textarea',{max:200,placeholder:'希望了解的内容、合作方向等'})])}
    ]});};
    scenes.feedback=function(){return flow({key:'feedback',title:'需求反馈',steps:[
      {label:'描述需求',fields:[field('title','需求标题','text',{max:50}),select('direction','所属方向',['数据资源','云网算资源','组件资源','场景合作','政策咨询','其他服务']),field('description','问题描述','textarea',{max:500,hint:'建议说明具体表现、发生时间与影响范围，便于运营定位。'})]},
      {label:'联系方式',fields:contact}
    ]});};
    function resource(name) {return flow({key:'resource:'+(name||'new'),title:'资源申请',requireLegal:true,prompt:'申请'+(name||'资源'),defaults:{resource:name||'',type:/、|数据.*算力/.test(name||'')?'组合资源':/GPU|算力|云|存储/.test(name||'')?'云网算资源':name?'数据资源':''},steps:[
      {label:'选择资源',fields:[select('type','资源类型',['数据资源','云网算资源','组件资源','组合资源']),field('resource','资源名称','text',{placeholder:'填写目录中的资源名称'})]},
      {label:'项目需求',fields:[field('project','项目名称'),select('purpose','申请用途',['算法训练','数据分析','产品研发','评测验证']),field('period','预计使用周期'),field('spec','资源数量 / 规格','textarea',{max:500})]},
      {label:'材料与联系',fields:contact.concat([field('attachment','方案附件','file',{required:false})])}
    ]});}
    scenes.applyProject=function(sceneName){return flow({key:'applyProject',title:'场景创新项目申报',requireLegal:true,defaults:{scene:typeof sceneName==='string'?sceneName:''},steps:[
      {label:'企业信息',fields:[field('scene','申报场景'),field('company','企业名称')].concat(contact,[field('qualification','企业资质','text',{required:false})])},
      {label:'产品研发',fields:[field('product','产品和服务','textarea',{max:1000}),field('researchers','研发人员数量','number')]},
      {label:'方案材料',fields:[field('implementation','实施方案','textarea',{max:1500}),field('technical','技术方案','textarea',{max:1500}),field('innovation','创新点','textarea',{max:500}),field('attachment','方案附件','file')]}
    ]});};
    scenes.provide=function(){return flow({key:'provide',title:'提供创新资源',requireLegal:true,steps:[
      {label:'资源类型',fields:[select('type','提供类型',['数据','组件','场景','应用','服务']),field('name','资源名称')]},
      {label:'资源详情',fields:function(m){
        var specifics={数据:field('specific','数据范围与更新频率','textarea'),组件:field('specific','接口方式与技术依赖','textarea'),场景:field('specific','业务痛点与预期目标','textarea'),应用:field('specific','应用功能与适用对象','textarea'),服务:field('specific','服务内容与交付标准','textarea')};
        return [field('description','资源介绍','textarea',{max:1000}),specifics[m.type]||specifics.数据,field('attachment','说明材料','file',{required:false})];}},
      {label:'提供方',fields:[field('company','提供单位')].concat(contact)}
    ]});};
    scenes.govPublish=function(){return flow({key:'govPublish',title:'发布场景需求',requireLegal:true,steps:[
      {label:'场景信息',fields:[field('title','场景名称'),select('direction','所属领域',['智慧交通','医疗健康','城市治理','公共服务','其他']),field('department','发布单位')]},
      {label:'目标要求',fields:[field('problem','业务痛点','textarea',{max:1000}),field('goal','预期目标','textarea',{max:1000}),field('acceptance','验收指标','textarea',{max:500}),field('period','建设周期')]},
      {label:'联系材料',fields:contact.concat([field('attachment','需求附件','file',{required:false})])}
    ]});};
    scenes.match=function(industry){
      ui.userSay('为我的创新成果匹配合作场景');
      var c=ui.card('成果对接 · 选择合作方向',null), selected='';c.classList.add('hh-flow');c.dataset.taskTitle='成果对接';
      var medical=industry==='医疗';
      c.appendChild(el('p','', '以'+(medical?'医疗影像辅助诊断产品':'城市交通智能调度平台')+'为例，以下匹配度为演示数据。选择后可核对对接材料。'));
      var candidates=medical?['医学影像辅助诊断 · 医院','肺部影像模型验证 · 医学研究团队','体检筛查辅助服务 · 体检机构','医疗数据治理 · 健康服务机构']:['交通信号优化 · 市交通委','公交运力调度 · 市交通委','重点区域客流预测 · 商圈运营方','城市治理 · 区级城管部门'];
      seq++;
      candidates.forEach(function(name,i){var row=el('label','hh-choice'),radio=el('input');radio.type='radio';radio.name='match-'+seq;radio.value=name;radio.addEventListener('change',function(){selected=name;next.disabled=false;});row.append(radio,el('span','',name+' · '+[89,84,78,72][i]+'%'));c.appendChild(row);});
      var next=button('核对对接材料','primary',function(){flow({key:'match',title:'成果对接申请',defaults:{direction:selected},steps:[{label:'对接信息',fields:[field('direction','合作方向'),field('achievement','成果名称'),field('reason','场景匹配说明','textarea'),field('attachment','成果介绍附件','file')]},{label:'联系方式',fields:contact}]});});next.disabled=true;c.appendChild(next);ui.botCard(c,160);
    };
    scenes.handoff=function(reason){return flow({key:'handoff',title:'人工协同',defaults:{summary:reason||''},steps:[
      {label:'选择方式',fields:[select('way','协助方式',['在线咨询','预约回电','预约专家']),field('summary','问题摘要','textarea',{max:1000,hint:'请核对将交给人工的内容，不会自动传送全部聊天记录。'})]},
      {label:'联系安排',fields:function(m){return contact.concat(m.way==='在线咨询'?[]:[field('date','预约日期','date'),select('slot','预约时段',['09:00–12:00','14:00–17:00'])]);}}
    ]});};
    scenes.bundle=function(){
      ui.userSay('查看我的创新方案');var c=ui.card('我的创新方案',null),body=el('div');c.appendChild(body);
      var suggestions=[['数据资源','脱敏医学影像数据集'],['云网算资源','GPU 训练算力'],['组件资源','图像预处理组件'],['服务','数据合规评估'],['服务','模型测试服务']];
      var picked=new Set(),undo=null;
      function render(){
        body.replaceChildren();
        if(!api.state.plan.length){
          body.appendChild(el('p','','方案还没有资源。可先勾选医疗影像示例，也可按自己的方向寻找。'));
          suggestions.forEach(function(s){var label=el('label','hh-choice'),input=el('input');input.type='checkbox';input.checked=picked.has(s[1]);input.addEventListener('change',function(){if(input.checked)picked.add(s[1]);else picked.delete(s[1]);add.disabled=!picked.size;});label.append(input,el('span','',s[1]+' · '+s[0]));body.appendChild(label);});
          var add=button('加入我的方案','primary',function(){api.state.plan=suggestions.filter(function(s){return picked.has(s[1]);}).map(function(s){return {type:s[0],name:s[1]};});ui.persist();ui.renderPlanBar();render();});add.disabled=!picked.size;body.appendChild(add);
        } else {
          body.appendChild(el('p','hh-form-status','已选择 '+api.state.plan.length+' 项资源 · 可继续添加或申请'));
          api.state.plan.forEach(function(p){var row=el('div','m-item');var info=el('div','',p.name);info.style.flex='1';info.appendChild(el('small','hh-field-hint',p.type));row.append(info,button('移除','ghost',function(){api.state.plan=api.state.plan.filter(function(x){return x!==p;});ui.persist();ui.renderPlanBar();render();}));body.appendChild(row);});
          body.appendChild(el('p','hh-form-status','前置检查：'+(api.state.role==='legal'?'法人身份已选择（演示）':'需切换法人身份')+'。数据授权、资源配额与服务开通须由真实业务系统核验。'));
          body.appendChild(button('批量申请','primary',function(){resource(api.state.plan.map(function(p){return p.name;}).join('、'));}));
          body.appendChild(button('清空方案','ghost',function(){undo=api.state.plan.slice();api.state.plan=[];ui.persist();ui.renderPlanBar();render();}));
        }
        body.appendChild(button('继续找资源','ghost',function(){api.run('discover');}));
        if(undo)body.appendChild(button('撤销清空','ghost',function(){api.state.plan=undo;undo=null;ui.persist();ui.renderPlanBar();render();}));
      }render();ui.botCard(c,160);
    };
    scenes.chain=function(){
      ui.userSay('办理场地、人员与设备进场');var c=ui.card('链式办理',null),body=el('div');c.appendChild(body);
      var state=read('chain',['未申请','待前置','待前置']);
      var names=['工位 / 场地','人员进场','设备进场'];
      function render(){
        body.replaceChildren();body.appendChild(el('p','hh-form-status','场地审核通过后办理人员，人员通过后办理设备。提交申请不等于审核通过。'));
        names.forEach(function(name,i){
          var section=el('div','m-item'),info=el('div');info.style.flex='1';info.append(el('strong','',name),el('small','hh-field-hint',state[i]));section.appendChild(info);
          if(state[i]==='待审核')section.appendChild(button('模拟审核通过','ghost',function(){state[i]='已通过（演示）';if(i<2)state[i+1]='可申请';write('chain',state);updateRecordStatus(read('chain-record-'+i,''),'已通过（演示）');render();}));
          else if(!state[i].includes('通过')){var apply=button('申请','primary',function(){
            flow({key:'chain-'+i,title:name+'申请',requireLegal:true,steps:[{label:'申请信息',fields:i===0?[field('quantity','工位数量','number'),field('date','开始日期','date'),field('period','使用周期')]:i===1?[field('people','进场人员与岗位','textarea'),field('date','进场日期','date')]:[field('devices','设备清单与用途','textarea'),field('date','进场日期','date')]},{label:'联系材料',fields:contact.concat([field('attachment','证明材料','file',{required:false})])}],onComplete:function(record){state[i]='待审核';record.status='待审核（演示）';write('chain-record-'+i,record.no);write('chain',state);render();}});
          });apply.disabled=state[i]==='待前置';section.appendChild(apply);}
          body.appendChild(section);
        });body.appendChild(el('p','hh-field-hint','“模拟审核通过”仅用于体验原型的依赖关系，不产生正式审批结果。'));
      }render();ui.botCard(c,160);
    };
    scenes.transform=function(){
      ui.userSay('查看成果转化进度');var c=ui.card('成果转化 · 阶段与材料',null),body=el('div');c.appendChild(body);
      var names=['可信空间开发','开发过程上报','产品上架申请','第三方质量测试','专家评审','成果推广'];
      var state=read('transform',{step:2,pending:false});
      function render(){
        body.replaceChildren();body.appendChild(el('p','hh-form-status','当前阶段：'+names[state.step]+' · '+(state.pending?'材料待审核':'待准备材料')+'（演示）'));
        var details=el('details','hh-steps-details');details.appendChild(el('summary','', '查看完整路径 · 6 个阶段'));
        details.appendChild(ui.timeline(names.map(function(n,i){return {state:i<state.step?'done':i===state.step?'cur':'',title:n,desc:i<state.step?'预置演示阶段':'以实际审核结果为准'};})));body.appendChild(details);
        if(state.pending)body.appendChild(button('模拟本阶段审核通过','primary',function(){if(state.step<names.length-1)state.step++;state.pending=false;write('transform',state);render();}));
        else body.appendChild(button('准备本阶段材料','primary',function(){flow({key:'transform-'+state.step,title:names[state.step]+'材料上报',steps:[{label:'进展说明',fields:[field('name','数据产品名称'),field('progress','本阶段完成情况','textarea'),field('risk','风险与待协调事项','textarea',{required:false})]},{label:'上传材料',fields:[field('attachment','阶段材料','file')]}],onComplete:function(){state.pending=true;write('transform',state);render();}});}));
        body.appendChild(button('预约评审协助','ghost',function(){scenes.handoff('申请'+names[state.step]+'阶段的专家协助');}));
        body.appendChild(el('p','hh-field-hint','选择材料、提交审核与审核通过是不同状态；正式流程需要接入业务系统。'));
      }render();ui.botCard(c,160);
    };
    scenes.project=function(){
      ui.userSay('打开项目工作台');var c=ui.card('项目工作台',null);c.classList.add('hh-flow');c.dataset.taskTitle='项目工作台';
      var label=el('label','','当前项目'),select=el('select');label.htmlFor='hhProjectSelect'+(++seq);select.id=label.htmlFor;select.setAttribute('aria-label','当前项目');
      var projects=['公共数据要素促进精准就业项目','企业风险监测数据产品研发'];projects.forEach(function(p){select.appendChild(new Option(p,p));});
      select.value=read('project',projects[0]);var fieldBox=el('div','sf-field');fieldBox.append(label,select);c.appendChild(fieldBox);var body=el('div');c.appendChild(body);
      function render(){
        body.replaceChildren();var idx=projects.indexOf(select.value);body.appendChild(el('p','hh-form-status',(idx===0?'当前阶段：项目申报 · 待补充材料':'当前阶段：资源申请 · 待填写需求')+'（演示项目）'));
        var steps=['项目申报','揭榜确认','团队组建','资源申请','开发验证','验收与成果推广'];
        var details=el('details','hh-steps-details');details.appendChild(el('summary','','项目路径 · 6 个阶段'));details.appendChild(ui.timeline(steps.map(function(s,i){return {title:s,state:i<(idx===0?0:3)?'done':i===(idx===0?0:3)?'cur':''};})));body.appendChild(details);
        body.appendChild(el('h3','','待办事项'));
        body.appendChild(button(idx===0?'补充项目申报材料':'填写资源申请','primary',function(){if(idx===0)scenes.applyProject();else resource('企业信用数据');}));
        body.appendChild(button('查看办理记录','ghost',scenes.progress));body.appendChild(button('上报项目进展','ghost',function(){flow({key:'project-update-'+idx,title:'项目进度上报',defaults:{project:select.value},steps:[{label:'填写进度',fields:[field('project','项目名称'),field('done','本期完成情况','textarea'),field('next','下期计划','textarea'),field('risk','风险与协调事项','textarea',{required:false})]}]});}));
        body.appendChild(button('联系项目运营','ghost',function(){scenes.handoff(select.value+'需要运营协助');}));
      }select.addEventListener('change',function(){write('project',select.value);render();});render();ui.botCard(c,160);
    };
    scenes.recommend=function(){
      ui.userSay('推荐适合我的服务');var c=ui.card('按身份与方向推荐',null),body=el('div');c.appendChild(body);
      c.classList.add('hh-answer');
      var direction=read('interest','医疗健康');
      function render(){
        body.replaceChildren();var roleNames={guest:'访客',person:'个人用户',legal:'法人用户'},tabs=el('div','v4-idtabs');
        Object.keys(roleNames).forEach(function(r){var b=button(roleNames[r],api.state.role===r?'primary':'ghost',function(){ui.setRole(r,true);render();});b.setAttribute('aria-pressed',String(api.state.role===r));tabs.appendChild(b);});body.appendChild(tabs);
        body.appendChild(el('p','hh-form-status',api.state.role==='guest'?'访客推荐 · 根据您本次主动选择的方向，不读取历史画像。':roleNames[api.state.role]+'推荐 · 偏好仅保存在本次浏览器会话。'));
        var label=el('label','','关注方向'),s=el('select');s.id='hhInterest'+(++seq);label.htmlFor=s.id;s.setAttribute('aria-label','关注方向');['医疗健康','智慧交通'].forEach(function(d){s.appendChild(new Option(d,d));});s.value=direction;s.addEventListener('change',function(){direction=s.value;write('interest',direction);render();});var f=el('div','sf-field');f.append(label,s);body.appendChild(f);
        var defs=api.state.role==='guest'?[['了解平台服务','先了解资源获取方式与办理条件','firstvisit'],['浏览公开数据目录','无需企业认证即可查看目录','catalog']]:api.state.role==='person'?[['科研数据与算法组件','适合高校课题研究与技术验证','discover'],['用数合规指引','申请前先核对使用条件','policy']]:[['数据、算力与服务组合','为企业研发准备可申请的资源清单','bundle'],['创新项目申报','整理企业信息与技术方案','applyProject']];
        defs.forEach(function(d){var row=el('div','v4-res');row.append(el('strong','',direction+' · '+d[0]),el('p','hh-field-hint',d[1]),button('查看推荐','ghost',function(){api.run(d[2],direction==='医疗健康'?'医疗':'客流');}));body.appendChild(row);});
      }render();ui.botCard(c,160);
    };
    scenes.zero=function(query){
      ui.userSay(query||'没有找到需要的资源');var c=ui.card('暂未找到完全匹配的结果',null);
      c.appendChild(el('p','','可以扩大关键词范围，或登记您需要的数据，由运营进行人工匹配。'));
      c.appendChild(button('按行业继续找','primary',function(){scenes.discover('医疗');}));
      c.appendChild(button('去目录检索','ghost',scenes.catalog));
      c.appendChild(button('登记资源需求','ghost',function(){flow({key:'zero',title:'登记资源需求',defaults:{keyword:query||''},steps:[{label:'资源需求',fields:[field('keyword','资源关键词'),select('type','需求类型',['数据资源','云网算资源','组件资源','创新服务']),field('usage','用途与范围','textarea')]},{label:'联系方式',fields:contact}]});}));
      c.appendChild(el('p','hh-field-hint','登记后生成本地演示回执，不代表平台已提供该资源。'));ui.botCard(c,160);
    };
    scenes.juebang=function(industry){
      var medical=industry==='医疗',names=medical?['医疗影像辅助诊断','肺部影像模型验证','体检筛查智能辅助']:['智能交通信号优化','重点区域短时客流预测','公交运力调度优化'];
      ui.userSay('查看'+(medical?'医疗影像':'交通算法')+'方向的揭榜机会');var c=ui.card('揭榜匹配 · '+(medical?'医疗影像':'交通算法'),null);
      c.appendChild(el('p','hh-form-status','匹配机会为原型示例。提交前请核对榜单要求、资格与方案材料。'));
      names.forEach(function(name,i){
        var item=el('div','v4-res');item.append(el('strong','',name),el('p','hh-field-hint','示例匹配度 '+[92,88,81][i]+'% · 法人认证 / 相关技术案例'));
        var detail=el('details','hh-steps-details');detail.appendChild(el('summary','','查看要求与能力缺口'));
        detail.appendChild(el('p','','需准备：企业信息、相关案例、实施方案、技术附件。请评估数据授权与系统适配经验，不足时可联合伙伴申报。'));item.appendChild(detail);
        item.appendChild(button('准备申报材料','primary',function(){scenes.applyProject(name);}));c.appendChild(item);
      });ui.botCard(c,160);
    };
    scenes.journey=function(){
      ui.userSay('体验医疗影像企业的完整创新链路');var c=ui.card('完整链路 · 医疗影像 AI 企业',null),body=el('div');c.classList.add('hh-flow');c.dataset.taskTitle='完整链路体验';c.appendChild(body);
      var idx=read('journey-step',0);
      var steps=[
        ['了解平台','了解数据、算力、评测、场景与成果转化服务。',function(){scenes.firstvisit();}],
        ['完善画像','选择企业身份与医疗健康方向，为推荐提供依据。',function(){write('interest','医疗健康');scenes.recommend();}],
        ['搜索问数','查找医学影像数据并了解目录、开放方式与申请条件。',function(){scenes.discover('医疗');}],
        ['推荐方案','把数据、算力、组件与服务放入同一份创新方案。',scenes.bundle],
        ['匹配场景','查看医疗影像方向的场景要求与能力缺口。',function(){scenes.juebang('医疗');}],
        ['边聊边办','填写需求，核对后生成资源申请演示回执。',function(){resource('医学影像数据与 GPU 算力');}],
        ['跟踪提醒','查找本次提交记录，或体验预置的补材料示例。',scenes.progress],
        ['可信空间','先完成场地、人员与设备前置事项。正式动态码登录需对接可信空间。',scenes.chain],
        ['上架评审','准备阶段材料，提交与审核通过分别展示。',scenes.transform],
        ['成果推广','向医疗机构展示成果并准备对接材料。',function(){scenes.match('医疗');}]
      ];
      function render(){
        body.replaceChildren();var progress=el('div','hh-form-status hh-step-summary','第 '+(idx+1)+' / 10 步 · '+steps[idx][0]);body.appendChild(progress);
        var details=el('details','hh-steps-details');details.appendChild(el('summary','','查看全部步骤'));
        steps.forEach(function(s,i){var b=button((i+1)+'. '+s[0],i===idx?'primary':'ghost',function(){idx=i;write('journey-step',idx);render();});b.style.margin='4px';details.appendChild(b);});body.appendChild(details);
        body.append(el('h3','',steps[idx][0]),el('p','',steps[idx][1]),button('体验本步服务','primary',steps[idx][2]));
        var actions=el('div','v4-btnrow hh-form-actions'),prev=button('上一步','ghost',function(){idx--;write('journey-step',idx);render();});prev.disabled=idx===0;actions.appendChild(prev);
        actions.appendChild(button(idx<9?'下一步':'重新体验','ghost',function(){idx=idx<9?idx+1:0;write('journey-step',idx);render();}));body.appendChild(actions);
        body.appendChild(el('p','hh-field-hint','这是服务路径体验，切换步骤不会自动完成真实业务。返回“完整链路”入口可继续当前步骤。'));
      }render();ui.botCard(c,160);
    };
    function partner(){return flow({key:'partner',title:'加入合作伙伴',requireLegal:true,steps:[{label:'机构信息',fields:[field('company','机构名称'),select('direction','合作方向',['数据合作','技术合作','场景共建','生态服务']),field('description','合作意向','textarea')]},{label:'联系人',fields:contact}]});}
    window.HeheForms={resource:resource,flow:flow,partner:partner};
    // A quick card and its scene shortcut must enter the same form.
    var cards=document.getElementById('chatCards');
    cards.addEventListener('click',function(e){
      var card=e.target.closest('.quick-card');if(!card)return;
      var title=card.querySelector('.card-title');if(!title)return;
      var mapping={'预约参观':'visit','我要反馈需求':'feedback','资源加入清单':'bundle','我要揭榜':'juebang'};
      var key=mapping[title.textContent.trim()];if(key){e.preventDefault();e.stopImmediatePropagation();api.run(key);}
    },true);
  }
  boot();
})();
