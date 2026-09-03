# mirror implementation handoff

This archive is the source of truth for turning the design into production code. Start from `site/cxfuww/index.html`, then preserve the visual system, responsive behavior, and interactions found in the exported files.

## Implementation target
- Build production UI from the exported design, not a loose reinterpretation.
- Preserve typography scale, spacing rhythm, color tokens, border radii, shadows, motion timing, and component states.
- Replace static placeholders only when the target app has real data or functional equivalents.
- Keep generated product UI free of OpenDesign chrome, preview labels, or design-process annotations.
- Treat this handoff as a visual contract: if implementation choices conflict, match the exported pixels and behavior first, then refactor internals.

## Source map
- Primary entry: `site/cxfuww/index.html`
- HTML screens detected: 65
- Stylesheets detected: 8
- Script/component files detected: 41
- Supporting assets detected: 211

## Responsive contract
Validate the implementation across this 2025–2026 viewport matrix:
- Mobile compact: 360×800
- Mobile standard: 390×844
- Mobile large: 430×932
- Foldable / small tablet: 600×960
- Tablet portrait: 820×1180
- Tablet landscape: 1024×768
- Laptop: 1366×768
- Desktop: 1440×900
- Wide desktop: 1920×1080

For responsive web exports, treat these as a modern breakpoint system for one adaptive web experience, not three fixed screenshots. Do not split responsive web into unrelated native app screens unless the project explicitly includes native targets. Use semantic layout thresholds, fluid `clamp()` type/spacing, and container queries where component width matters more than viewport width. Preserve any CSS media queries, container queries, fluid `clamp()` scales, and layout changes already present in the exported files.

## Design fidelity contract
- Extract reusable tokens before writing components: background, surface, foreground, muted text, border, accent, radius, shadow, spacing, type scale, and motion duration/easing.
- Map product screens, in-app modules/components, optional landing page, and optional OS widget surfaces before coding. Keep these surfaces separate in the target architecture.
- Match layout geometry: max-widths, gutters, grid columns, card proportions, sticky/fixed elements, and viewport-specific navigation.
- Preserve real copy, labels, and data shown in the export. Do not replace specific text with generic marketing filler.
- Preserve interactive affordances: hover, focus, pressed, disabled, loading, validation, copy/share, tab/accordion, modal/sheet, and keyboard states where present.
- Preserve accessibility semantics when converting: headings stay hierarchical, controls remain buttons/links/inputs, focus states stay visible.
- Do not keep prototype-only annotations, frame labels, or OpenDesign chrome in the production UI.

## CJX-ready UX contract
- Use `DESIGN-MANIFEST.json` as the machine-readable map for screens, app modules, OS widgets, landing pages, tokens, interactions, and viewport checks.
- Screen-file-first: when multiple user-facing surfaces exist, implement each HTML screen as its own route/file. Treat `index.html` as a launcher/overview when the manifest marks it that way, not as a combined final UI.
- If `landing.html`, app screens, platform screens, or OS widget files exist, preserve those boundaries in the target app instead of merging them into one page.
- A single self-contained `site/cxfuww/index.html` is acceptable only when the export truly contains one user-facing screen and its CSS/JS are structured enough to extract tokens, components, states, and behavior.
- If separate `css/` or `js/` files exist, treat them as source of truth for token/component/interactions before porting to React, Vue, SwiftUI, Compose, or another target stack.
- In-app modules/components are product UI blocks inside the app. OS widgets are home-screen/lock-screen/quick-access surfaces outside the app. Do not merge those concepts.

## Color and brand contract
- Use the exported design tokens and product/domain context as the color source of truth.
- Do not introduce warm beige / cream / peach / pink / orange-brown background washes unless they are already explicit brand/reference colors in the export.
- A stylesheet or design/token file was detected; inspect it for canonical color variables before choosing framework theme tokens.

## Implementation sequence for AI coding tools
1. Open `site/cxfuww/index.html` and `DESIGN-MANIFEST.json`; identify every screen file, launcher/overview file, app module, and interaction before coding.
2. If multiple HTML screens exist, map them to separate routes/surfaces first; do not merge `landing.html`, product app screens, platform screens, or OS widgets into one route.
3. Extract a token table from CSS/root styles and inline styles before building framework components.
4. Build product screens and domain-specific in-app modules from largest layout regions down to controls; avoid starting with isolated atoms that lose spatial intent.
5. Port responsive behavior across the modern viewport matrix and test each semantic breakpoint before cleanup.
6. Port interactions and states, then replace static placeholders only with real app data or functional equivalents.
7. Keep optional landing page and OS widget surfaces as separate surfaces if present.
8. Compare final screenshots against the export at 360×800, 390×844, 430×932, 820×1180, 1024×768, 1366×768, 1440×900, and 1920×1080 before declaring done.

