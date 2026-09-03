// 通用响应处理函数
function handleResponse(data) {
  if (!data || typeof data !== 'object' || data.isSuccess === false) {
    return { success: false, message: data?.msg || '接口返回异常', data: null }
  }

  const rawData = data.data

  // 分页结构
  if (rawData && Array.isArray(rawData.records)) {
    return {
      success: true,
      empty: rawData.records.length === 0,
      data: rawData
    }
  }

  // 简单数据（例如字符串、数字等）
  if (rawData !== undefined && rawData !== null) {
    return {
      success: true,
      empty: false,
      data: rawData
    }
  }

  return { success: true, empty: true, data: null }
}

// 通用 jQuery POST 请求封装
function ajaxPost(url, params) {
  return new Promise((resolve) => {
    $.ajax({
      url,
      type: 'POST',
      contentType: 'application/x-www-form-urlencoded',
      data: params,
      success: (data) => resolve(handleResponse(data)),
      error: (err) => {
        console.error('请求失败:', err)
        resolve({ success: false, message: '请求失败', error: err })
      }
    })
  })
}

// 通用 Common_AjaxCallApi 请求封装
function callCommonApi(apiId, params) {
  return Common_AjaxCallApi(apiId, null, params)
    .then((data) => handleResponse(data))
    .catch((err) => {
      console.error('请求失败:', err)
      return { success: false, message: '请求失败', error: err }
    })
}

// 主服务对象
const apiService = {
  /**
   * 获取场景需求列表（自定义接口地址）
   * @param {string} url - 接口地址
   * @param {Object} params - 请求参数
   */
  getNeedList: (url, params) => ajaxPost(url, params),

  /**
   * 获取成果列表（自定义接口地址）
   * @param {string} url - 接口地址
   * @param {Object} params - 请求参数
   */
  getChengGuoList: (url, params) => ajaxPost(url, params),

  /**
   * 联通 - 获取数据资源列表（固定接口）
   * @param {Object} params - 请求参数
   */
  getShujuList: (params) =>
    callCommonApi(87, {
      _extendedTypeId: 1,
      resourceType: 'DATA',
      ...params
    }),

  /**
   * 联通 - 获取产品资源列表（固定接口）
   * @param {Object} params - 请求参数
   */
  getChanPinList: (params) =>
    callCommonApi(90, {
      _extendedTypeId: 1,
      resourceType: 'APPLICATION',
      ...params
    }),

  /**
   * 应用市场 - 创新成果列表（固定接口）
   * @param {Object} params - 请求参数
   */
  getChuangXinResults: (params) => callCommonApi(86, params),

  // 场景创新-需求（固定接口）
  getChangJingNeed: (params) => callCommonApi(91, params),

  // 场景创新-成果（固定接口）
  getChangJingResults: (params) => callCommonApi(92, params),

  // 首页平台统计-需求发布数
  getNeedQuantity: () => callCommonApi(85, {}),

  // 联通 - 获取云网算资源列表-
  getYunSuanLiList: (params) =>
    callCommonApi(89, {
      _extendedTypeId: 1,
      resourceType: 'CLOUD',
      ...params
    }),

  // 联通 - 获取组件
  getZuJianList: (params) =>
    callCommonApi(93, {
      _extendedTypeId: 1,
      resourceType: 'COMPONENT',
      ...params
    }),

  // 场景需求详情页
  getChangJingNeedDetails: (params) => callCommonApi(94, params),

  // 场景创新-申请访问预约
  applyActive: (params) =>
    callCommonApi(168, {
      ...params
    }),
  // 按年份获取可预约时间
  getMonthRemainingCapacity: (params) => {
    return callCommonApi(169, {
      ...params
    })
  },
  // 提交需求填报
  saveNeed: (params) =>
    callCommonApi(173, {
      ...params
    }),
  // 获取统计数据**各账本目录树统计-侧边栏-数据
  getStatCnt: (params) =>
    callCommonApi(122, {
      ...params
    }),
  // 保存申请加入生态合作伙伴
  applyJoin: (params) =>
    callCommonApi(129, {
      ...params
    }),
  // 文件上传
  // uploadFile:(params)=> callCommonApi(128,params),
  // 获取选项框数据/查询
  getOptionsData: (params) =>
    callCommonApi(132, {
      ...params
    }),
  // 保存业务表单
  saveBusinessForm: (params) =>
    callCommonApi(131, {
      ...params
    }),

  // 组件保存接口
  zjSaveApi: (params) =>
    callCommonApi(134, {
      ...params
    }),
  // 互联网门户-数据创新已入驻的项目分页接口
  getDataInnovationProjects: (params) =>
    callCommonApi(139, {
      ...params
    }),
  getComputedStyleProjects: (params) =>
    callCommonApi(140, {
      ...params
    }),
  // 互联网门户-政务大模型评测区合作伙伴申请保存接口
  applyModelFrom: (params) =>
    callCommonApi(145, {
      ...params
    }),
  //场景apiId
  changjing: {
    getChangjStatCntId: 97,
    getPublicProjectsId: 98,
    changjProjectDetails: 95,
    // 互联网门户-数据创新已入驻的项目分页接口
    getDataInnovationProjects: 139,
    // 互联网门户-获取对外发布的场景需求-按阶段分页查询

    getComputedStyleProjects: 140
  },
  // 内容发布系统-保存栏目/文章访问记录
  wms: {
    saveAccesslog: 127
  }
}
