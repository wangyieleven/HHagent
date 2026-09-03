$(function () {
    // 日期格式化函数：截取时间字符串前10位
    const formatDate10 = (v) => {
        if (v === null || v === undefined) return '';
        const s = String(v);
        return s.length >= 10 ? s.slice(0, 10) : s;
    };

    // 文本截断：超过16个字加...
    const truncate = (s, max) => {
        if (!s) return '';
        return s.length > max ? s.slice(0, max) + '...' : s;
    };

    // 数据创新——数据资源目录
    $.ajax({
        url: $$baseUrl + "/api/common/calling/page",
        cache: false,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            tableCode: "GOV_DATA",
            pageNum: 1,
            pageSize: 8,
            orderField: "create_time",
        })
    })
    .done(function (data) {
        if (data.code === 0) {
            const records = data.data.records || [];
            const container = document.getElementById('data-sjzyml');
            const targetDataRows = 8;
            const emptyRowsCount = Math.max(0, targetDataRows - records.length);

            if (!records.length) {
                container.innerHTML = '<li>暂无数据</li>';
                return;
            }

            const dataHtml = records.map((record, index) => {
                const createTime = record.create_time.substring(0, 10);

                return `
                    <li style="display:flex;align-items:center;gap:8px;padding:4px 0;">
                        <img src="../images/v7-firstContent.png" style="width:14px;height:14px;flex-shrink:0;" />
                        <a href="/cxfuww/szzyml/sjml/xqy?id=${record.id}&tableCode=GOV_DATA" target="_blank" title="${record.data_name}" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${truncate(record.data_name, 13)}</a>
                        <span style="flex-shrink:0;color:#4078c0;">${createTime}</span>
                    </li>
                `;
            }).join('');

            const emptyHtml = generateEmptyRows(emptyRowsCount);
            container.innerHTML = dataHtml + emptyHtml;
        }
    });

    // 数据创新已入驻的项目
    $.ajax({
        url: $$baseUrl + "/api/common/calling/page",
        cache: false,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            tableCode: "SETTLED_PROJECT",
            pageNum: 1,
            pageSize: 8,
            orderField: "data_time",
        })
    })
    .done(function (data) {
        if (data.code === 0) {
            const records = data.data.records || [];
            const container = document.getElementById('data-rzxm');
            const targetDataRows = 8;
            const emptyRowsCount = Math.max(0, targetDataRows - records.length);

            if (!records.length) {
                container.innerHTML = '<li>暂无数据</li>';
                return;
            }

            const dataHtml = records.map((record, index) => {
                const createTime = record.data_time.substring(0, 10);
                return `
                    <li style="display:flex;align-items:center;gap:8px;padding:4px 0;">
                        <img src="../images/v7-firstContent.png" style="width:14px;height:14px;flex-shrink:0;" />
                        <a href="/fzpt/sjcx/rzxm/rzxmxqy?id=${record.id}&tableCode=SETTLED_PROJECT" target="_blank" title="${record.project_name}" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${truncate(record.project_name, 13)}</a>
                        <span style="flex-shrink:0;color:#4078c0;">${createTime}</span>
                    </li>
                `;
            }).join('');

            const emptyHtml = generateEmptyRows(emptyRowsCount);
            container.innerHTML = dataHtml + emptyHtml;
        }
    });

    // 生成空行（占位）函数，保持flex对齐
    function generateEmptyRows(needCount) {
        let emptyHtml = '';
        for (let i = 0; i < needCount; i++) {
            emptyHtml += `<li style="display:flex;align-items:center;gap:8px;padding:4px 0;height:30px;"><span>&nbsp;</span></li>`;
        }
        return emptyHtml;
    }
});