## Entry points
- `site/cxfuww/index.html`
- `site/cxfuww/szzyml/index.html`
- `site/cxfuww/szzyml/sjml/index.html`
- `site/cxfuww/szzyml/sjml/xqy-10494.html`
- `site/cxfuww/szzyml/sjml/xqy-10496.html`
- `site/cxfuww/szzyml/sjml/xqy-10534.html`
- `site/cxfuww/szzyml/sjml/xqy/index.html`
- `site/cxfuww/szzyml/ywsl/index.html`
- `site/cxfuww/szzyml/zjml/index.html`
- `site/fywmww/index.html`
- `site/fzpt/cjyz/djz/index.html`
- `site/fzpt/cjyz/jbz/index.html`
- `site/fzpt/cjyz/ywc/index.html`
- `site/fzpt/cxnlqd/index.html`
- `site/fzpt/sjcx/lhsys/2c605e23cd4f42b5bc891f46d71f79da.html`
- `site/fzpt/sjcx/lhsys/5b6664752c004372b125426812d4bd8c.html`
- `site/fzpt/sjcx/lhsys/6282fa18238140cc9353d1ad712236c6.html`
- `site/fzpt/sjcx/lhsys/7df9dfa306fa48dc9cf3b430ec4eea85.html`
- `site/fzpt/sjcx/lhsys/7ee59bae4c384465b38b3fcd6e67c770.html`
- `site/fzpt/sjcx/lhsys/abba9302cce94990adbc3de64e9c2b61.html`
- `site/fzpt/sjcx/lhsys/be708aa6fabd49039c4a0f14849ec59e.html`
- `site/fzpt/sjcx/lhsys/index.html`
- `site/fzpt/sjcx/rzxm/rzxx/index.html`
- `site/fzpt/swcj/index.html`
- `site/fzpt/szzy/gxfw/index.html`
- `site/fzpt/wytg/index.html`
- `site/fzpt/wytg/tgcj/fwqd/index.html`
- `site/fzpt/wytg/tgfw/fwqd/index.html`
- `site/fzpt/wytg/tgsj/sjqd/index.html`
- `site/fzpt/wytg/tgyy/yyqd/index.html`
- `site/fzpt/wytg/tgzj/zjqd/index.html`
- `site/fzpt/xwzx/1c174acc084c405fa4bc9e32643375d4.html`
- `site/fzpt/xwzx/24185a0865254fe8ad7ce9abc5dc4dea.html`
- `site/fzpt/xwzx/52fdea474a4d49a9898e05fc1987b41f.html`
- `site/fzpt/xwzx/b66f003bed1241c2bc046750f79c7b84.html`
- `site/fzpt/xwzx/b9d1a3cbbe5f441991723c2e4bb39681.html`
- `site/fzpt/xwzx/ddb96dcbd0c64a279591ffd96cbcaea4.html`
- `site/fzpt/xwzx/e099af48afa34bf8965f9334937a86d0.html`
- `site/index.html`
- `site/portal/user/index/index.html`
- `site/ssfwww/hdyg/03a5a86da56e455ab1a552e861d92554.html`
- `site/ssfwww/hdyg/097f23a409904b51b4a6d0c9cd515260.html`
- `site/ssfwww/hdyg/0a25d484c58345148b3a52fa74c0327b.html`
- `site/ssfwww/hdyg/1b4301114a33467d94c9dac61e8958c4.html`
- `site/ssfwww/hdyg/2ea25e3eddb14fc2a66b220857471522.html`
- `site/ssfwww/hdyg/3ecb08fa87b6492aadf1876f783a8263.html`
- `site/ssfwww/hdyg/84c5bf30576f4c62adf2873aaa4ab51f.html`
- `site/ssfwww/hdyg/89314a64f1a24b0ba918ce1967e9db6a.html`
- `site/ssfwww/hdyg/ab02167c17444c6d96ebc8d1df937135.html`
- `site/ssfwww/hdyg/afbc2ef05de84842a9352955d9fabe27.html`
- `site/ssfwww/hdyg/e0fd23749bad42f5804f9c720ac918ca.html`
- `site/ssfwww/hdyg/ebef010b12d245299a6e09f44b8ce3bb.html`
- `site/sthz/index.html`
- `site/sthz/jrhb/jrhbxq/index.html`
- `site/yyscww/cgcx/index.html`
- `site/yyscww/index.html`
- `site/yyscww/sjcx/index.html`
- `site/zcjdww/4ac48c13287d42349182e611f721babc.html`
- `site/zcjdww/53caf3db6c8746198141c93c98c110d1.html`
- `site/zcjdww/9b8425f72ddb4343a942e5f0601f5b6d.html`
- `site/zcjdww/a08bf9f47cdb4fb49bfe2b53a6f02308.html`
- `site/zcjdww/c87ce1cd083948749e9eec04e4ef45db.html`
- `site/zcjdww/cc98ee2abdb34a569b0ff66b96945dd6.html`
- `site/zcjdww/e19f52ed60a14ed49a7c27f2ff6fe806.html`
- `site/zcjdww/index.html`

