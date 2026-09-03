#!/usr/bin/env python3
"""Static safety and integrity checks for the HHagent prototype.

This script deliberately uses only Python's standard library so it can run
locally and in GitHub Actions without installing project dependencies.
"""
from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "mirror" / "site"

REQUIRED_FILES = [
    SITE / "index.html",
    SITE / "css" / "hehe-assistant.css",
    SITE / "js" / "commonUrl.js",
    SITE / "js" / "Common_AjaxCallApi.js",
    SITE / "js" / "common_ajax.js",
    SITE / "js" / "hdSyn.js",
    SITE / "js" / "header-login.js",
    SITE / "js" / "visit-log.js",
    SITE / "js" / "hehe-assistant-forms.js",
    SITE / "js" / "hehe-assistant-conversation.js",
    SITE / "js" / "hehe-assistant-layout.js",
    SITE / "js" / "hehe-assistant-hardening.js",
    SITE / "js" / "hehe-assistant-layout-core.js",
    SITE / "mock" / "legacy-api-disabled.json",
    ROOT / "scripts" / "browser_smoke.mjs",
]

CRITICAL_ASSET_REFERENCES = [
    "./css/hehe-assistant.css",
    "./js/hehe-assistant-forms.js",
    "./js/hehe-assistant-conversation.js",
    "./js/hehe-assistant-layout.js",
]

RUNTIME_JS = [
    SITE / "js" / "commonUrl.js",
    SITE / "js" / "Common_AjaxCallApi.js",
    SITE / "js" / "common_ajax.js",
    SITE / "js" / "hdSyn.js",
    SITE / "js" / "header-login.js",
    SITE / "js" / "visit-log.js",
    SITE / "js" / "hehe-assistant-conversation.js",
    SITE / "js" / "hehe-assistant-layout.js",
    SITE / "js" / "hehe-assistant-hardening.js",
    SITE / "js" / "hehe-assistant-layout-core.js",
]

PRIVATE_IP = re.compile(
    r"(?<!\d)(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|"
    r"172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})(?!\d)"
)


