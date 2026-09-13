from pathlib import Path
from copy import deepcopy
from docx import Document
from docx.shared import Cm,Pt,RGBColor
from docx.enum.section import WD_SECTION,WD_ORIENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT,WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.text.paragraph import Paragraph

ROOT=Path(__file__).resolve().parents[2]
SRC=next(Path('/Users/wangyi/Downloads').glob('*V5_Harness*docx'))
OUT=ROOT/'deliverables/数智北京创新中心_合合智能助手建设思路及原型设计报告_V6_业务交互完善版.docx'
OUT.parent.mkdir(exist_ok=True)
doc=Document(SRC);ps=list(doc.paragraphs);first_section=deepcopy(doc.sections[0]._sectPr)
# Preserve the V5 report body, source notes and paragraph formatting; replace the old schematic appendix.
body=doc._element.body;cut=list(body).index(ps[42]._p)
for child in list(body)[cut+1:]:body.remove(child)
body.append(first_section)

def font(run,size=15,bold=False,name='Noto Serif CJK SC'):
 run.font.name=name;run.font.size=Pt(size);run.font.bold=bold;run.font.color.rgb=RGBColor(0,0,0)
 rpr=run._element.get_or_add_rPr();rpr.rFonts.set(qn('w:eastAsia'),name)
 return run

def replace(i,text):
 p=ps[i];p.clear();font(p.add_run(text));return p

def after(anchor,text):
 el=OxmlElement('w:p');anchor._p.addnext(el);p=Paragraph(el,anchor._parent)
 p._p.get_or_add_pPr().append(deepcopy(ps[2]._p.pPr)) if False else None
 p.paragraph_format.first_line_indent=Cm(1.05);p.paragraph_format.line_spacing=Pt(23);p.paragraph_format.space_after=Pt(2)
 font(p.add_run(text));return p