## Styles
- `site/authui/static/css/app.9b364214.css`
- `site/authui/static/css/chunk-0c5e0a26.70545993.css`
- `site/authui/static/css/chunk-libs.ea078ece.css`
- `site/css/base.css`
- `site/css/layui.css`
- `site/css/modules/code.css`
- `site/css/modules/laydate/default/laydate.css`
- `site/css/modules/layer/default/layer.css`

## Scripts/components
- `site/authui/static/js/app.2089bf06.js`
- `site/authui/static/js/chunk-0c5e0a26.0e4788b9.js`
- `site/authui/static/js/chunk-elementUI.b8e23f27.js`
- `site/authui/static/js/chunk-libs.6a1660b8.js`
- `site/js/cjcx_list.js`
- `site/js/common_ajax.js`
- `site/js/Common_AjaxCallApi.js`
- `site/js/commonUrl.js`
- `site/js/ComponentToolFromTwo.js`
- `site/js/demand-registration.js`
- `site/js/footer.js`
- `site/js/gchbsq.js`
- `site/js/hdSyn.js`
- `site/js/header-login.js`
- `site/js/header.js`
- `site/js/index.js`
- `site/js/jquery.min.js`
- `site/js/jquery.SuperSlide.2.1.1.js`
- `site/js/layui.js`
- `site/js/new_cxfw_szzy.js`
- `site/js/new_cxfw_szzynew.js`
- `site/js/new_szzy.js`
- `site/js/ptsj.js`
- `site/js/qx.js`
- `site/js/saveColumn.js`
- `site/js/saveSjjscxData.js`
- `site/js/search_toPage.js`
- `site/js/shujuListNew.js`
- `site/js/sjcx_list.js`
- `site/js/sjcxCjcx.js`
- `site/js/socialProducts.js`
- `site/js/ssjg_xqy.js`
- `site/js/sz_cjcx_lists.js`
- `site/js/ua-parser.min.js`
- `site/js/visit-log.js`
- `site/js/ywslList.js`
- `site/js/yycx_list.js`
- `site/js/zujianList.js`
- `site/js/数据主体.js`
- `site/js/部门.js`
- `site/js/领域.js`

