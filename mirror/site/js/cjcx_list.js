(function () {
    const pageSize = 12;
    let currentPage = 1;
    let pagination = null;
  let type = '';
    // 获取数据并渲染
    async function fetchData(page) {
      try {
        // 检查当前页与目标页是否一致
        // if (page === currentPage) return;
  
        currentPage = page;
        document.getElementById('currentPage').value = page;
        document.getElementById('pageSize').value = pageSize;
  
        const form = document.getElementById('fetchForm');
        const formData = new FormData(form);
  
        // 获取当前激活的 tab 类型
        const activeTab = document.querySelector('.yysc_title ul li.on a');
        type = activeTab ? activeTab.getAttribute('data-type') : 'jbz';
        
        // 映射类型到数值
        const statusMap = {
          'jbz': 1,
          'djz': 2,
          'ywc': 3
        };

        const defaultConfigs = [
          {
            linkPrefix: "/fzpt/cjyz/jbz/xqy",
          },
          {
            linkPrefix: "/fzpt/cjyz/djz/xqy",
          },
          {
            linkPrefix: "/fzpt/cjyz/ywc/xqy",
          }
        ];
        const statusValue = statusMap[type] || 1;

        const params = {
          // CommonCallApiController 分页参数约定：_currentPage = "页码,每页条数"
          _currentPage: `${page},${pageSize}`,
          range: statusValue,
        };
  
        formData.forEach((value, key) => {
          params[key] = value;
        });
  
        // 接口切换：数据创新已入驻的项目
        const result = await  $.ajax({
          url: $$baseUrl + "/api/common/calling/page",
          cache: false,
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify({
              tableCode: "SCENE_DEMAND",
              pageNum: currentPage,
              pageSize: pageSize,
              equalsParams: {"scene_range": statusValue}
          })
        })
        
        //apiService.getComputedStyleProjects(params);
        
        if (result.code === 0 ) {
          const records = result.data.records;
          const total = result.data.total || records.length;
          const totalPages = Math.ceil(total / pageSize);
  
          renderData(records,defaultConfigs[statusValue-1].linkPrefix);
  
          // 初始化或更新分页器
          if (!pagination) {
            pagination = new Pagination({
              containerId: 'pagination',
              current: page,
              totalPages: totalPages,
              Size: pageSize,
              onPageChange: (newPage) => {
                if (newPage !== currentPage) {
                  fetchData(newPage);  // 当页码变化时才调用 fetchData
                }
              }
            });
          } else {
            pagination.updateTotalPages(totalPages);
            pagination.setPage(page); // 更新当前页并重新渲染
          }
        } else if (!result.records.length) {
          document.getElementById('data-container').innerHTML = `<li>暂无数据</li>`;
          document.getElementById('pagination').innerHTML = '';
          pagination = null;
        } else {
          throw new Error(result.message || '数据加载失败');
        }
      } catch (error) {
        console.error('请求失败:', error);
        document.getElementById('data-container').innerHTML = `<li>加载失败: ${error.message}</li>`;
        document.getElementById('pagination').innerHTML = '';
        pagination = null;
      }
    }
  
    // 截断文本：超过maxLen字截断并加...，否则原样返回
    function truncateText(text, maxLen) {
        var str = text || '';
        return str.length > maxLen ? str.substring(0, maxLen) + '...' : str;
    }

    // 渲染数据列表
    function renderData(records,linkPrefix) {
      const container = document.getElementById('data-container');
      container.innerHTML = records.map(record => ` 
                      <li>
                          <dl>
                              <dt>${record.scene_name}</dt>
                          </dl>
                          <div class="info">
                              <div class="bt">场景单位：</div>
                              <div class="desc" title="${record.scene_open_dept || ''}">${truncateText(record.scene_open_dept, 20)}</div>
                          </div>
                          <div class="info">
                              <div class="bt">需求介绍：</div>
                              <div class="desc">${record.scene_summary}</div>
                          </div>

                          <div class="btn"><a href="${linkPrefix}?id=${record.id}&tableCode=SCENE_DEMAND" target="_blank">查看详情</a></div>

                      </li>
      `).join('');
    }
  
    // 初始化加载数据
    async function init() {
      await fetchData(currentPage);  // 直接加载第一页
    }
  
    // 初始化
    init();
  })();
  