replace(0,'关于数智北京创新中心合合智能助手\n建设思路及原型设计情况的报告').style='Title'
font(ps[0].runs[0],21,True);ps[0].alignment=WD_ALIGN_PARAGRAPH.CENTER
replace(1,'送审稿  V6业务交互完善版').alignment=WD_ALIGN_PARAGRAPH.CENTER;font(ps[1].runs[0],12,name='Noto Sans CJK SC')
replace(2,'围绕创新主体查服务、找资源、准备申请和跟进办理的实际需求，拟依托数智北京创新中心现有门户、资源目录及业务系统，建设“合合”统一智能服务入口，以高质量数据和知识治理提供支撑，以智能体运行与控制工程（Agent Harness）组织执行。目前已形成基于真实目录快照和业务资料的可操作本地原型。建议在业务口径、身份权限和接口条件核定后，优先开展需求反馈及目录查询等场景试点，再逐步接续项目实施流程。现将建设思路和原型设计情况报告如下。')
replace(8,'（一）统一入口，按需展开。在现有门户嵌入合合助手，沿用蓝白配色、中心品牌与四类彩色服务卡片，保留原栏目和常规办理入口。普通咨询采用轻量侧栏，复杂任务展开为工作台。首页围绕参与场景揭榜、查找数据资源、数据创新项目、预约参观组织服务，输入框提供常见问题示例。进入办理后，桌面工作台左侧办理页面与右侧问答区域等宽展示，各自滚动，用户可以边聊边办，也可以边办边问。首页示意见附件图3。')
replace(9,'（二）任务连续，记录集中。同一任务共用对话、关联资源和可编辑草稿；自然语言修改与表单修改同步，内容变化后重新核对。历史对话位于左侧导航下方，按今天、本周、本月及更早分组，不另设历史菜单。“我的办理”作为独立页面，集中展示本人申请进展、待补充事项和助手草稿，点击记录可回到原任务继续处理。正式申请编号与状态由原业务系统提供，不能用助手会话编号代替。')
after(ps[9],'前台区分访客、个人用户和企业用户。访客可以咨询公开服务、查询目录并准备草稿；个人与企业用户在认证后按授权查看本人或所属企业的记录。企业绑定、法人或授权人、项目成员及团队管理员分别核对，不以选择企业身份或个人自述替代真实鉴权。后台数据治理、业务规则审核和运行管理由授权人员使用。')
replace(13,'首批以客户提供的28个原始问题、两份业务设计材料、官网公开入口和2026年9月2日目录快照为基础，选择身份条件自查、目录连续筛选、场景时效核对、需求反馈、参观预约、项目准备和组件供给等代表性任务。优先把已有业务解释清楚、把已有资料衔接起来，不将所有服务方向都设计成可直接提交的审批事项。')
replace(14,'（一）智能问答与服务引导。以“申请资源时没有项目名称”为例，先帮助用户核对企业绑定、项目关系、团队角色及网络环境，再给出对应操作路径；未取得授权结果时只提供自查建议，不直接判定无权限或项目不存在。对于联合体揭榜等问题，先定位已发布场景和适用批次，再解释条件与材料。第五批通知的原截止时间为2026年8月17日17:00，已过原期限的记录只提示核验延期依据，不承诺仍可提交。示意见附件图4、图6。')
replace(15,'（二）智能问数与资源匹配。目录查询统一展示数据时间、筛选条件、统计口径和可追溯明细。原型使用10,659条政府侧目录记录，交通运输领域614条，继续筛选市交通委为569条，再筛选开放标识为“是”为38条；市交通委全部领域为583条，不能与569条混用。场景目录按快照阶段分为揭榜中49条、对接中37条、已完成105条，阶段数量不等于当前可申报数量。首批验证目录级查询、比较和收藏，不据目录推算底层业务指标或数据使用权限。示意见附件图5、图6。')
replace(16,'（三）对话式辅助办理。以官网独立“需求反馈”页面为首批样例，保留企业名称、联系人、联系电话、需求详情四项必填规则。从资源目录进入时关联原对象，助手根据用户输入生成候选字段，标明信息来源；用户可直接改表，也可在对话中修改指定字段。完成校验后进入整体核对，由用户明确确认再提交；任何后续修改都会使原确认失效。当前原型仅模拟提交与同号补充，不产生官网受理凭证。示意见附件图7、图8、图9。')
after(ps[16],'参观预约按个人与社会团体分别准备信息，超过20人的团体衔接工作人员排期，历史场次不作为实时余量。场景申请绑定已发布对象，不与“提供场景”混淆；数据创新项目与入场准备明确互联网咨询和政务外网开发边界；提供组件按官网工具信息、PNG标识、第三方质量测试报告及企业资料组织缺项检查。登录后正式表单或实时接口尚未核验的事项，仅提供准备清单和原入口，不编造受理结果。')
replace(20,'（二）规范结构化数据治理。针对资源、场景、项目等对象，统一标识、分类字典、字段语义、关联关系和统计口径，检查缺失、重复、冲突及格式问题。开放标识、共享属性、用户权限和可办理状态分别管理；场景阶段与通知有效期分别维护。经业务确认后发布查询视图与接口，用614、569、38、583等标准案例复核范围变化，确保图表、数量和明细同源。治理设计见附件表10。')
# Keep original knowledge and Harness detail, correcting figure references and making pending QA governance explicit.
for i in [10,21,22,24,31]:
 for r in ps[i].runs:
  r.text=r.text.replace('运行机制见附件图2','运行机制见附件表2').replace('示意见附件图8。','治理设计见附件表11。').replace('场景与工程对应关系见附件图2。','场景与工程对应关系见附件表2。')
