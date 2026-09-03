(function () {
  // 场景创新（三个Tab：揭榜中/对接中/已完成）合并列表脚本
  // 依赖：全局 apiService.getComputedStyleProjects；可选：jQuery 用于更新数量

  const pageSize = 6; // 已修改为7条/页
  const currentPage = 1;

  const defaultConfigs = [
    {
      range: "1",
      containerId: "data-szjs",
      totalSelector: ".szjsl",
      linkPrefix: "/fzpt/cjyz/jbz/xqy"
    },
    {
      range: "2",
      containerId: "data-szzll",
      totalSelector: ".szzll",
      linkPrefix: "/fzpt/cjyz/djz/xqy"
    },
    {
      range: "3",
      containerId: "data-szfwl",
      totalSelector: ".szfwl",
      linkPrefix: "/fzpt/cjyz/ywc/xqy"
    }
  ];
  
  function safeSetHtml(container, html) {
    if (!container) return;
    container.innerHTML = html;
  }

  function renderData(container, records, linkPrefix) {
    // 生成数据行HTML
    const dataRows = (records || []).map(record => {
     
      return `
        <li>
          <font></font>
          <a href="${linkPrefix}?id=${record.id}&tableCode=SCENE_DEMAND" target="_blank" title="${record.scene_name}">${record.scene_name}</a><span class="date">${record.data_time.substring(0, 10)}</span>
        </li>
      `;
    }).join("");

    const targetDataRows = 6;
    const emptyRowsCount = Math.max(0, targetDataRows - records.length);
    const emptyHtml = generateEmptyRows(emptyRowsCount);
    // 渲染到容器
    safeSetHtml(container, dataRows + emptyHtml);
  }

  async function fetchAndRenderOne(cfg) {
    const container = document.getElementById(cfg.containerId);
    // 容器不存在直接跳过，避免在其他页面引用时报错
    if (!container) return;
    try {
      // const result = await apiService.getComputedStyleProjects({
      //   _currentPage: `${currentPage},${pageSize}`,
      //   range: String(cfg.range)
      // });
      $.ajax({
        url: $$baseUrl + "/api/common/calling/page",
        cache: false,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            tableCode: "SCENE_DEMAND",
            pageNum: 1,
            pageSize: 6,
             equalsParams: {"scene_range": cfg.range}
        })
      })
      .done(function (data) {
        if (data.code === 0) {
          const records = data.data.records || [];
          const container = document.getElementById(cfg.containerId);
          // 目标数据行数（不含更多行）：6行，不足则补空行
         
          if (!records.length) {
            safeSetHtml(container, `<li>暂无数据</li>`);
            return;
        }
          if (records.length) {
            renderData(container, records, cfg.linkPrefix);
      
          } 
  
         
        }
      });
      
    } catch (error) {
      console.error("请求失败:", error);
      safeSetHtml(container, `<li>加载失败: ${error && error.message ? error.message : "未知错误"}</li>`);
    }
  }

  function generateEmptyRows(needCount) {
    let emptyHtml = '';
    for (let i = 0; i < needCount; i++) {
      // 空行样式与数据行保持一致，仅内容为空
      emptyHtml += `<li style="height: 30px;"><span>&nbsp;</span></li>`;
    }
    return emptyHtml;
  }
  // 初始化：并行加载三个列表
  defaultConfigs.forEach(cfg => {
    fetchAndRenderOne(cfg);
  });
})();