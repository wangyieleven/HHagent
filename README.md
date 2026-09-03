# HHagent · 合合助手

面向数智创新服务的合合助手前端交互原型。当前采用“对话优先”设计：用户先通过自然语言描述需求，再按需展开资源、政策材料、办理核对和进度组件。

> **仓库状态说明**：本仓库当前在 GitHub 上为公开可见，但其中包含静态镜像、业务参考资料和第三方素材。若这些资料仅限内部使用，应立即在 GitHub Settings 中将仓库改为 Private，并另行评估是否需要清理 Git 历史。代码修改或删除当前文件，不会自动清除历史提交中的内容。

当前页面没有连接真实大模型、身份认证、文件上传、数据库或审批系统。所有问答、申请、回执和进度均为本地演示，不具有业务效力。

## 本地启动

需要 Python 3，无需安装前端依赖或构建。

在仓库根目录运行：

```sh
python3 -m http.server 8734 --bind 127.0.0.1 --directory mirror/site
```

打开 <http://127.0.0.1:8734/>，点击首页吉祥物或合合助手入口。停止服务按 `Ctrl+C`。

只应将 `mirror/site` 作为本地静态 Web 根目录。不要将包含业务参考资料的整个仓库目录直接对外提供 HTTP 服务。

## 当前功能

- 精简欢迎页、示例提问、自然语言输入和二级能力菜单。
- 21 个原型场景：导览、推荐、目录、资源、政策、方案、预约、反馈、进度、人工协同、身份、空结果、成果转化、链式办理、资源供给、项目、揭榜、场景发布、成果对接、申报及完整路径。
- 对话式信息收集、按需表单、必填校验、会话草稿、提交核对和本地演示回执。
- 桌面侧栏、移动端布局、透明吉祥物头像和首页大吉祥物。

对话识别基于本地规则和预置示例，不是大模型。附件不会上传；回执不代表正式受理。草稿与演示办理记录仅用于当前浏览器会话，不支持跨设备同步。

## 默认安全边界

运行时默认使用 `demo` 模式：

- 真实业务 API、认证请求和访问日志全部关闭；
- 旧业务接口统一返回本地空结果 Mock，不再使用硬编码私网地址；
- 登录脚本不会把 Token、用户 ID 或角色 ID 写入 `localStorage` / `sessionStorage`；
- 助手草稿和演示记录在写入浏览器存储前会移除联系人、手机号、证件号、密码和令牌等敏感信息；
- 页面持续显示“演示环境”提示，并提供“清除本次演示数据”入口；
- 富文本回答经过标签和链接协议白名单过滤；
- 初始化失败会停止重试并给出错误提示，避免无限轮询。

非演示环境只能通过部署侧在 `commonUrl.js` 执行前注入 `window.__HH_RUNTIME_CONFIG__` 显式启用，例如：

```html
<script>
window.__HH_RUNTIME_CONFIG__ = {
  mode: 'sandbox',
  enableLiveApi: true,
  apiBase: 'https://sandbox.example.gov.cn',
  enableAuth: true,
  currentUserEndpoint: '/portal/oauth/currentUser',
  enableVisitLog: false,
  visitLogEndpoint: ''
};
</script>
```

正式生产环境还必须由后端完成鉴权、权限校验、输入校验、幂等、审计、文件安全检查和敏感数据保护，不能仅依赖本仓库中的前端保护。

## 目录

| 路径 | 用途 |
| --- | --- |
| `mirror/site/index.html` | 当前首页与助手入口 |
| `mirror/site/css/hehe-assistant.css` | 助手 UI、响应式和表单布局 |
| `mirror/site/js/commonUrl.js` | Demo / Sandbox / Production 运行时接口开关 |
| `mirror/site/js/header-login.js` | 不落地令牌的安全登录状态展示 |
| `mirror/site/js/visit-log.js` | 默认关闭、显式启用的同源访问日志模块 |
| `mirror/site/js/hehe-assistant-layout.js` | 轻量模块加载器 |
| `mirror/site/js/hehe-assistant-hardening.js` | Demo 隔离、存储脱敏、富文本白名单与运行提示 |
| `mirror/site/js/hehe-assistant-layout-core.js` | 欢迎、对话、更多、任务视图及无障碍交互 |
| `mirror/site/js/hehe-assistant-conversation.js` | 对话路由、日期解析、字段整理与草稿保护 |
| `mirror/site/js/hehe-assistant-forms.js` | 表单、回执和业务流程原型 |
| `mirror/site/mock/legacy-api-disabled.json` | Demo 模式下旧业务接口的空结果响应 |
| `scripts/check_static_safety.py` | 关键资源、私网地址、存储、日志和 JS 语法检查 |
| `UI 原型/` | 参考图与原型设计文档 |
| `audit-output/` | UI 与流程走查截图，包含历史版本 |
| `dibj_site_data_*` | 页面与目录采集参考资料，不是在线业务数据库 |

## 验证

执行统一检查：

```sh
python3 scripts/check_static_safety.py
```

脚本会检查：

- 助手关键资源是否存在并被首页引用；
- 运行时代码是否包含私网 IP；
- 登录脚本是否写入浏览器认证信息；
- 访问日志是否仍使用完整 URL、同步请求或 `beforeunload`；
- 对话草稿、初始化和日期解析保护是否存在；
- Mock JSON 是否有效；
- Node.js 可用时，对核心 JavaScript 执行 `node --check`。

相同检查已配置在 `.github/workflows/static-safety.yml`，Pull Request 和 `main` 分支推送都会执行。

## 阅读顺序

1. [对话优先 UI 优化实施报告](合合助手-对话优先UI优化实施报告-2026-09-03.md)
2. [视觉与交互 QA](design-qa.md)
3. [前期产品交互复查](合合助手-产品交互全模块复查报告-2026-09-03.md)
4. [原型完成报告](合合助手原型完成报告.md)
5. [安全说明](SECURITY.md)

旧镜像导出说明和早期报告保留为历史依据；当前设计方向以“对话优先 UI 优化实施报告”为准。部分历史文档仍使用原作者机器的绝对文件链接，在 GitHub 上请按文件名到对应目录查看。

## 注意事项

- 不要在演示登录页、对话或表单中输入真实密码、令牌、身份证号、手机号或业务敏感材料。
- 静态镜像中的旧栏目和历史脚本仅用于原型参考，不构成生产部署包。
- 对外公开、部署或二次分发前，应审查业务资料、采集数据、网页镜像、图片、字体、商标和第三方脚本的授权范围。
- 不要提交私钥、Token、真实环境配置、浏览器会话或生产数据库导出。
- 本仓库不提供生产部署承诺。