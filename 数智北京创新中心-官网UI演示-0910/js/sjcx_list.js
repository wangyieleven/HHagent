$(function() {
	
let paginationInstance = null;

// 1. 全局纯状态
const state = { appGroupId: 2, pageIndex: 1 };

	
// 假设这是ajax返回的数据
const responseData = {
  "code": "200",
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "应用创新",
      "description": "基于《数字政府建设指导意见》的应用创新分类",
      "createTime": "2025-06-25 06:21:59",
      "updateTime": "2025-06-25 06:21:59",
      "parentId": null,
      "children": [
        {
          "id": 3,
          "name": "管理决策",
          "description": "基于《数字政府建设指导意见》的应用创新分类",
          "createTime": "2025-06-25 06:21:59",
          "updateTime": "2025-06-25 06:21:59",
          "parentId": 1,
          "children": []
        },
        {
          "id": 4,
          "name": "民生保健",
          "description": "基于《数字政府建设指导意见》的应用创新分类",
          "createTime": "2025-06-25 06:21:59",
          "updateTime": "2025-06-25 06:21:59",
          "parentId": 1,
          "children": []
        }
      ]
    },
    {
      "id": 2,
      "name": "数据创新",
      "description": "基于《数字政府建设指导意见》的数据创新分类",
      "createTime": "2025-06-25 06:21:59",
      "updateTime": "2025-06-25 06:21:59",
      "parentId": null,
      "children": [
        {
          "id": 5,
          "name": "数据治理",
          "description": "基于《数字政府建设指导意见》的数据创新分类",
          "createTime": "2025-06-25 06:21:59",
          "updateTime": "2025-06-25 06:21:59",
          "parentId": 2,
          "children": []
        }
      ]
    }
  ]
};

// 获取id = 2的直接子元素
function getDirectChildrenById(data, targetId) {
  for (const node of data) {
    if (node.id === targetId) {
      return node.children; // 直接返回children数组
    }
    // 如果数据可能嵌套更深，可以递归检查（但本题中id=2是顶级节点）
    if (node.children && node.children.length > 0) {
      const result = getDirectChildrenById(node.children, targetId);
      if (result) return result;
    }
  }
  return null; // 未找到
}

// 调用函数
//const directChildren = getDirectChildrenById(responseData.data, 2);
//console.log(directChildren);	


loadData();
	
$.ajax({
  url: $$baseUrl + "/zdy/api/csp/v2.0/appInfoGroup",
  cache: false
})
  .done(function( data ) {
    if (data.code == '200') {
		var records = data.data;
  for (const node of records) {
    if (node.id === 2) {
		let htmlContent = '';
	  for (const n of node.children || []) {
		          htmlContent += `
            <dd class="acti" data-id="${n.id}"><a >${n.name}</a></dd>
        `;
	  }
$("#category").append(htmlContent);
	  break;
    }
  }		
	} else {
		console.log(data);
	}
  });
  

  
  // 为已存在的父元素绑定事件，委托给动态添加的dd元素
$("#category").on("click", "dd", function(event) {
    var $this = $(this);
    
    // 方法1: 使用siblings() - 移除其他dd的active类
    $this.siblings("dd").removeClass("selected");
    $this.addClass("selected");
state.appGroupId = $this.data('id'); // 改分类
  state.pageIndex = 1;                 // 强制回到第 1 页
  loadData();   
	return false;
});

function updateSjcxTabCount(totalCount) {
  var $tabLink = $('.yysc_title a[href="/yyscww/sjcx"]');
  if ($tabLink.length) {
    $tabLink.text('数据创新(' + (totalCount || 0) + ')');
  }
}

