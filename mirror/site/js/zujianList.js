(function(){
  // ===== 列表两列布局（响应式间距） =====
  ;(function () {
    var s = document.createElement('style')
    s.textContent =
      '#zujianList{display:grid !important;grid-template-columns:1fr 1fr;gap:16px;align-content:start;}' +
      '#zujianList>li{width:auto !important;margin-top:0 !important;max-height:140px;overflow:hidden;}' +
      '@media(min-width:1600px){#zujianList{gap:24px;}#zujianList>li{padding:4px 4px;}}' +
      '@media(min-width:1920px){#zujianList{gap:32px;}#zujianList>li{padding:6px 8px;}}'
    document.head.appendChild(s)
  })()

let paginationInstance = null;
const $paginationContainer = $(".fenye");
let currentCatalogId = null; // 保存当前选中的分类ID
let currentKeyword = '';     // 保存当前搜索关键词
let currentPage = 1;         // 保存当前分页页码（用于登录回跳恢复）

document.addEventListener('DOMContentLoaded', () => {
    ensureFavoriteAssets();
    bindFavoriteLoginModal();
    applyStateFromUrl();
    queryComponentByType("COMPONENT", "zujianList", currentPage || 1, currentCatalogId);
    initializeSearchBox();

    apiService.getStatCnt({
        resourceType: "COMPONENT"
    }).then(res => { if (!res.success) { console.error('获取统计数据失败:', res.message || res.error); return; }

    // 渲染分类树
    if (res.data) {
        renderCatalogTree(res.data);
    }
});
});

function applyStateFromUrl() {
    try {
        var href = window.location && window.location.href ? window.location.href : "";
        if (href && (href.indexOf("&amp;") >= 0 || href.indexOf("&#38;") >= 0)) {
            var cleanHref = href.replace(/&amp;|&#38;/g, "&");
            if (cleanHref !== href && window.history && window.history.replaceState) {
                window.history.replaceState(null, "", cleanHref);
            }
        }
    } catch (e) {}

    var sp = null;
    try {
        var search = window.location && window.location.search ? window.location.search : "";
        search = String(search || "").replace(/&amp;|&#38;/g, "&");
        sp = new URLSearchParams(search);
    } catch (e) { sp = null; }
    if (!sp) return;

    var keyword = (sp.get("keyword") || sp.get("amp;keyword") || "").trim();
    var catalogId = (sp.get("catalogId") || sp.get("amp;catalogId") || "").trim();
    var pageStr = (sp.get("page") || sp.get("amp;page") || "").trim();
    var pageNum = parseInt(pageStr, 10);

    if (keyword) currentKeyword = keyword;
    if (catalogId) currentCatalogId = catalogId;
    if (pageStr && isFinite(pageNum) && pageNum > 0) currentPage = pageNum;
}

function buildStatefulUrl() {
    try {
        var href = window.location && window.location.href ? window.location.href : "/";
        href = String(href || "/").replace(/&amp;|&#38;/g, "&");
        var u = new URL(href);
        u.searchParams.delete("targetUrl");
        u.searchParams.delete("amp;page");
        u.searchParams.delete("amp;keyword");
        u.searchParams.delete("amp;catalogId");
        if (currentKeyword) u.searchParams.set("keyword", currentKeyword);
        if (currentCatalogId) u.searchParams.set("catalogId", String(currentCatalogId));
        if (currentPage && Number(currentPage) > 1) u.searchParams.set("page", String(currentPage));
        return u.toString();
    } catch (e) {
        return (window.location && window.location.href) ? window.location.href : "/";
    }
}

function normalizeFavorited(value) {
    if (value === true) return true;
    if (value === false) return false;
    var s = String(value == null ? "" : value).trim().toLowerCase();
    if (!s) return false;
    return s === "1" || s === "true" || s === "yes" || s === "y";
}

let __favoriteUserPromise = null;
let __favoriteUserLoggedIn = false;
let __favoriteUserCheckedAt = 0;
let __favoriteInFlightMap = {};
let __favoriteLastClickAtMap = {};
let __favoriteDebounceMs = 800;

function fetchCurrentUser(force) {
    var now = Date.now();
    if (!force && __favoriteUserPromise && now - __favoriteUserCheckedAt < 10000) return __favoriteUserPromise;
    __favoriteUserPromise = fetch("/portal/oauth/currentUser", { credentials: "include" })
        .then(function (r) { return r.json(); })
        .then(function (res) {
            __favoriteUserLoggedIn = !!(res && res.code === 0 && res.data);
            __favoriteUserCheckedAt = Date.now();
            return __favoriteUserLoggedIn;
        })
        .catch(function () {
            __favoriteUserLoggedIn = false;
            __favoriteUserCheckedAt = Date.now();
            return false;
        });
    return __favoriteUserPromise;
}

function ensureFavoriteAssets() {
    if (!document.getElementById("favorite-style")) {
        var style = document.createElement("style");
        style.id = "favorite-style";
        style.textContent = ''
            + '.resource-title{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;}'
            + '.resource-title-text{flex:1;min-width:0;display:flex;align-items:center;gap:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'
            + '.favorite-star{flex:0 0 auto;width:24px;height:24px;border-radius:4px;border:1px solid #FDE6D5;background:rgba(255,255,255,.9);color:#999;display:inline-flex;align-items:center;justify-content:center;font-size:16px;line-height:1;cursor:pointer;padding:0;}'
            + '.favorite-star.is-favorited{color:#FF7A25;border-color:#FF7A25;}'
            + '.favorite-star:disabled{opacity:.6;cursor:not-allowed;}'
            + '.favorite-login-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.35);display:none;align-items:center;justify-content:center;z-index:9999;}'
            + '.favorite-login-modal-overlay.is-active{display:flex;}'
            + '.favorite-login-modal{width:520px;max-width:calc(100vw - 32px);background:#fff;border-radius:8px;padding:22px 22px 18px 22px;box-sizing:border-box;}'
            + '.favorite-login-modal p{margin:0 0 18px 0;font:400 16px/170% "微软雅黑";color:#333;}'
            + '.favorite-login-modal a{color:#1677ff;text-decoration:none;}'
            + '.favorite-login-modal .modal-btns{display:flex;justify-content:center;}'
            + '.favorite-login-modal .favorite-login-close{padding:7px 22px;border-radius:4px;text-decoration:none;font-size:14px;cursor:pointer;background:#ff7a25;color:#fff;border:1px solid #ff7a25;}';
        document.head.appendChild(style);
    }
    if (!document.getElementById("favoriteLoginModal")) {
        var overlay = document.createElement("div");
        overlay.className = "favorite-login-modal-overlay";
        overlay.id = "favoriteLoginModal";
        overlay.innerHTML = ''
            + '<div class="favorite-login-modal">'
            + '<p><a href="https://dibj.cn/portal/oauth/login/capcloud" target="_blank" id="favoriteLoginLink">登录</a>后即可收藏该内容，方便下次快速查找。</p>'
            + '<div class="modal-btns"><a href="javascript:void(0);" id="favoriteLoginClose" class="favorite-login-close">我已知晓</a></div>'
            + '</div>';
        document.body.appendChild(overlay);
    }
    updateFavoriteLoginLink();
}

function updateFavoriteLoginLink() {
    var link = document.getElementById("favoriteLoginLink");
    if (!link) return;
    var base = "https://dibj.cn/portal/oauth/login/capcloud";
    var target = buildStatefulUrl();
    if (!target) target = "/";
    link.setAttribute("href", base + "?targetUrl=" + encodeURIComponent(target));
}

function openFavoriteLoginModal() {
    var modal = document.getElementById("favoriteLoginModal");
    if (modal) modal.classList.add("is-active");
}

function closeFavoriteLoginModal() {
    var modal = document.getElementById("favoriteLoginModal");
    if (modal) modal.classList.remove("is-active");
}

function bindFavoriteLoginModal() {
    var closeBtn = document.getElementById("favoriteLoginClose");
    if (closeBtn && !closeBtn.__bound) {
        closeBtn.__bound = true;
        closeBtn.addEventListener("click", function (e) {
            e.preventDefault();
            closeFavoriteLoginModal();
        });
    }
    var modal = document.getElementById("favoriteLoginModal");
    if (modal && !modal.__bound) {
        modal.__bound = true;
        modal.addEventListener("click", function (e) {
            if (e && e.target === modal) closeFavoriteLoginModal();
        });
    }
}

function getBizUniqueId(rawItem) {
    if (!rawItem) return "";
    return (
        rawItem.bizUniqueId ||
        rawItem.biz_unique_id ||
        rawItem.biz_uniqueId ||
        rawItem.uniqueId ||
        rawItem.unique_id ||
        rawItem.productId ||
        rawItem.product_id ||
        rawItem.data_code ||
        rawItem.code ||
        rawItem.id ||
        ""
    );
}

function setFavoriteButtonState(btn, favorited) {
    if (!btn) return;
    var v = !!favorited;
    btn.classList.toggle("is-favorited", v);
    btn.textContent = v ? "★" : "☆";
    btn.setAttribute("aria-label", v ? "取消收藏" : "收藏");
}

function toggleFavorite(tableCode, bizUniqueId, btn) {
    if (!tableCode || !bizUniqueId) {
        alert("缺少收藏标识，无法收藏");
        return;
    }
    var requestKey = String(tableCode) + "::" + String(bizUniqueId);
    var now = Date.now();
    var lastAt = __favoriteLastClickAtMap[requestKey] || 0;
    if (__favoriteInFlightMap[requestKey] || (now - lastAt < __favoriteDebounceMs)) return;
    __favoriteLastClickAtMap[requestKey] = now;

    fetchCurrentUser(true).then(function (loggedIn) {
        if (!loggedIn) {
            updateFavoriteLoginLink();
            openFavoriteLoginModal();
            return;
        }
        if (btn) btn.disabled = true;
        __favoriteInFlightMap[requestKey] = true;
        $.ajax({
            url: "/portal/api/favorite/toggle",
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({ tableCode: tableCode, bizUniqueId: bizUniqueId })
        })
            .done(function (res) {
                if (res && res.code === 401) {
                    __favoriteUserLoggedIn = false;
                    openFavoriteLoginModal();
                    return;
                }
                if (!res || res.code !== 0 || res.isSuccess === false) {
                    alert((res && res.msg) || "操作失败");
                    return;
                }
                var favorited = res && res.data && typeof res.data.favorited !== "undefined" ? res.data.favorited : null;
                if (favorited === null) {
                    alert((res && res.msg) || "操作失败");
                    return;
                }
                setFavoriteButtonState(btn, favorited);
            })
            .fail(function (xhr) {
                var status = xhr && xhr.status;
                var code = xhr && xhr.responseJSON && xhr.responseJSON.code;
                if (status === 401 || code === 401) {
                    __favoriteUserLoggedIn = false;
                    openFavoriteLoginModal();
                    return;
                }
                alert("操作失败");
            })
            .always(function () {
                if (btn) btn.disabled = false;
                __favoriteInFlightMap[requestKey] = false;
            });
    });
}

// 请求组件数据并渲染到指定 ul 元素中
function queryComponentByType(resourceType, targetUlId, page, catalogId) {
    if (catalogId !== undefined) {
        currentCatalogId = catalogId;
    }
    if (page !== undefined) {
        var p = parseInt(page, 10);
        if (isFinite(p) && p > 0) currentPage = p;
    }
    updateFavoriteLoginLink();

    var equalsParams = {};
    var likeParams = {};

    // 分类ID精确匹配
    if (currentCatalogId) {
        likeParams.catalog_id = currentCatalogId + ",";
        // equalsParams.catalog_id = currentCatalogId + ",";
    }
    // 搜索关键词模糊匹配
    if (currentKeyword) {
        likeParams.component_name = currentKeyword;
    }

    $.ajax({
        url: "/portal/api/common/calling/page",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            tableCode: "COMPONENT_RESOURCE",
            pageNum: page || 1,
            pageSize: 14,
            equalsParams: equalsParams,
            likeParams: likeParams
        })
    })
        .then(function (response) {
            var data = (response && response.data) || {};
            var records = Array.isArray(data.records) ? data.records : [];

            if (!records.length) {
                document.getElementById(targetUlId).innerHTML = '<li>暂无数据</li>';
                return;
            }

            initializePagination(data, resourceType, targetUlId);
            renderComponentList(records, targetUlId, resourceType);
        })
        .fail(function (err) {
            console.error(`加载 ${resourceType} 失败:`, err);
            document.getElementById(targetUlId).innerHTML = '<li>加载失败</li>';
        });
}

// 分页初始化
function initializePagination(data, resourceType, targetUlId) {
    if (paginationInstance) {
        try {
            if (typeof paginationInstance.destroy === 'function') {
                paginationInstance.destroy();
            }
        } catch (e) {
            console.warn('销毁旧分页实例失败或不支持 destroy，已忽略', e);
        } finally {
            paginationInstance = null;
        }
    }

    if (!data.total || data.total === 0) {
        $paginationContainer.hide();
        paginationInstance = null;
        return;
    }

    $paginationContainer.show();

    if (typeof Pagination !== 'function') {
        console.warn('Pagination 组件未加载，已跳过分页渲染');
        return;
    }

    paginationInstance = new Pagination({
        containerId: "pagination",
        current: data.current || 1,
        totalPages: data.pages || 1,
        pageSize: data.size || 12,
        onPageChange: function (page) {
            queryComponentByType(resourceType, targetUlId, page, currentCatalogId);
        }
    });
}

// 渲染组件列表
function renderComponentList(records, ulId, resourceType) {
    const ul = document.getElementById(ulId);
    if (!ul) return;

    ul.innerHTML = '';

    // 注入搜索框（如果还未创建）
    ensureSearchBox(ul);

    records.forEach(rawItem => {
        const li = document.createElement('li');

        var name = rawItem.component_name || '无标题';
        var desc = rawItem.component_desc || '暂无描述';
        var id = rawItem.id;
        // 服务类型固定为 COMPONENT
        var serviceTypeHtml = 'COMPONENT';
        var tableCode = "COMPONENT_RESOURCE";
        var bizUniqueId = getBizUniqueId(rawItem);
        var favoritedFromList = normalizeFavorited(rawItem && rawItem.favorited);

        li.innerHTML = `
			            <a href="/cxfuww/szzyml/zjml/xqy?id=${id}&tableCode=COMPONENT_RESOURCE" class="resource-card" target="_blank">
                            <div class="resource-title">
                                <div class="resource-title-text">
                                    <span class="icon"><img src="/images/szml_icon.png" alt=""></span>
                                    ${escapeHtml(name)}
                                </div>
                                <button type="button" class="favorite-star" aria-label="收藏">☆</button>
                            </div>
                            <div class="resource-meta">
                                <span class="meta-item">服务类型：${escapeHtml(serviceTypeHtml || '--')}</span>
                            </div>
                        </a>
        `;
                                // <span class="meta-item meta-desc" title="${escapeHtml(desc)}">描述：${escapeHtml(desc || '--')}</span>

        var favBtn = li.querySelector(".favorite-star");
        if (favBtn) {
            if (!bizUniqueId) favBtn.disabled = true;
            favBtn.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                toggleFavorite(tableCode, bizUniqueId, favBtn);
            });
            setFavoriteButtonState(favBtn, favoritedFromList);
        }
        ul.appendChild(li);
    });
}

// 转义 HTML
function escapeHtml(str) {
    return String(str == null ? '' : str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// 渲染分类树
function renderCatalogTree(catalogData) {
    const container = document.querySelector('.left-list.ScrollStyle');
    if (!container) {
        console.error('找不到 .left-list.ScrollStyle 容器');
        return;
    }

    let html = '';

    // 默认"全部"按钮
    html += `<div class="left-btn${!currentCatalogId ? ' active' : ''}" data-id=""><span class="hide"></span>\u5168\u90e8</div>`;

    catalogData.forEach(catalog => {
        html += `<div class="left-btn" data-id="${catalog.id}"><span></span>${catalog.catalogName}(${catalog.resourceCount})</div>`;

        if (catalog.childCatalogList && catalog.childCatalogList.length > 0) {
            catalog.childCatalogList.forEach(secondLevel => {
                html += `<div class="second-box">`;
                html += `<div class="left-all" data-id="${secondLevel.id}"><span></span>${secondLevel.catalogName}(${secondLevel.resourceCount})</div>`;

                if (secondLevel.childCatalogList && secondLevel.childCatalogList.length > 0) {
                    html += `<ul>`;
                    secondLevel.childCatalogList.forEach(thirdLevel => {
                        html += `<li data-id="${thirdLevel.id}">${thirdLevel.catalogName}(${thirdLevel.resourceCount})</li>`;
                    });
                    html += `</ul>`;
                }

                html += `</div>`;
            });
        }
    });

    container.innerHTML = html;
    bindCatalogEvents();
    applyCatalogActiveFromState();
}

function applyCatalogActiveFromState() {
    if (!currentCatalogId) return;
    try {
        var id = String(currentCatalogId);
        $('.left-btn, .left-all, .second-box li').removeClass('active');
        var el = $('[data-id="' + id.replace(/"/g, '\\"') + '"]');
        if (el && el.length) {
            el.addClass('active');
            var secondBox = el.closest('.second-box');
            if (secondBox && secondBox.length) {
                secondBox.show();
                secondBox.find('ul').show();
            }
        }
    } catch (e) {}
}

// 绑定分类点击事件
function bindCatalogEvents() {
    $('.left-btn').off('click');
    $('.left-all').off('click');
    $('.second-box li').off('click');

    // 清除所有层级的选中状态
    function clearAllActive() {
        $('.left-btn, .left-all, .second-box li').removeClass('active');
    }

    // 顶级按钮点击事件
    $('.left-btn').on('click', function() {
        $(this).nextUntil('.left-btn', '.second-box').slideToggle();
        $(this).find("span").toggleClass("hide");

        clearAllActive();
        $(this).addClass('active');

        const catalogId = $(this).attr('data-id');
        queryComponentByType("COMPONENT", "zujianList", 1, catalogId || null);
    });

    // 二级分类点击事件
    $('.left-all').on('click', function(e) {
        e.stopPropagation();
        $(this).siblings('ul').slideToggle();
        $(this).find("span").toggleClass("hide");

        clearAllActive();
        $(this).addClass('active');

        const catalogId = $(this).attr('data-id');
        queryComponentByType("COMPONENT", "zujianList", 1, catalogId);
    });

    // 三级分类点击事件
    $('.second-box li').on('click', function(e) {
        e.stopPropagation();

        clearAllActive();
        $(this).addClass('active');

        const catalogId = $(this).attr('data-id');
        queryComponentByType("COMPONENT", "zujianList", 1, catalogId);
    });
}

// 初始化搜索框事件绑定
function initializeSearchBox() {
    $(document).on('click', '#resourceSearchBtn', function() {
        currentKeyword = ($('#resourceSearchInput').val() || '').trim();
        currentPage = 1;
        queryComponentByType("COMPONENT", "zujianList", 1);
    });
    $(document).on('keydown', '#resourceSearchInput', function(e) {
        if (e.keyCode === 13 || e.which === 13) {
            e.preventDefault();
            currentKeyword = ($(this).val() || '').trim();
            currentPage = 1;
            queryComponentByType("COMPONENT", "zujianList", 1);
        }
    });
}

// 在列表上方注入搜索框
function ensureSearchBox(ul) {
    if (document.getElementById('resourceSearchBox')) return;
    var box = document.createElement('div');
    box.id = 'resourceSearchBox';
    box.className = 'resource-search-box';
    box.innerHTML = '<input type="text" id="resourceSearchInput" placeholder="请输入" style="border:1px solid #ff7a25" /><button type="button" id="resourceSearchBtn" style="background:#ff7a25">\u641c\u7d22</button>';
    ul.parentNode.insertBefore(box, ul);
    var input = document.getElementById('resourceSearchInput');
    if (input && currentKeyword) input.value = currentKeyword;

    // 注入搜索框样式
    if (document.getElementById('resource-search-style')) return;
    var style = document.createElement('style');
    style.id = 'resource-search-style';
    style.textContent = ''
        + '.resource-search-box{display:flex;align-items:center;margin-bottom:16px;gap:8px;}'
        + '.resource-search-box input{flex:1;padding:8px 12px;border:1px solid lightGray;border-radius:4px;font:14px/1.5 "\u5fae\u8f6f\u96c5\u9ed1";outline:none;}'
        + '.resource-search-box input:focus{border-color:#1067E8;box-shadow:0 0 0 2px rgba(16,103,232,0.1);}'
        + '.resource-search-box button{padding:8px 20px;background:#1067E8;color:#fff;border:none;border-radius:4px;font:14px/1.5 "\u5fae\u8f6f\u96c5\u9ed1";cursor:pointer;}'
        + '.resource-search-box button:hover{background:#0d56c7;}';
    document.head.appendChild(style);
}
})();
