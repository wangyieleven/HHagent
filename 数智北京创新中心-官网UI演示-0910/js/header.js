document.write("<div class=\"header\">");
document.write("    <div class=\"nav\">");
document.write("        <img src=\"\/images\/index_logo.png\" class=\"logo\">");
document.write("		<input type=\"checkbox\" name=\"\" id=\"\">");
document.write("          <div class=\"hamburger-lines\">");
document.write("              <span class=\"line line1\"><\/span>");
document.write("              <span class=\"line line2\"><\/span>");
document.write("              <span class=\"line line3\"><\/span>");
document.write("          <\/div>");
document.write("        <ul class=\"menu-items\">");
document.write("                <a href=\"\/\" class=\"cur\">首页<\/a>");
document.write("                <a href=\"\/cxfuww\">创新服务<\/a>");
document.write("                <a href=\"\/yyscww\">创新成果<\/a>");
document.write("                <a href=\"\/cxfuww\/szzyml\">数字资源<\/a>");
document.write("                <a href=\"\/fzpt\/wytg\/\">我要提供<\/a>");
document.write("                <a href=\"\/sthz\">我要申请<\/a>");
document.write("                <a href=\"\/zcjdww\">政策解读<\/a>");
document.write("                <a href=\"\/fywmww\">关于我们<\/a>");
document.write("                <a href=\"\/fzpt/swcj/\">走进创新中心<\/a>");
document.write("                <div class=\"user_login\">");
document.write("                <div class=\"userTtile\" id=\"userTtile\">");
document.write("                    ");
document.write("                <\/div>");
document.write("                <a class=\"login\" href=\"https:\/\/dibj.cn\/portal\/user\/index\" target=\"_blank\">登录<\/a>");
document.write("            <\/div>");
document.write("            <\/ul>");
document.write("    <\/div>");
document.write("<\/div>");
document.write("<script type=\"text\/javascript\" src=\"\/js\/header-login.js\"><\/script>");
document.write("<script type=\"text\/javascript\" src=\"\/js\/Common_AjaxCallApi.js\"><\/script>");
document.write("<script type=\"text\/javascript\" src=\"\/js\/common_ajax.js\"><\/script>            ");
document.write("<style>");
document.write("	.header {background:#E02832 !important;}");
document.write("	.header .nav ul {width: calc(100% - 240px);}");
document.write("	    .userTtile {color: #fff;font-family: '微软雅黑';font-size: 14px;margin-left: 10px; margin-right: 20px; float: right;}");
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
document.write("    .userTtile { font-size:12px}");
document.write("    .header .nav .login { width: 100px; height: 36px; font-size: 12px; background: #E02832;}");
document.write("    .header .nav .login:hover {background: #E02832;}");
document.write("    }");
document.write("");
document.write("<\/style>	");
// 确保 DOM 加载完成后再执行
document.addEventListener('DOMContentLoaded', function () {
// 获取当前页面的路径
const currentPath = window.location.pathname;
// 获取所有导航链接
const navLinks = document.querySelectorAll('.nav ul a');
// 用于存储最佳匹配的链接
let bestMatch = null;
let bestMatchLength = 0;
// 遍历所有导航链接
navLinks.forEach(link => {
// 获取链接的路径
const linkPath = link.getAttribute('href');
// 如果当前路径以链接路径开头
if (currentPath.startsWith(linkPath)) {
  // 检查是否是更精确的匹配
  if (linkPath.length > bestMatchLength) {
    bestMatch = link;
    bestMatchLength = linkPath.length;
  }
}
});
// 移除所有导航链接的 nav_cur 类
navLinks.forEach(link => {
link.classList.remove('cur');
});
// 为最佳匹配的链接添加 nav_cur 类
if (bestMatch) {
bestMatch.classList.add('cur');
}
});