after(ps[22],'客户提供的场景培育问答中，10处入口、时限、模板、流程或政策口径仍需业务确认。后台保留原稿及疑点，逐条关联适用通知、责任人员和审核版本。未经核定的办理时限、申请窗口及资格结论不进入正式自动答复；已发布内容发生变化时，联动更新前台提示与回归用例。')
replace(33,'（一）分类衔接，状态有据。对已明确获取方式的资源按规则引导；对需核实授权的数据先归集需求；对规则与接口明确的事项提供辅助办理。“我的办理”从原系统读取授权范围内的历史提交、最新状态、更新时间与补正要求，分别展示助手草稿、已提交、已受理及办理结果。补充材料沿用原申请编号；跨事项申请分别保留记录，不把需求反馈等同于数据授权，也不把一项提交成功视为全部事项完成。')
replace(37,'目前已完成公开业务入口梳理、目录快照复算及本地交互原型完善，形成三类身份演示、日期分组历史、等宽问答与办理联动、字段校验、提交前确认和独立“我的办理”等页面。已通过核心交互逻辑检查，并在浏览器核对主要页面和业务路径。当前问答与字段提取采用规则和核定示例，目录查询采用本地快照；尚未接入真实大模型、统一身份、正式上传、业务提交或审批状态接口，草稿与演示记录仅保留于本次访问。附件中的回执和状态均为模拟。')
replace(38,'一是由业务人员核定首批服务清单。优先确认需求反馈表单、参观预约规则、目录统计字典以及项目和场景参与路径；补齐登录后页面、权限判定、材料模板、状态字典、业务联系人和人工接续方式。将待确认问答逐条审核，形成可用于测试的有效口径。')
replace(39,'二是按业务条件开展试点接入。先接入经审核的知识检索和只读目录服务，再接统一身份、草稿管理及具备条件的业务接口。正式写入设置服务端校验、用户确认、幂等控制和审计；结果未知时先按原请求查询，避免重复提交。以真实任务或脱敏测试任务验证咨询依据、统计准确性、字段修改、补正接续与办理反馈，未接通环节持续标明演示或人工办理。')
replace(40,'三是按试点效果确定扩展范围。对普通检索增强生成、图谱增强检索、受控ReAct与固定工作流进行场景化比较，评估答复依据准确率、目录统计一致性、草稿修改成功率、重复提交防护、人工接续完整性、响应耗时和运行成本。指标基线与目标值在试点中核定，不提前填报效果。达到业务、技术和安全验收要求后，再扩展至更多项目实施及资源供给环节。')
replace(42,'附件：整体架构、Harness能力分工、工作台交互原型及数据知识治理设计（图表1—11）')
# Tighten the engineering chapter for a leadership report while preserving its seven responsibilities.
replace(24,'拟采用Agent Harness统一组织智能体任务运行，管理上下文、工具、技能、沙箱、模型和评测。常见咨询调用知识检索，目录统计调用受控查询，复杂匹配按需使用ReAct推理与行动循环，规则明确的办理采用固定工作流。知识图谱与检索增强生成（RAG）作为可复用知识工具。具体框架、模型和部署组合通过试点论证，对应关系见附件表2。')
replace(25,'（一）执行控制。按任务意图、复杂度和风险选择路径，依据工具结果调整计划和核验结论。正式提交、信息变更和补正设置确认、暂停恢复与人工接续节点。限制执行轮次、耗时和成本，达到边界时停止或转交，不要求常见问题经过复杂推理链。')
replace(26,'（二）上下文与记忆。分别管理会话记录、任务状态及经授权的长期偏好。当前页面、资源标识、筛选条件、草稿版本和提交确认保存在独立状态记录中，不仅依靠模型摘要恢复。切换用户、企业或项目后重新核验权限；敏感资料按需使用，并提供清理机制。')
replace(27,'（三）知识工具。围绕政策、事项、资源、项目和机构建立经核验的关系，结合关键词、向量检索、图谱扩展和重排返回原文依据。简单问题直接检索，复杂问题按需多次调用。图谱不自动判定资格，数量和汇总由结构化查询工具计算，不以生成回答代替精确统计。')
replace(28,'（四）工具与技能。登记知识检索、目录统计、草稿更新、状态查询和业务提交工具，明确参数、权限和版本，通过函数调用或模型上下文协议（MCP）接入。将审核后的材料规则、指引和模板组织为技能（Skills）按需加载。技能不授予额外权限，提交须经用户确认和后端校验；结果未知先查询，避免重复写入。')
replace(29,'（五）沙箱与产物。对附件解析、授权数据整理和申请材料生成提供按任务隔离的环境，限制文件、网络与计算资源，管理产物来源、版本和访问权限。OCR与复杂表格抽取先形成待核对内容。沙箱不持有不必要的生产凭据，不绕过业务工具写入原系统。')
replace(30,'（六）模型适配。统一适配对话与推理、向量化、重排和按需多模态能力，通过任务事件更新查询结果、草稿字段及待确认内容，保持办理页与问答区状态一致。更换模型或降级时维持原有权限、字段约束和业务口径，不向用户展示模型内部推理。')
replace(31,'（七）可观测与评测。记录必要的任务阶段、工具调用、证据、版本、耗时、成本、异常及人工接续情况。重点回归答复依据、统计口径、草稿修改、恢复补正、防重复提交与越权防护。反馈经人工复核和测试后发布，不让智能体自行改写生产规则。')
replace(2,'拟依托数智北京创新中心现有门户、资源目录及业务系统，建设“合合”统一智能服务入口，帮助创新主体查服务、找资源、准备申请和跟进办理，以高质量数据和知识治理提供支撑，以智能体运行与控制工程（Agent Harness）组织执行。目前已形成基于真实目录快照和业务资料的本地原型。建议核定业务口径、身份权限和接口条件后，先开展需求反馈与目录查询试点，再逐步接续项目实施流程。现将有关情况报告如下。')
replace(37,'目前已形成三类身份演示、日期分组历史、等宽问答与办理联动、字段校验、提交前确认及独立“我的办理”等本地原型，并完成核心逻辑和浏览器主要路径检查。问答与提取采用规则和示例，查询采用目录快照；真实大模型、统一身份、正式上传提交及审批状态接口尚未接入，草稿和模拟记录仅保留于本次访问。附件不作为业务上线证明。')
replace(38,'一是核定首批服务清单。由业务人员确认需求反馈、参观预约、目录统计及项目参与规则，补齐登录后表单、权限、材料模板、状态字典和人工接续方式，逐条审核待确认问答，形成有效口径与测试用例。')
replace(39,'二是开展试点接入。先接知识检索和只读目录，再接身份、草稿及具备条件的业务接口。正式写入设置服务端校验、用户确认、幂等和审计，结果未知先查询。以真实或脱敏任务验证依据、统计、字段修改和办理反馈，未接通环节标明演示或人工办理。')
replace(40,'三是评估后逐步扩展。比较普通RAG、图谱增强、受控ReAct与固定工作流，核验依据准确性、统计一致性、修改成功率、防重复提交、人工接续、耗时和成本。基线与目标在试点中核定，不提前填报成效；通过验收后再扩展项目实施与资源供给环节。')
# Avoid a closing paragraph taking a page of its own.
ps[41]._element.getparent().remove(ps[41]._element)