def fail(errors: list[str], message: str) -> None:
    errors.append(message)


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def main() -> int:
    errors: list[str] = []

    for path in REQUIRED_FILES:
        if not path.is_file():
            fail(errors, f"缺少必需文件：{path.relative_to(ROOT)}")

    if errors:
        return report(errors)

    index = read_text(SITE / "index.html")
    for reference in CRITICAL_ASSET_REFERENCES:
        if reference not in index:
            fail(errors, f"index.html 未引用关键助手资源：{reference}")

    for path in RUNTIME_JS:
        text = read_text(path)
        matches = sorted(set(PRIVATE_IP.findall(text)))
        if matches:
            fail(
                errors,
                f"运行时代码包含私网 IP：{path.relative_to(ROOT)} -> {', '.join(matches)}",
            )

    header_login = read_text(SITE / "js" / "header-login.js")
    if re.search(r"(?:localStorage|sessionStorage)\.setItem\s*\(", header_login):
        fail(errors, "header-login.js 不得把登录态、用户标识或令牌写入浏览器存储")
    if ".innerHTML" in header_login:
        fail(errors, "header-login.js 显示用户信息时必须使用 textContent，不能使用 innerHTML")
    if "enableAuth" not in header_login or "mode === 'demo'" not in header_login:
        fail(errors, "header-login.js 必须在 demo 模式默认禁用真实认证请求")

    common_url = read_text(SITE / "js" / "commonUrl.js")
    if "enableLiveApi" not in common_url or "legacy-api-disabled.json" not in common_url:
        fail(errors, "commonUrl.js 必须默认落到本地 Mock，并通过显式配置启用真实 API")

    common_call = read_text(SITE / "js" / "Common_AjaxCallApi.js")
    common_ajax = read_text(SITE / "js" / "common_ajax.js")
    if "hhIsDemoRuntime" not in common_call or "hhDemoApiEnvelope" not in common_call:
        fail(errors, "Common_AjaxCallApi.js 必须在 demo 模式直接返回空结果，不能发起业务请求")
    if "isDemoRuntime" not in common_ajax or "legacyDemoResponse" not in common_ajax:
        fail(errors, "common_ajax.js 必须在 demo 模式阻断直接 POST 和公共接口调用")

    hd_syn = read_text(SITE / "js" / "hdSyn.js")
    forbidden_hd_syn = {
        "完整页面 URL": r"location\.href|document\.URL",
        "浏览器持久存储": r"localStorage|sessionStorage",
        "beforeunload": r"beforeunload",
        "原生 XHR": r"XMLHttpRequest",
        "持久设备 ID": r"device[_-]?id|Device-Id",
    }
    for label, pattern in forbidden_hd_syn.items():
        if re.search(pattern, hd_syn, re.IGNORECASE):
            fail(errors, f"hdSyn.js 仍包含{label}")
    if "enableHdSyn===true" not in hd_syn or "config.mode!=='demo'" not in hd_syn:
        fail(errors, "hdSyn.js 必须在 demo 模式默认关闭，并要求显式同源配置")

    visit_log = read_text(SITE / "js" / "visit-log.js")
    forbidden_visit_patterns = {
        "完整页面 URL": r"location\.href",
        "同步 beforeunload 上报": r"beforeunload",
        "同步 AJAX": r"async\s*:\s*false",
        "原生同步请求": r"XMLHttpRequest",
    }
    for label, pattern in forbidden_visit_patterns.items():
        if re.search(pattern, visit_log):
            fail(errors, f"visit-log.js 仍包含{label}")
    if "enableVisitLog !== true" not in visit_log or "mode === 'demo'" not in visit_log:
        fail(errors, "visit-log.js 必须在 demo 模式默认关闭，并要求显式开关")

    conversation = read_text(SITE / "js" / "hehe-assistant-conversation.js")
    for required in ["MAX_BOOT_ATTEMPTS", "DRAFT_TTL_MS", "looksLikeQuestion", "startOfWeek"]:
        if required not in conversation:
            fail(errors, f"conversation.js 缺少稳定性保护：{required}")
    if "cleanDraftModel" not in conversation or "PRIVATE_DRAFT_FIELDS" not in conversation:
        fail(errors, "conversation.js 必须在保存草稿前移除敏感字段")

    layout_loader = read_text(SITE / "js" / "hehe-assistant-layout.js")
    layout_hardening = read_text(SITE / "js" / "hehe-assistant-hardening.js")
    layout_core = read_text(SITE / "js" / "hehe-assistant-layout-core.js")
    layout = layout_loader + "\n" + layout_hardening + "\n" + layout_core
    for required in [
        "aria-live",
        "ASSISTANT_STORAGE_PREFIX",
        "sanitizeRichText",
        "addedMessages",
        "清除本次演示数据",
    ]:
        if required not in layout:
            fail(errors, f"布局模块缺少安全或可访问性保护：{required}")
    if "sanitizeAssistantStorage(value,name)" not in layout_hardening:
        fail(errors, "hardening.js 的存储脱敏必须仅应用于助手命名空间")
    if "hehe-assistant-hardening.js" not in layout_loader or "hehe-assistant-layout-core.js" not in layout_loader:
        fail(errors, "layout.js 必须按顺序加载 hardening 与 core 模块")

    mock_path = SITE / "mock" / "legacy-api-disabled.json"
    try:
        mock = json.loads(read_text(mock_path))
        if mock.get("success") is not True or not isinstance(mock.get("data"), list):
            fail(errors, "legacy-api-disabled.json 结构不符合通用空结果约定")
    except json.JSONDecodeError as exc:
        fail(errors, f"Mock JSON 无法解析：{exc}")

    browser_smoke = read_text(ROOT / "scripts" / "browser_smoke.mjs")
    for required in ["chromium", "算力申请的材料要点", "window.__HH_XSS__", "13800138000", "清除本次演示数据"]:
        if required not in browser_smoke:
            fail(errors, f"browser_smoke.mjs 缺少核心回归断言：{required}")

    node = shutil.which("node")
    if node:
        for path in RUNTIME_JS + [SITE / "js" / "hehe-assistant-forms.js", ROOT / "scripts" / "browser_smoke.mjs"]:
            result = subprocess.run(
                [node, "--check", str(path)],
                cwd=ROOT,
                text=True,
                capture_output=True,
                check=False,
            )
            if result.returncode != 0:
                detail = (result.stderr or result.stdout).strip()
                fail(errors, f"JavaScript 语法检查失败：{path.relative_to(ROOT)}\n{detail}")
    else:
        print("[WARN] 未找到 Node.js，已跳过 JavaScript 语法检查。")

    return report(errors)


def report(errors: list[str]) -> int:
    if errors:
        print("HHagent 静态安全检查失败：", file=sys.stderr)
        for index, error in enumerate(errors, start=1):
            print(f"  {index}. {error}", file=sys.stderr)
        return 1

    print("HHagent 静态安全检查通过：关键资源、运行时配置、隐私保护和 JS 语法均符合要求。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
