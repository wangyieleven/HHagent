$(function() {
    const params = new URLSearchParams(window.location.search);
    const detailId = params.get('id');
    const projectCode = params.get('projectCode');
	
		const parser = new UAParser();
        const result = parser.getResult();
        
        let terminalDeviceId = null; 
        
        const type = result.device.type;	
		
		if (type === 'mobile' || type === 'tablet') {
            terminalDeviceId = 'MOBILE';
        }

    (async () => {
        try {
            // 解析 URL 路径结构
            const pathParts = window.location.pathname.split('/').filter(Boolean);
            
            // 处理 siteId (固定逻辑)
            let currentSiteId = typeof siteId !== 'undefined' ? siteId : '';
            if (!currentSiteId && pathParts.length > 0) {
                if (pathParts[0] === 'cxds') currentSiteId = 11;
                else if (pathParts[0] === 'portal_in') currentSiteId = 41;
            }

            // 处理 columnId
            let currentColumnId = typeof columnId !== 'undefined' ? columnId : '';
            // 如果全局 columnId 没有值，并且是文章页（通过是否有 articleId 或 url 中是否包含 .html 判断）
            if (!currentColumnId && typeof articleId !== 'undefined' && articleId) {
                 // 尝试从路径推导，如果是类似 /cxds/xwzx/tzgg/xxxx.html，栏目路径通常是 /cxds/xwzx/tzgg/
                 if (pathParts.length >= 2) {
                     // 构建当前页面的相对目录路径
                     const dirPath = '/' + pathParts.slice(0, pathParts.length - 1).join('/') + '/';
                     // 从全局 columnData 获取
                     if (typeof window.columnData !== 'undefined' && window.columnData[dirPath]) {
                         currentColumnId = window.columnData[dirPath];
                     }
                 }
            } else if (!currentColumnId && pathParts.length > 0 && !window.location.pathname.endsWith('.html')) {
                 // 如果是栏目列表页（没有 .html，比如 /cxds/xwzx/tzgg/）
                 const dirPath = window.location.pathname.endsWith('/') ? window.location.pathname : window.location.pathname + '/';
                 if (typeof window.columnData !== 'undefined' && window.columnData[dirPath]) {
                     currentColumnId = window.columnData[dirPath];
                 }
            }

            const payload = {
                siteId: currentSiteId,
                columnId: currentColumnId,
				terminalDeviceId,
                articleId: (typeof articleId !== 'undefined' && articleId) ? articleId : null,
                // 浏览器环境下 document.referrer 可能为空（直接打开页面或受 Referrer-Policy 影响）
                // 为空时回退到当前页面地址，保证接口有可用来源信息
                referer: (document.referrer && document.referrer.trim()) ? document.referrer.trim() : window.location.href
            };

            // 当前上报接口对应 _id=127，按需求增加 referer 入参
            const apiId = 127;
            const refererQuery = (apiId === 127 && payload.referer) ? `&referer=${payload.referer}` : '';

            if(payload.articleId){
                await fetch(`/wms-search/api/access?siteId=${currentSiteId}&columnId=${currentColumnId}&terminalDeviceId=${terminalDeviceId}&articleId=${payload.articleId}${refererQuery}`, {
                method: 'get',
                headers: {
                    'Content-Type': 'application/json'
                },
                // body: JSON.stringify(payload)
            });
            }else{
                await fetch(`/wms-search/api/access?siteId=${currentSiteId}&columnId=${currentColumnId}&terminalDeviceId=${terminalDeviceId}${refererQuery}`, {
                method: 'get',
                headers: {
                    'Content-Type': 'application/json'
                },
                // body: JSON.stringify(payload)
            });
            }
           
        } catch (error) {
            // 静默失败，不打印控制台错误
        }
    })();
});