# Keep V5's A4 body typography; ensure black headings throughout.
for style in doc.styles:
 if style.type==1 and (style.name.startswith('Heading') or style.name in ['Title','Subtitle']):style.font.color.rgb=RGBColor(0,0,0)
for p in doc.paragraphs:
 if p.style.name.startswith('Heading'):
  for r in p.runs:r.font.color.rgb=RGBColor(0,0,0)

def paragraph(text='',size=11,bold=False,align=None):
 p=doc.add_paragraph();p.paragraph_format.first_line_indent=Cm(0);p.paragraph_format.line_spacing=1.25;p.paragraph_format.space_before=Pt(0);p.paragraph_format.space_after=Pt(5)
 if align is not None:p.alignment=align
 font(p.add_run(text),size,bold,'Noto Sans CJK SC');return p

def title(text):
 p=paragraph(text,17,True);p.style='Heading 1';p.paragraph_format.page_break_before=False;p.paragraph_format.keep_with_next=True;p.paragraph_format.space_after=Pt(5);return p

def page(text):
 p=title(text);p.paragraph_format.page_break_before=True
def table(headers,rows,widths):
 t=doc.add_table(rows=1,cols=len(headers));t.alignment=WD_TABLE_ALIGNMENT.CENTER;t.autofit=False
 for c,w in zip(t.columns,widths):c.width=Cm(w)
 for c,h,w in zip(t.rows[0].cells,headers,widths):c.text=h;c.width=Cm(w)
 for row in rows:
  cells=t.add_row().cells
  for c,txt,w in zip(cells,row,widths):c.text=str(txt);c.width=Cm(w)
 for ri,row in enumerate(t.rows):
  trpr=row._tr.get_or_add_trPr();trpr.append(OxmlElement('w:cantSplit'))
  if ri==0:trpr.append(OxmlElement('w:tblHeader'))
  for ci,c in enumerate(row.cells):
   c.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
   tcpr=c._tc.get_or_add_tcPr();shd=OxmlElement('w:shd');shd.set(qn('w:fill'),'DBEAF7' if ri==0 else ('F7FAFD' if ri%2==0 else 'FFFFFF'));tcpr.append(shd)
   margins=OxmlElement('w:tcMar')
   for side in ['top','left','bottom','right']:
    el=OxmlElement('w:'+side);el.set(qn('w:w'),'100');el.set(qn('w:type'),'dxa');margins.append(el)
   tcpr.append(margins)
   borders=OxmlElement('w:tcBorders')
   for side in ['top','left','bottom','right']:
    el=OxmlElement('w:'+side);el.set(qn('w:val'),'single');el.set(qn('w:sz'),'4');el.set(qn('w:color'),'D9D9D9');borders.append(el)
   tcpr.append(borders)
   for p in c.paragraphs:
    p.paragraph_format.first_line_indent=Cm(0);p.paragraph_format.line_spacing=1.25;p.paragraph_format.space_after=Pt(3);p.paragraph_format.space_before=Pt(3)
    for r in p.runs:font(r,11,ri==0,'Noto Sans CJK SC')
 return t