function loadData() {
	 $.ajax({
  url: $$baseUrl + "/zdy/api/csp/v2.0/appInfoPage",
  cache: false,
  data: {
	  pageIndex: state.pageIndex,
      pageSize: 9,
      appGroupId: state.appGroupId
  }
})
  .done(function( data ) {
    if (data.code == '200') {
			const records = data?.data?.items ?? [];
			const totalCount = data?.data?.totalCount ?? 0;
			updateSjcxTabCount(totalCount);
			
			const pages = data?.data?.pages;


            const articleList = document.getElementById('articleList');

            const paginationWrapper = document.querySelector('.fenye');

			if (records.length === 0) {
				articleList.innerHTML = '<li>暂无数据</li>';
				// 把状态拉回合法页码
				state.pageIndex = 1;
				  // 更新分页组件（总页数=0 会自动隐藏）
				  if (paginationInstance) {
					paginationInstance.totalPages = 0;
					paginationInstance.currentPage = 1;
					paginationInstance.render();
				  }
				paginationWrapper.style.display = 'none';
				//paginationInstance = null;
				return;
			}

			articleList.innerHTML = '';
			renderDataToPage(records);

			paginationWrapper.style.display = 'block';
						    /* 3. 分页组件：只“展示”和“通知”，不加载数据 */
    if (!paginationInstance) {            // 第一次才 new
      paginationInstance = new Pagination({
        containerId: 'pagination',
        current: state.pageIndex,
        totalPages: pages,
        onPageChange: function (page) {
          state.pageIndex = page;         // 只改状态
          loadData();                     // 由状态驱动
        }
      });
    } else {                              // 后续只更新页码/总页数
      paginationInstance.currentPage = state.pageIndex;
      paginationInstance.totalPages = pages;
      paginationInstance.render();
    }
		
			
	} else {
		console.log(data);
	}
  });
}


// 初始化分页功能
/*
function initializePagination(paginationData, appGroupId) {
    const paginationElement = document.getElementById('pagination');

    if (paginationData.totalCount === 0) {
        paginationElement.style.display = 'none';
        paginationInstance = null;
        return;
    }
	
	if (paginationInstance) {
        return; // 已初始化则直接返回，不触发更新
    }

    // 每次都重新创建分页实例
    paginationElement.innerHTML = '';
    paginationInstance = new Pagination({
        containerId: "pagination",
        current: paginationData.pageIndex || 1,
        totalPages: paginationData.pages || 1,
        pageSize: paginationData.pageSize || 9,
        onPageChange: function (page) {
            loadData(appGroupId, page);
			
        }
    });
}
*/

// 渲染数据到页面
function renderDataToPage(records) {
    const ulElement = document.getElementById('articleList');
    // 清空当前列表内容
    ulElement.innerHTML = '';  

    let htmlContent = '';

    records.forEach(record => {
        // 跳过无效记录
        if (!record) return;

        // 提取字段，并做空值兜底处理
        let createTime = "暂无数据";
        const ci = record.customInfo || null;
        // if (ci && ci.startTime) {
        //     createTime = String(ci.startTime).substring(0, 10);
        // } else
            if (record.createTime) {
            createTime = String(record.createTime).substring(0, 10);
        }

        const name = record.name == null ? '' : String(record.name);
        const description = record.description == null ? '' : String(record.description);
        const appGroupName = record.appGroupName == null ? '' : String(record.appGroupName);
        const idVal = record.id == null ? '' : String(record.id);

        // 拼接每个条目的 HTML
        htmlContent += `
            		<li>
                        <dl>
                            <dt>${name}</dt>
                            <dd>${description}</dd>
                        </dl>
                        <div class="info">
                            <div class="bt">场景分类：</div>
                            <div class="desc">${appGroupName}</div>
                        </div>
                        <div class="info">
                            <div class="bt">上架时间：</div>
                            <div class="desc">${createTime}</div>
                        </div>
                        <div class="btn"><a href="/yyscww/sjcx/xqy?id=${idVal}" target="_blank">了解更多</a></div>
                    </li>
        `;
    });

    // 插入所有 HTML
    ulElement.innerHTML = htmlContent || '<li>暂无有效数据</li>';
}

  
})
