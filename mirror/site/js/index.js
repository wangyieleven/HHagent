$(function () {
  /*
    apiService.getChengGuoList(ApiUrls.getChengGuoList, {
        current: 1,
        size: 8
    }).then(res => {
            if (!res.success) {
        return;
            }
            if (res.empty) {
        return;
            }
            const records = res.data.records || [];
          const container = document.getElementById('data-yycxcg');
    container.innerHTML = records.map(record => {
    var d = record.extendDate || '';
      return `
        <li>
    <a href="/cxsy/cjxq/cjxqxq?id=${record.id}&type=xq" target="_blank">●  ${record.changjingName}</a><span class="date">${d}</span>
        </li>
      `;
    }).join('');
        }).catch(() => {
            
        });
    */
  // 通用函数：生成空行（补足到3行）
  function generateEmptyRows(needCount) {
    let emptyHtml = '';
    for (let i = 0; i < needCount; i++) {
      // 空行样式与数据行保持一致，仅内容为空
      emptyHtml += `<li style="height: 30px;"><span>&nbsp;</span></li>`;
    }
    return emptyHtml;
  }
  var equalsParams = {"top_group_code": "APPLICATION"};
  $.ajax({
    url: $$baseUrl + "/api/common/calling/page",
    cache: false,
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({
        tableCode: "APP_INNOVATION",
        pageNum: 1,
        pageSize: 5,
        // equalsParams: equalsParams
    })
  })
    .done(function (data) {
      if (data.code === 0) {
        const records = data.data.records || [];
        const container = document.getElementById('data-yycxcg');
        // 目标数据行数：3行，不足则补空行
        const targetDataRows = 5;
        const emptyRowsCount = Math.max(0, targetDataRows - records.length);

        // 生成数据行
        const dataHtml = records.map(record => {
          var createTime = record.online_time.substring(0, 10);
          return `
            <li>
		      <a href="/yyscww/cgcx/yycxxq?id=${record.id}&tableCode=APP_INNOVATION" target="_blank" title="${record.achievement_code}"><font></font>${record.achievement_code}</a><span class="date">${createTime}</span>
            </li>
          `;
        }).join('');

        // 生成需要补充的空行
        const emptyHtml = generateEmptyRows(emptyRowsCount);

        // 合并：数据行 + 空行
        container.innerHTML = dataHtml + emptyHtml;
      }
    });
  equalsParams = {"top_group_code": "DATA"};
  $.ajax({
    url: $$baseUrl + "/api/common/calling/page",
    cache: false,
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({
        // tableCode: "APP_INNOVATION",
        tableCode: "DATA_INNOVATION",
        pageNum: 1,
        pageSize:5,
        equalsParams: equalsParams
    })
  })
    .done(function (data) {
      if (data.code === 0) {
        const records = data.data.records || [];
        const container = document.getElementById('data-sjcxcg');
        // 目标数据行数：3行，不足则补空行
        const targetDataRows = 5;
        const emptyRowsCount = Math.max(0, targetDataRows - records.length);

        // 生成数据行
        const dataHtml = records.map(record => {
          var createTime = record.online_time.substring(0, 10);
          return `
            <li>
		      <a href="/yyscww/cgcx/yycxxq?id=${record.id}&tableCode=DATA_INNOVATION&_searchCategory=DATA_INNOVATION" target="_blank" title="${record.achievement_code}"><font></font>${record.achievement_code}</a><span class="date">${createTime}</span>
            </li>
          `;
        }).join('');

        // 生成需要补充的空行
        const emptyHtml = generateEmptyRows(emptyRowsCount);

        // 合并：数据行 + 空行
        container.innerHTML = dataHtml + emptyHtml;
      }
    });

  /*
  接口/openApi/v1/changj/getChangjStatCnt
  获取参与揭榜企业及需求对接完成数量
  */
//   (async () => {
//     try {
//       const result = await Common_AjaxCallApi(apiService.changjing.getChangjStatCntId);
//       if (result.isSuccess) {
//         let data = result.data;
//         $('.cyjbqy').text(data.abilityOrgCnt);
//         $('.xqdjwc').text(data.announcementCnt);
//       }
//     } catch (error) {
//       console.error("接口调用失败：", error);
//     }
//   })();

});