def image_page(num,heading,file,caption):
 page(f'图{num}  {heading}')
 p=paragraph('',10,align=WD_ALIGN_PARAGRAPH.CENTER);p.paragraph_format.space_after=Pt(3);p.paragraph_format.line_spacing=1
 p.add_run().add_picture(str(ROOT/'work/secretary-report/screenshots'/file),width=Cm(23.5))
 paragraph(caption,10)

sec=doc.add_section(WD_SECTION.NEW_PAGE);sec.orientation=WD_ORIENT.LANDSCAPE;sec.page_width=Cm(29.7);sec.page_height=Cm(21);sec.top_margin=Cm(1.25);sec.bottom_margin=Cm(1.1);sec.left_margin=Cm(1.65);sec.right_margin=Cm(1.65)
sec.header_distance=Cm(.5);sec.footer_distance=Cm(.5)
title('图1  合合助手整体架构')
p=paragraph('',align=WD_ALIGN_PARAGRAPH.CENTER);p.add_run().add_picture('/Users/wangyi/Downloads/合合助手整体架构_可编辑高保真-01｜可编辑架构图.drawio.png',width=Cm(26))
paragraph('沿用五层架构，以数据和知识治理支撑服务，以Harness组织任务执行。A1—A7为协作能力，不是每个任务必须依次经过的七个步骤。正式身份、权限、受理和审批仍由既有系统负责。图中为建设规划。',10)
page('表2  Harness能力与业务场景的对应关系')
paragraph('常见咨询走知识检索短路径，精确统计调用受控查询，复杂匹配按需使用ReAct，正式办理采用带确认节点的工作流。以下为建设设计，当前前端原型未实现完整Harness。',11)
table(['能力','承担的职责','业务体现与控制点'],[
['A1 执行控制','任务分流、计划、暂停恢复','咨询、查询、办理按复杂度分流；超时或异常停止并接续人工。'],
['A2 上下文与记忆','页面对象、筛选条件、草稿版本','614→569→38保持筛选范围；改动字段后废止原提交确认。'],
['A3 工具执行与MCP','注册工具、校验参数、授权调用','目录只读查询；身份与进度按授权查询；正式提交经受控接口。'],
['A4 Skills工程','复用业务指引、材料模板、审核规则','管理员条件自查、批次核验、四字段反馈与组件缺项检查。'],
['A5 沙箱与产物','隔离解析文件并管理版本与权限','附件解析形成候选字段；材料原文、版本和用户修改可以追溯。'],
['A6 模型适配','对话、向量、重排与按需OCR','模型更换保持工具合同、字段约束和前台任务状态一致。'],
['A7 可观测与治理','调用链、异常、评测、成本与人工干预','核验依据、统计一致性、补正同号及防重复提交，不展示内部思维全文。']],[4.2,8.5,13.0])
paragraph('数据和知识管理平台提供审核后的原文、片段、图谱关系和结构化查询服务。图谱＋RAG是知识工具，数量由查询工具计算；技能和模型不能授予额外业务权限。',11)
image_page(3,'统一工作台与服务入口','home.png','本地原型实截图。蓝白主色与四类彩色卡片保持一致；历史对话置于左侧下方，独立“我的办理”承接申请记录。右上角身份切换仅用于演示，不代表认证。')
image_page(4,'从资源申请问题进入办理条件自查','diagnosis.png','以“没有项目名称”为例，先核对企业关系、项目关系、团队身份与网络环境。自查选择属于用户自述；未接身份接口前，不将其作为正式权限核验结果。')
image_page(5,'目录连续筛选与同源统计','catalog.png','2026-09-02快照：交通运输614条→市交通委569条→开放标识为是38条。市交通委全部领域另为583条。目录与图表同源，页面提供比较、收藏、详情与需求准备。')
image_page(6,'场景阶段与申请时效分别核对','scenes.png','“旅游团队行程智能监测与执法辅助场景”关联第五批通知；原截止时间2026-08-17 17:00已过。目录阶段仍为“揭榜中”也不能据此承诺当前可提交，延期须另有依据。')
image_page(7,'等宽办理页面与问答联动','draft.png','沿用官网独立需求反馈的四项必填字段。资源对象随草稿保留；对话修改指定字段，其他字段保持不变，人工也可直接编辑。图中单位、联系人和电话为测试示例。')
image_page(8,'提交前整体核对与明确确认','review.png','修改会使旧确认失效，用户需核对当前版本后再确认。本页仅完成本地模拟提交；正式接入还需服务端鉴权、规则校验、幂等、审计及原系统结果查询。')
image_page(9,'独立的我的办理页面','records.png','集中展示当前身份下的记录、待补充事项和草稿，按状态筛选或按事项和编号搜索。图中为本次访问产生的模拟记录；补充材料返回原任务，并保留同一编号。')
page('表10  结构化目录治理与验证基线')
paragraph('后台由授权数据治理人员维护来源、字典、字段映射和查询版本，业务责任方核定统计口径。下列数据来自附件快照复算，不是生产接口验收值。',11)
table(['核对对象','查询范围','记录数','治理要点'],[
['政府侧数据','全部公开目录记录','10,659','仅目录元数据；不含底层观测数据或自动使用授权。'],
['交通运输','领域精确匹配','614','领域取自原字典，不依据名称关键词替代。'],
['交通运输中的市交通委','领域＋提供部门','569','连续筛选保留两项条件。'],
['上述目录中的开放记录','领域＋部门＋开放标识为是','38','开放属性与实际获取权限分别管理。'],
['市交通委全部领域','只保留提供部门','583','清除领域限制时不能沿用569条的口径。'],
['场景目录','揭榜中／对接中／已完成','49／37／105','目录阶段与通知截止时间、实时受理状态分别管理。']],[4,7.3,2.4,12])
paragraph('发布流程：登记来源和责任人，核对标识与字典，检查缺失重复及关联错误，执行标准查询测试，再审核发布。字段或资料变更后重跑受影响用例，保留版本、差异和回退路径。',11)
paragraph('当前实现：前端读取必要目录字段并计算上述数量。后续建设：授权查询视图、增量同步、质量规则、审计和服务端权限过滤；不将本地静态文件视为生产数据治理平台。',11)
page('表11  知识与业务规则治理')
paragraph('从原始网页、问答、政策及附件形成可定位、可审核的知识服务。保留原稿与审核结论，避免未经确认的时间、入口和资格条件进入自动答复。',11)
table(['治理环节','处理对象','发布条件'],[
['接入与识别','官网说明、正式通知、客户问答、历史快照','登记来源、采集日期、责任方及适用范围，区分现行资料和历史材料。'],
['清洗与解析','正文、表格、模板及附件','保留标题层级和原文定位；OCR结果、实体及关系抽取须核验。'],
['差异与疑点审核','28个原始问题中的10处待确认口径','分别核对入口、时限、材料、网络、身份与政策；不自动归并成统一规则。'],
['版本发布','审核后的问答、知识片段、图谱关系','关联适用批次、有效期、访问权限和审核记录，再更新索引与工具配置。'],
['反馈与回归','引用错误、无结果、材料补正和人工经验','复核后修订，验证来源定位、条件解释与业务路径；不得由模型自行改写生产规则。']],[4,9,12.7])
paragraph('例如，场景“揭榜中”与原通知截止时间已过可能同时成立，应保留两条来源并提示核验，而不是覆盖其中一条。第五批通知的联合体和期限规定只适用于对应批次，不扩展为所有场景的一般结论。',11)
paragraph('当前实现：展示已核对的来源说明和原文入口。后续建设：权限化内容管理、审核发布、版本联动、图谱与检索服务，以及可追溯的任务运行记录。',11)
page('参考依据与原型范围说明')
paragraph('本版基于V5报告、合合助手设计稿及两份真实业务设计材料修订，保持五层架构和Harness建设主线。官网公开页面于2026-09-13复核，目录使用用户提供的2026-09-02快照；时间口径分别标示。',11)
refs=[
('北京市公共数据资源授权运营管理办法','https://www.beijing.gov.cn/zhengce/zhengcefagui/202607/t20260709_4754544.html','京政数发〔2026〕6号，重点参考需求归集与数据产品再开发相关规定。'),
('官网创新服务','https://dibj.cn/cxfuww/','核对服务方向与数据创新项目入口；公开说明不证明登录后事项已可自动办理。'),
('官网独立需求反馈','https://dibj.cn/fzpt/wysq/xqfk/','四项必填：企业名称、联系人、联系电话、需求详情。'),
('官网我要提供','https://dibj.cn/fzpt/wytg/','区分组件等供给类别与场景揭榜；工具材料、单位信息和审核分别处理。'),
('第五批智慧城市场景揭榜通知','https://zwfwj.beijing.gov.cn/zwgk/2024zcwj/202608/t20260803_4806700.html','原截止时间为2026-08-17 17:00；是否延期待核验。'),
('参观预约与项目操作材料','https://dibj.cn/sthz/cgyy/','本轮实时页面未成功核验，分支字段来自附件与历史镜像；实时场次、登录后表单和受理状态待联调。')]
for name,url,note in refs:
 paragraph(name,10,True).paragraph_format.space_after=Pt(2);p=paragraph(note+'\n'+url,9.5);p.paragraph_format.keep_together=True;p.paragraph_format.space_after=Pt(4)