## Assets and supporting files
- `mirror-manifest.json`
- `own-asset-urls.txt`
- `site/authui/static/img/Interi_icon1.f3cc0d28.png`
- `site/authui/static/img/Interi_icon2.bf5f81c3.png`
- `site/cxfuww/cxfw/cxfh/7040af6f20eb4d118c98f63a189199d4/a1417bd28ae44f9d82437269f63e4a17_raw.png`
- `site/cxfuww/cxfw/gnyz/62967d9461e94663891c10354ec8dcd4/b2b5223b536040a38ff2844fccf3b431_raw.png`
- `site/cxfuww/cxfw/pcyz/dfdf5fa785f74421b5eb81ef65304ac3/410a6d4dda904e64a9fc5b9bb3893d39.jpg`
- `site/cxfuww/cxfw/sjcx/739e5130109a44e4958ec7ec3a0a5d42/904bbdc9090a442a88248104c6c70159_raw.png`
- `site/cxfuww/cxfw/zstg/52031f06375d474a9d4f41d305ad363e/99afb6c97adc41eb906e41b82b0b5cae_raw.png`
- `site/cxfuww/szzyml/images/v5_login_icon.png`
- `site/cxfuww/szzyml/zjml/xqy`
- `site/favicon.ico`
- `site/fywmww/szc/46908fea36a945efb8d3d081fff6b411/6e69448846a945f2909e99e9cdc12ce6.jpg`
- `site/fywmww/szc/957aeb149c394f8e948f2dd6724c626c/2c185df5583e4166a7c7b33d09713d73.jpg`
- `site/fywmww/szc/ab6056753b20471193e6f013c38c5d66/14958f1dccb24201bbdaf0270d47bc5a.jpg`
- `site/fywmww/wdyw/1f26e01d88894d3589c2d10a029652f7/9610b380e5294053a2341450aa815f3d.jpg`
- `site/fywmww/ypt/e6b5cb3e8f6e4d7bbabaa03282b75f47/50daa0b79a9e403c89fbf90f8386b170.jpg`
- `site/fywmww/ztjg/fd3e368b316c4950adeea10c4479bd33/57b6de45555249cea476dd84fedcecfd.jpg`
- `site/fywmww/zxjj/9d85bae96d2241f184577eb15c47b01f/ca457a767f2942dd987f09b85d9c1cb3_raw.png`
- `site/fywmww/zxjj/b4f53756d2ce4786913332a55f7e295e/a4e8a79c884a4596a4681e56be0b57c3_raw.png`
- `site/fywmww/zxjj/be48143d3af54dd1b86387be54e6215a/66532e535f804ad883b7b40fb3bd3a05_raw.png`
- `site/fywmww/zxjj/c013c7bc78d9497489110eacbdb686cf/d586edcb66594381bf9b8595ed150685_raw.jpg`
- `site/fywmww/zxjj/c9e4d051abc04ab8b872a72a947d7784/eceacba8ea3d4e0b9ff089325d6e8b47_raw.png`
- `site/fzpt/cjyz/djz/xqy`
- `site/fzpt/cjyz/jbz/xqy`
- `site/fzpt/cjyz/ywc/xqy`
- `site/fzpt/pclm/3ed0bec5eb6047329572b6922d775609/ede1560a1580471e98c645ebc5c9b331.jpg`
- `site/fzpt/sjcx/lhsys/2c605e23cd4f42b5bc891f46d71f79da/35234f14acdd43a2bdf171ec951262a4_raw.png`
- `site/fzpt/sjcx/lhsys/5b6664752c004372b125426812d4bd8c/7076822c9a2e41a4b43654b2e8c13aa7_raw.png`
- `site/fzpt/sjcx/lhsys/6282fa18238140cc9353d1ad712236c6/4da7e977fb8c44668c93064669555fc1_raw.png`
- `site/fzpt/sjcx/lhsys/7df9dfa306fa48dc9cf3b430ec4eea85/842fd64eeda24c139e96ba5d1ed62b85_raw.png`
- `site/fzpt/sjcx/lhsys/7ee59bae4c384465b38b3fcd6e67c770/a337a3f6796e4b9c9c619f214e2e37c6_raw.png`
- `site/fzpt/sjcx/lhsys/abba9302cce94990adbc3de64e9c2b61/41842f6a1f6247d2a4a3290fcf58e878_raw.png`
- `site/fzpt/sjcx/lhsys/be708aa6fabd49039c4a0f14849ec59e/b5c44ca17f12454ba1e73712d5894046_raw.png`
- `site/fzpt/sjcx/rzxm/rzxmxqy`
- `site/fzpt/szzy/gxfw/2627d31ce57541c383207dc618c12af1/e4ae715d10a248adb86f1c0a7bb636dc_raw.png`
- `site/fzpt/szzy/gxfw/517fe60ac0c44743b35173fa09313333/dbf497968f8a4088bbd8a109272812f3_raw.png`
- `site/fzpt/szzy/gxfw/67f51e047f9245339f943877351d6817/2591f610db694066ab6faf6842cbfc6d_raw.png`
- `site/fzpt/szzy/gxfw/6adcd4a685944bbb868665d04bb8103e/fbeb42ae64514a93b6583f0dcce91324_raw.png`
- `site/fzpt/szzy/gxfw/b2e311a02f0a4773a8ca3f3d51d88ba5/68f8bcb18f6844adb90dc4efae7ee193_raw.png`
- `site/fzpt/szzy/gxfw/b9128b7440c34c4fbd703ffeebba7e41/44403eb815284aad98e4254bf1c9dc16_raw.png`
- `site/fzpt/szzy/gxfw/dfcc85fef4b942d688e7b6658bb13871/85f47dbc17274cafb7183c1b1e738552_raw.png`
- `site/fzpt/szzy/gxfw/fdf988a80dc94306911f31e5022eaf3c/ca0a41dc5b4c4dfd94c5ee8f626c8032_raw.png`
- `site/fzpt/wysq/079694c47ae04e1aade20c0a0bcf6309/49394c2024be47909cd1666f9086b754_raw.png`
- `site/fzpt/wysq/475eed82e7c841838f84edada7e74f0b/75af5b06170a4974a44b4e1570d9940b_raw.png`
- `site/fzpt/wysq/6f87710c4e594b9a829169d8fa5920d9/970c17dd870843328f31857a66974890_raw.png`
- `site/fzpt/wysq/94fff376509241d795059fd19b799e1f/f910feaffdb84fecbf3ea873a1ff60fd_raw.png`
- `site/fzpt/wysq/be7a6ded042a4c8fa4436500f55da029/3e916a3a6cc747b6b2e151e0758f37fa_raw.png`
- `site/fzpt/wysq/xqfk`
- `site/fzpt/wytg/02daa3541a104fbf932d4f25c357b761/690e1fd9859245cbbb85df38e93b9029_raw.png`
- `site/fzpt/wytg/5fbcfddb6d8d4d8d83edfba9085fe1f2/3d1b568f14a74d97bc98e0fc8123a719_raw.png`
- `site/fzpt/wytg/68ce2d7e9016430aa3d5c15b0e0e7284/b4d077f9c5f94bd5b43fa10e0f35f369_raw.png`
- `site/fzpt/wytg/7b4bf273cfe248e2bbb31c673d14ace2/eb6d76795e0f41189d257677bf238f1c_raw.png`
- `site/fzpt/wytg/da93639f9ef94472a2bab749101cd527/2819402b2a1742ef8598a164f28dca94_raw.png`
- `site/fzpt/xwzx/24185a0865254fe8ad7ce9abc5dc4dea/306e362594ce4ab785fd3a2045f08039.jpg`
- `site/images/annex.png`
- `site/images/assistant-mascot.png`
- `site/images/bannertext20060802.png`
- `site/images/bg_sthz.jpg`
- `site/images/bz_logo.svg`
- `site/images/call.png`
- `site/images/gywm_bg02.jpg`
- `site/images/index_bg_1.png`
- `site/images/index_logo.png`
- `site/images/location.png`
- `site/images/shcsj_icon02.png`
- `site/images/sjml_search.png`
- `site/images/szml_icon.png`
- `site/images/v4-index-colbg3.png`
- `site/images/v4-index-colbg6.png`
- `site/images/v4-index-tr04.png`
- `site/images/v5_index_bg07.png`
- `site/images/v5_index_bg10.png`
- `site/images/v5_login_icon.png`
- `site/images/v5_pic09.jpg`
- `site/images/v5_pic10.jpg`
- `site/images/v5_pic11.jpg`
- `site/images/v5_pic12.jpg`
- `site/images/v5-h3-bg01-2.png`
- `site/images/v5-h3-bg01.png`
- `site/images/v5-h3-bg10.png`
- `site/images/v5-h3-bg11.png`
- `site/images/v5-icon-gxfw.png`
- `site/images/v5-icon-jsnlqd.png`
- `site/images/v5-icon-sjzy.png`
- `site/images/v5-icon-yws.png`
- `site/images/v5-icon-zjzy.png`
- `site/images/v5-index-search-icon.png`
- `site/images/v5-index-tr01.png`
- `site/images/v5-index-tr02.png`
- `site/images/v5-index-tr03.png`
- `site/images/v5-index-tr04.png`
- `site/images/v5-rzqy-1.png`
- `site/images/v5-rzqy-10.png`
- `site/images/v5-rzqy-11.png`
- `site/images/v5-rzqy-12.png`
- `site/images/v5-rzqy-13.png`
- `site/images/v5-rzqy-14.png`
- `site/images/v5-rzqy-15.png`
- `site/images/v5-rzqy-16.png`
- `site/images/v5-rzqy-17.png`
- `site/images/v5-rzqy-18.png`
- `site/images/v5-rzqy-19.png`
- `site/images/v5-rzqy-2.png`
- `site/images/v5-rzqy-20.png`
- `site/images/v5-rzqy-21.png`
- `site/images/v5-rzqy-3.png`
- `site/images/v5-rzqy-4.png`
- `site/images/v5-rzqy-5.png`
- `site/images/v5-rzqy-6.png`
- `site/images/v5-rzqy-7.png`
- `site/images/v5-rzqy-8.png`
- `site/images/v5-rzqy-9.png`
- `site/images/v5-rzqy-xz1.png`
- `site/images/v5-rzqy-xz2.png`
- `site/images/v5-rzqy-xz3.png`
- `site/images/v5-rzqy-xz4.png`
- `site/images/v5-rzqy-xz5.png`
- `site/images/v5-rzqy-xz6.png`
- `site/images/v5-rzqy-xz7.png`
- `site/images/v5-rzqy-xz8.png`
- `site/images/v5-rzqy-xz9.png`
- `site/images/v6_index_bg_yy.jpg`
- `site/images/v6_index_bg08.png`
- `site/images/v6_index_bg09.png`
- `site/images/v6-h3-bg-04.png`
- `site/images/v6-h3-bg01-ywc.png`
- `site/images/v6-h3-bg02-jbz.png`
- `site/images/v6-h3-bg03-djz.png`
- `site/images/v6-index-nav.png`
- `site/images/v6-jt-pic2.png`
- `site/images/v6-wj-pic1.png`
- `site/images/v7-firstContent.png`
- `site/images/v7-index-searc.png`
- `site/images/v7-search_bg01_h.png`
- `site/images/v7-wytg-bg.png`
- `site/images/v7-yy-h3-bg01.png`
- `site/images/v7-yy-h3-bg02.png`
- `site/images/v7-yy-icon.png`
- `site/images/zj_dbgf.pdf`
- `site/images/zj_txsm.pdf`
- `site/images/zx_logo.svg`
- `site/log.gif`
- `site/portal/api/common/calling/page`
- `site/portal/api/common/calling/publicCall`
- `site/portal/oauth/currentUser`
- `site/ssfwww/hdyg/097f23a409904b51b4a6d0c9cd515260/f339a23f2af24dbda96c5a96f8270eff.jpg`
- `site/ssfwww/hdyg/0a25d484c58345148b3a52fa74c0327b/e4bb71c4b8d54a0484760af752197c1b_raw.png`
- `site/ssfwww/hdyg/1b4301114a33467d94c9dac61e8958c4/ca3ebd6bb4504a2d9ee4b762b1bbb201.jpg`
- `site/ssfwww/hdyg/2ea25e3eddb14fc2a66b220857471522/6626c3ead77346d797b22732a615a2eb.jpg`
- `site/ssfwww/hdyg/84c5bf30576f4c62adf2873aaa4ab51f/dd5cac5bb33b4ef79f2f8bc2af4ff2ca_raw.png`
- `site/ssfwww/hdyg/89314a64f1a24b0ba918ce1967e9db6a/bf48e812754b4ffeb4330a220872a515_raw.png`
- `site/ssfwww/hdyg/ab02167c17444c6d96ebc8d1df937135/4492df3e71bc4da8b39b6aac6b86584d_raw.png`
- `site/ssfwww/hdyg/afbc2ef05de84842a9352955d9fabe27/7991e0778793453b874220d67b24ff8b.jpg`
- `site/ssfwww/hdyg/e0fd23749bad42f5804f9c720ac918ca/5f12380dac1a4eaca5ad04d3d1f7c5a6.jpg`
- `site/ssfwww/hdyg/ebef010b12d245299a6e09f44b8ce3bb/63b84a9340b6491dbb03d9f8e3134330_raw.png`
- `site/sthz/cgyy`
- `site/sthz/jrhb/images/v5_login_icon.png`
- `site/sthz/sthz/2667212330ea4ed1a7876e0a4af77419/ad95c551f1c14757abe600faa548d0f4_raw.png`
- `site/sthz/sthz/28ff1c5330bb4637b1260f6016e85625/7a2632b0611246fb84b2667de24be6c4_raw.png`
- `site/sthz/sthz/2b6de3e727a74211b1f8951625ef3e98/2dbfe680837e43bca4913b2a2908eb65_raw.png`
- `site/sthz/sthz/33549779223d4f02995446b10f396770/021555678e78412187d75057136e2a7a_raw.png`
- `site/sthz/sthz/35c80f0449ec4949a0ec8808a44a2078/62871120d09a4a82a0a75f76142fbd9b_raw.png`
- `site/sthz/sthz/3a46207c842e4a95a0ed9a135ec4d86b/6d90660153c04ca587c5d8557a198787_raw.png`
- `site/sthz/sthz/3f2a53743d8844bc8aadb607a7bcbf5f/fadf5220769c4a75bcede1e430337814_raw.png`
- `site/sthz/sthz/469bcf830e3f44ed84a64b9b5169b4fc/b41591cc4b72466abddf198e50e3f809_raw.png`
- `site/sthz/sthz/49793ae171c94340a5e0e5ab9bf9ad41/e7c786ca4fc44b5ab27e5c964946fb44_raw.png`
- `site/sthz/sthz/4c95551db81e401aac33c3284c5433f3/2436510733e3443f93ab1e851c2fc83a_raw.png`
- `site/sthz/sthz/544d5cd2abc846eda4d2037acb4f2113/32cc60e175554028a6f1c7471d4f1895_raw.png`
- `site/sthz/sthz/5e205e908f4e495f89f59f53e0358562/e686326fe9d84e95a82c9e029b7792ed_raw.png`
- `site/sthz/sthz/6a25bb920ea54fa4a530a7718bdf0236/13c3c102d542494aa5100af282b91ed7_raw.png`
- `site/sthz/sthz/6bdee0d8aefd46cba77af907021078d3/843115dc116547149f35758eb938c0c8_raw.png`
- `site/sthz/sthz/6d469f4348f04ed3ab94753d8e9c0d3a/9f3f2433fa834275b6ae734e789388bf_raw.png`
- `site/sthz/sthz/721c912d89eb43c98eb3fb4576043ef2/f7d576baf4ae44409b46a09c0770108a_raw.png`
- `site/sthz/sthz/76718b3178e34a4e901db010011eafe1/fdac556958f4480f8fb6312f92554648_raw.png`
- `site/sthz/sthz/7b8d345065984af8be9315d519c00838/4da98afa091944e18ec5f74bbaa60036_raw.png`
- `site/sthz/sthz/7dc193fd47cc4f48985897709d27aa22/3383a75ce8b14987aea203a57bb1a821_raw.png`
- `site/sthz/sthz/82fde1dfce87461fb3378171fe0fd8aa/a8d12ef9e7a342a5bb1cf754019f3c1e_raw.png`
- `site/sthz/sthz/90b5ee5b01414274b9cd56f6b0d2173e/2d7d4e7124104d02952a924f2c8ab472_raw.png`
- `site/sthz/sthz/915e366ae55f4f6780255e4ad8c9f587/bb4176816cc0481ea89b9a214b28bda9_raw.png`
- `site/sthz/sthz/92939a0cecb541b1943106cb4119fd6c/7caeac8d5b4e4acba1caa2bd5c612aa5_raw.png`
- `site/sthz/sthz/943d82fca3594e8d9bf1e0b7e19bff99/0d129a8f82594c879d8a478dd39e9e3d_raw.png`
- `site/sthz/sthz/991e7501e9e447feb524b72290eab0d8/3386bcda88f1489e9411bf28068b3dd5_raw.png`
- `site/sthz/sthz/9af732932e8a4530bdd5effac6addeaf/f34ac3ebe1ae45dc9cbc28df8042aa63_raw.png`
- `site/sthz/sthz/9bc97c1e7c0940d18596a3dc0622b04f/ee070408ac6d46078e94f34d08fcd2dc_raw.png`
- `site/sthz/sthz/9ea784067db9450ea074815e8d7dc666/85704863b62644d5a21449835fd68a8e_raw.png`
- `site/sthz/sthz/a655873f6bc74b51b3258108256ed2e1/dc79d065727643ad88ff1c79d9ec9971_raw.png`
- `site/sthz/sthz/b0396635db4e457eacac087b1251bec6/a2acce000d3e499c92b3882760654b17.jpg`
- `site/sthz/sthz/b0a7373f15bd405498b8a52981f8fa39/5c45b3f9ea5c4686a89ca002900356a0_raw.png`
- `site/sthz/sthz/b3129533e0554da8b305911dbd65af1e/e2ff46027f794c3ca9c2459dcf2dc3da_raw.png`
- `site/sthz/sthz/b42962099d8842f69834ed1e7f015e8b/2e00bb5b93654724be62d086bf82992a_raw.png`
- `site/sthz/sthz/bc714ac5c3bf48b28b1106d1c3f08d5c/08f240da9fc94259b0a41207c0ffad4c_raw.png`
- `site/sthz/sthz/c7cd346d64584e45b6865db7ec513e1a/3d69b371154d4d18a7c4765c85e0ee71_raw.png`
- `site/sthz/sthz/cbd3fbb91ad1485296e8a1a0aedd1e32/0c24131ba04641e0b001412c9bd51107_raw.png`
- `site/sthz/sthz/cc8761c3931c496684236fb19ce2251c/b56bee1783b2412c99752d169ec1a9d8_raw.png`
- `site/sthz/sthz/ccdbc09dedbd4d6ba2fe1d8a5b604cb8/d1b2f556135a4a7fa29c6abcffdc9136_raw.png`
- `site/sthz/sthz/d660b37d163a4bdeb345f19732582cbf/9d7154d7d1d149e4a3ca8d25563999bb_raw.png`
- `site/sthz/sthz/d72950279e0e4a958657ee88d9f5fc7c/be419963fffb459fadf217eb3f3951bc_raw.png`
- `site/sthz/sthz/d95a865f6ab448828f8034cf656755cb/b0c2302c654945379728f80fdf384427_raw.png`
- `site/sthz/sthz/ec0647417eeb4c52893e3fd9497b4b44/175b502e3a81433796b7b42cc5f0335a_raw.png`
- `site/sthz/sthz/f1efe02b0b394931a4586ccd4b46a4a8/6c2c14e7ae714ff483467e44183dc303.jpg`
- `site/sthz/sthz/f92ba1ffc4014ebd8d964cc18adfca7c/2a9f190fef494b4e89ab2371a97d4b24_raw.png`
- `site/sthz/sthz/ff3f8942fae44e67a826129609add6e9/1ef6ccdcb41e45f2b2831de9c162f956_raw.png`
- `site/sthz/wysq/395c55cbd743449fb289e13c5b084aaf/562f466340724991867fc99212003bde_raw.png`
- `site/sthz/wysq/4303a65023384b30b1d1046f51147e4a/cde7ebae9c864692bc556d85b9bdae4f_raw.png`
- `site/sthz/wysq/aa236e6de0ac4fa998bf1d31dc504c18/0965bc38387648519e1d37423a6a4e7f_raw.png`
- `site/sthz/wysq/fc97bd8c288640ec8f6c1e33ecaa1f9c/a76900b7b12845f4a5c299ef449b6422_raw.png`
- `site/video/bannervideo-20060802.mp4`
- `site/yyscww/cgcx/xqy`
- `site/yyscww/cgcx/yycxxq`
- `third-party.json`

## Coding checklist for AI tools
1. Inspect `site/cxfuww/index.html` and `DESIGN-MANIFEST.json` first and identify reusable components before coding.
2. Implement each user-facing screen file as its own route/surface; keep launcher, landing, app, platform, and OS widget files separate.
3. Extract design tokens into the target stack: colors, type scale, spacing, radius, shadows, and motion.
4. Implement layout with real 2025–2026 responsive breakpoints, fluid type/spacing, and container-query-aware component behavior; test with no horizontal overflow.
5. Preserve interactive controls, hover/focus/pressed states, form behavior, validation, and copy actions where present.
6. Implement domain-specific in-app modules with real states; do not flatten them into generic cards.
7. Keep landing page, product screens, and OS widget/quick-access surfaces separate when present.
8. Confirm the production result visually matches the exported design before refactoring internals.
9. Reject implementation shortcuts that flatten the design into generic cards, generic gradients, placeholder stats, or framework-default typography.
10. If a detail is ambiguous, keep the exported HTML/CSS/JS behavior rather than inventing a new pattern.
