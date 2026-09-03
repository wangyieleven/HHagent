document.addEventListener('DOMContentLoaded', () => {
    updateFavoriteLoginLink(getTypeFromUrl());
    queryComponentByType("CLOUD_NETWORK_CALC", "yunsuanliList");
    queryComponentByType("COMPONENT_RESOURCE", "zujianList");
    queryComponentByType("GOV_DATA", "shujuList");
    bindFavoriteLoginModal();
});

function fetchPageData(tableCode, pageSize) {
    return $.ajax({
        url: "/portal/api/common/calling/page",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            tableCode: tableCode,
            pageNum: 1,
            pageSize: pageSize || 12
        })
    });
}

function queryComponentByType(tableCode, targetUlId) {
    var container = document.getElementById(targetUlId);
    if (!container) return;

    fetchPageData(tableCode, 12)
        .then(function (response) {
            var data = response && response.data;
            var records = data && (data.records || data.list || []);
            if (records && records.length) {
                renderComponentList(records, targetUlId, tableCode);
            } else {
                container.innerHTML = '<li>暂无数据</li>';
            }
        })
        .fail(function () {
            console.error("加载 " + tableCode + " 失败");
            container.innerHTML = '<li>加载失败</li>';
        });
}

function getFieldConfig(tableCode) {
    switch (tableCode) {
        case 'CLOUD_NETWORK_CALC':
            return { nameField: 'resource_name', descField: 'description', typeField: 'service_type' };
        case 'COMPONENT_RESOURCE':
            return { nameField: 'component_name', descField: 'component_desc', typeField: 'process_type' };
        case 'GOV_DATA':
            return { nameField: 'data_name', descField: 'dept_name', typeField: 'service_type' };
        default:
            return { nameField: 'resource_name', descField: 'description', typeField: 'service_type' };
    }
}

function escapeHtml(str) {
    return String(str == null ? '' : str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function normalizeFavorited(value) {
    if (value === true) return true;
    if (value === false) return false;
    var s = String(value == null ? "" : value).trim().toLowerCase();
    if (!s) return false;
    return s === "1" || s === "true" || s === "yes" || s === "y";
}

var __favoriteUserPromise = null;
var __favoriteUserLoggedIn = false;
var __favoriteUserCheckedAt = 0;
var __favoriteInFlightMap = {};
var __favoriteLastClickAtMap = {};
var __favoriteDebounceMs = 800;

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

function getTypeFromUrl() {
    try {
        return (new URLSearchParams(window.location.search || '')).get('type') || '';
    } catch (e) {
        return '';
    }
}

function getTypeForLogin(tableCode) {
    if (tableCode === 'CLOUD_NETWORK_CALC') return 'ywsl';
    if (tableCode === 'COMPONENT_RESOURCE') return 'zj';
    if (tableCode === 'GOV_DATA') return 'sjml';
    return '';
}

function updateFavoriteLoginLink(type) {
    var link = document.getElementById('favoriteLoginLink');
    if (!link) return;
    var base = 'https://dibj.cn/portal/oauth/login/capcloud';
    var target = (window.location && window.location.href) ? window.location.href : '/';
    if (!target) target = '/';
    if (type) {
        try {
            var u = new URL(target);
            u.searchParams.set('type', type);
            target = u.toString();
        } catch (e) { }
    }
    link.setAttribute('href', base + '?targetUrl=' + encodeURIComponent(target));
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
    if (__favoriteInFlightMap[requestKey] || (now - lastAt < __favoriteDebounceMs)) {
        return;
    }
    __favoriteLastClickAtMap[requestKey] = now;
    fetchCurrentUser(true).then(function (loggedIn) {
        if (!loggedIn) {
            updateFavoriteLoginLink(getTypeForLogin(tableCode));
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

function renderComponentList(records, ulId, tableCode) {
    var ul = document.getElementById(ulId);
    if (!ul) return;

    ul.innerHTML = '';
    var cfg = getFieldConfig(tableCode);

    records.forEach(function (rawItem) {
        var li = document.createElement('li');
        var name = rawItem[cfg.nameField] || '无标题';
        var desc = rawItem[cfg.descField] || '暂无描述';
        var serviceType = (tableCode === 'COMPONENT_RESOURCE') ? 'COMPONENT' : (rawItem[cfg.typeField] || '');
        var bizUniqueId = getBizUniqueId(rawItem);
        var favoritedFromList = normalizeFavorited(rawItem && rawItem.favorited);

        if (tableCode === 'GOV_DATA') {
            li.innerHTML = '<h5><a href="/cxfuww/szzyml/sjml/xqy?id=' + rawItem.id + '&type=DATA&tableCode=GOV_DATA" target="_blank">' + escapeHtml(name) + '</a><button type="button" class="favorite-star" aria-label="收藏">☆</button></h5>';
        } else if (tableCode === 'COMPONENT_RESOURCE') {
            li.innerHTML = '<h5><a href="/cxfuww/szzyml/zjml/xqy?id=' + rawItem.id + '&type=COMPONENT&tableCode=COMPONENT_RESOURCE" target="_blank">' + escapeHtml(name) + '</a><button type="button" class="favorite-star" aria-label="收藏">☆</button></h5>';
        } else {
            li.innerHTML = '<h5>' + escapeHtml(name) + '<button type="button" class="favorite-star" aria-label="收藏">☆</button></h5>';
        }

        li.innerHTML += '<p><span>服务类型：</span>' + escapeHtml(serviceType) + '</p>'
            + '<p><span>描&#12288;&#12288;述：</span><i>' + escapeHtml(desc) + '</i></p>';

        var aTag = li.querySelector('a');
        if (aTag) {
            aTag.addEventListener('click', function (event) {
                event.preventDefault();
                try {
                    sessionStorage.setItem('szzyxq_lastDetail', JSON.stringify(rawItem));
                } catch (e) {
                    console.warn('sessionStorage 写入失败:', e);
                }
                window.location.href = aTag.href;
            });
        }

        var favBtn = li.querySelector(".favorite-star");
        if (favBtn) {
            if (!bizUniqueId) {
                favBtn.disabled = true;
            }
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