# Explicit black header/footer text and normal, continuous page numbers.
for sec in doc.sections:
 for h in [sec.header,sec.footer]:
  for p in h.paragraphs:
   for r in p.runs:r.font.color.rgb=RGBColor(0,0,0)
doc.core_properties.title='数智北京创新中心合合智能助手建设思路及原型设计情况报告'
doc.core_properties.subject='V6业务交互完善版 送审稿'
doc.core_properties.comments='依据V5保留主体架构，完善真实业务交互和原型说明。'
# Use installed CJK fonts in all retained OOXML parts, including footnotes.
for root in [doc._element,doc.styles.element]:
 for element in root.iter(qn('w:pBdr')):
  element.getparent().remove(element)
doc.save(OUT)
import zipfile,io
buffer=io.BytesIO()
with zipfile.ZipFile(OUT) as original, zipfile.ZipFile(buffer,'w',zipfile.ZIP_DEFLATED) as fixed:
 for item in original.infolist():
  content=original.read(item.filename)
  if item.filename.endswith('.xml'):
   content=content.replace(b'Noto Serif CJK SC',b'STSong').replace(b'Noto Sans CJK SC',b'Hiragino Sans GB')
  fixed.writestr(item,content)
OUT.write_bytes(buffer.getvalue())
print(OUT)
print('paragraphs',len(doc.paragraphs),'tables',len(doc.tables),'images',len(doc.inline_shapes),'sections',len(doc.sections))
