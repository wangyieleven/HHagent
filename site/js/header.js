(function () {
  function computeBaseRel() {
    var scripts = document.getElementsByTagName('script');
    var s = scripts[scripts.length - 1];
    var src = (s && s.getAttribute('src')) || '';
    var depth = 0;
    var idx = 0;
    while ((idx = src.indexOf('../', idx)) !== -1) { depth++; idx += 3; }
    if (depth === 0) {
      var loc = window.location;
      var pathname = (loc && loc.pathname) || '';
      if (!loc || loc.protocol === 'file:') {
        return pathname.charAt(pathname.length - 1) === '/' ? pathname : pathname.replace(/[^/]*$/, '');
      }
      var lastSlash = pathname.lastIndexOf('/');
      var dir = lastSlash >= 0 ? pathname.substring(0, lastSlash) : '';
      var trimmed = dir.replace(/^\/+/, '').replace(/\/+$/, '');
      depth = trimmed.length === 0 ? 0 : trimmed.split('/').length;
    }
    var base = '';
    for (var i = 0; i < depth; i++) base += '../';
    return base;
  }
  var baseRel = computeBaseRel();

  var navItems = [
    { path: 'index.html',                  label: '首页' },
    { path: 'cxfuww/index.html',           label: '创新服务' },
    { path: 'yyscww/index.html',           label: '创新成果' },
    { path: 'cxfuww/szzyml/index.html',    label: '数字资源' },
    { path: 'fzpt/wytg/index.html',        label: '我要提供' },
    { path: 'sthz/index.html',             label: '我要申请' },
    { path: 'zcjdww/index.html',           label: '政策解读' },
    { path: 'fywmww/index.html',           label: '关于我们' },
    { path: 'fzpt/swcj/index.html',        label: '走进创新中心' }
  ];

  function getDir(p) {
    var i = p.lastIndexOf('/');
    return i >= 0 ? p.substring(0, i) : '';
  }

  var pathname = (window.location && window.location.pathname) || '';
  pathname = pathname.replace(/^\/+/, '');
  var lastSlash = pathname.lastIndexOf('/');
  var currentSitePath = lastSlash >= 0 ? pathname.substring(0, lastSlash) : '';
  currentSitePath = currentSitePath.replace(/\/+$/, '');

  var activeIdx = 0;
  var bestLen = -1;
  for (var k = 0; k < navItems.length; k++) {
    var dir = getDir(navItems[k].path);
    var matches = (currentSitePath === dir) ||
                  (dir.length > 0 && currentSitePath.substring(0, dir.length + 1) === dir + '/') ||
                  (dir.length === 0 && currentSitePath.length === 0);
    if (matches && dir.length > bestLen) {
      bestLen = dir.length;
      activeIdx = k;
    }
  }

  document.write("<div class=\"header\">");
  document.write("    <div class=\"nav\">");
  document.write("        <img src=\"" + baseRel + "images/index_logo.png\" class=\"logo\">");
  document.write("		<input type=\"checkbox\" name=\"\" id=\"\">");
  document.write("          <div class=\"hamburger-lines\">");
  document.write("              <span class=\"line line1\"><\/span>");
  document.write("              <span class=\"line line2\"><\/span>");
  document.write("              <span class=\"line line3\"><\/span>");
  document.write("          <\/div>");
  document.write("        <ul class=\"menu-items\">");
  for (var j = 0; j < navItems.length; j++) {
    var href = baseRel + navItems[j].path;
    var cls = (j === activeIdx) ? ' class="cur"' : '';
    document.write("                <a href=\"" + href + "\"" + cls + ">" + navItems[j].label + "<\/a>");
  }
  document.write("                <div class=\"user_login\">");
  document.write("                <div class=\"userTtitle\" id=\"userTtitle\">");
  document.write("                    ");
  document.write("                <\/div>");
  document.write("                <a class=\"login\" href=\"https:\/\/dibj.cn\/portal\/user\/index\" target=\"_blank\">登录<\/a>");
  document.write("            <\/div>");
  document.write("            <\/ul>");
  document.write("    <\/div>");
  document.write("<\/div>");
  document.write("<script type=\"text\/javascript\" src=\"" + baseRel + "js\/header-login.js\"><\/script>");
  document.write("<script type=\"text\/javascript\" src=\"" + baseRel + "js\/Common_AjaxCallApi.js\"><\/script>");
  document.write("<script type=\"text\/javascript\" src=\"" + baseRel + "js\/common_ajax.js\"><\/script>            ");
  document.write("<style>");
  document.write("	.header {background:#E02832 !important;}");
  document.write("	.header .nav ul {width: calc(100% - 240px);}");
  document.write("	    .userTtitle {color: #fff;font-family: '微软雅黑';font-size: 14px;margin-left: 10px; margin-right: 20px; float: right;}");
  document.write("    .nav input[type=\"checkbox\"],.nav .hamburger-lines {display: none;}");
  document.write("    .user_login {display: flex;justify-content: end;align-items: center;}");
  document.write("	.header .nav .login:hover { background:none; }");
  document.write("	.header .nav .login img { margin-left: 15px;}");
  document.write("	 @media only screen and (max-width: 1700px) {");
  document.write("             .header .nav ul a { margin-left: 24px;}");
  document.write("    }");
  document.write("    @media only screen and (max-width: 1400px) {");
  document.write("     .header .nav ul a  {margin-left:18px;}");
  document.write("     .header .nav .login {width:80px;}");
  document.write("    }");
  document.write(" @media only screen and (max-width: 830px) {");
  document.write("    .header { overflow: unset; height: 80px;}");
  document.write("    .header .nav { padding: 0px 30px 0 30px; overflow: unset; z-index: 9999; height: 60px; display: inline-block;}");
  document.write("    .nav input[type=\"checkbox\"],.nav .hamburger-lines {display: block;}");
  document.write("    .nav {display: block;position: relative;}");
  document.write("    .nav input[type=\"checkbox\"] {position: absolute;display: block;height: 26px;width: 26px;top: 20px;right: 20px;z-index: 5;opacity: 0;}");
  document.write("    .nav .hamburger-lines {display: block;height: 28px;width: 28px;position: absolute;top: 17px;right: 10px;z-index: 2;}");
  document.write("    .nav .hamburger-lines .line {display: block;height: 3px;width: 100%;border-radius: 10px;background: #fff;}");
  document.write("    .nav .hamburger-lines .line1 {transform-origin: 0% 0%;transition: transform 0.4s ease-in-out;}");
  document.write("    .nav .hamburger-lines .line2 {transition: transform 0.2s ease-in-out;}");
  document.write("    .nav .hamburger-lines .line3 {transform-origin: 0% 100%;transition: transform 0.4s ease-in-out;}");
  document.write("    .header .nav ul { float: right; display: unset; display: none;}");
  document.write("    .nav .menu-items { float: right; padding-top: 100px;background: #fff;height: 100vh; width: 90vw !important; transform: translateX(100%);display: flex;flex-direction: column;margin-right: -40px;padding-right: 50px;transition: transform 0.5s ease-in-out;box-shadow: 0px 5px 10px 0px #aaa;}");
  document.write("    .nav .menu-items a { width: 100%;}");
  document.write("    .header .nav ul a { width: 100%;}");
  document.write("    .logo {position: absolute;top: 16px;left: 15px; }");
  document.write("    .nav input[type=\"checkbox\"]:checked ~ .menu-items {transform: translateX(0); background: #e8a62f; display: block;}");
  document.write("    .nav input[type=\"checkbox\"]:checked ~ .hamburger-lines {right: 0;}");
  document.write("    .nav input[type=\"checkbox\"]:checked ~ .hamburger-lines .line1 {transform: rotate(55deg);}");
  document.write("    .nav input[type=\"checkbox\"]:checked ~ .hamburger-lines .line2 {transform: scaleY(0);}");
  document.write("    .nav input[type=\"checkbox\"]:checked ~ .hamburger-lines .line3 {transform: rotate(-55deg);}");
  document.write("    .user_login { position: absolute;left: 15px;top: 20px;}");
  document.write("    .userTtitle { font-size:12px}");
  document.write("    .header .nav .login { width: 100px; height: 36px; font-size: 12px; background: #E02832;}");
  document.write("    .header .nav .login:hover {background: #E02832;}");
  document.write("    }");
  document.write("");
  document.write("<\/style>	");
})();
