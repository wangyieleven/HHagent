// 通用响应处理函数
function handleResponse(data) {
  if (!data || typeof data !== 'object' || data.isSuccess === false) {
    return { success: false, message: data?.msg || '接口返回异常', data: null }
  }

  const rawData = data.data

  if (rawData && Array.isArray(rawData.records)) {
    return {
      success: true,
      empty: rawData.records.length === 0,
      data: rawData
    }
  }

  if (rawData !== undefined && rawData !== null) {
    return {
      success: true,
      empty: Array.isArray(rawData) && rawData.length === 0,
      data: rawData
    }
  }

  return { success: true, empty: true, data: null }
}

function legacyDemoResponse() {
  const empty = []
  empty.records = []
  empty.rows = []
  empty.list = []
  empty.content = []
  empty.total = 0
  empty.current = 1
  empty.pages = 0
  empty.size = 0
  return handleResponse({
    code: 0,
    isSuccess: true,
    success: true,
    msg: 'HHagent demo mode: live API disabled',
    data: empty,
    rows: [],
    total: 0
  })
}

function isDemoRuntime() {
  const config = window.__HH_RUNTIME_CONFIG__ || {}
  return config.mode === 'demo' || config.enableLiveApi !== true || !config.apiBase
}

// 通用 jQuery POST 请求封装
function ajaxPost(url, params) {
  if (isDemoRuntime()) return Promise.resolve(legacyDemoResponse())

  return new Promise((resolve) => {
    $.ajax({
      url,
      type: 'POST',
      contentType: 'application/x-www-form-urlencoded',
      data: params,
      xhrFields: { withCredentials: true },
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
  if (isDemoRuntime()) return Promise.resolve(legacyDemoResponse())

  return Common_AjaxCallApi(apiId, null, params)
    .then((data) => handleResponse(data))
    .catch((err) => {
      console.error('请求失败:', err)
      return { success: false, message: '请求失败', error: err }
    })
}

// 主服务对象
const apiService = {
  getNeedList: (url, params) => ajaxPost(url, params),
  getChengGuoList: (url, params) => ajaxPost(url, params),
  getShujuList: (params) => callCommonApi(87, { _extendedTypeId: 1, resourceType: 'DATA', ...params }),
  getChanPinList: (params) => callCommonApi(90, { _extendedTypeId: 1, resourceType: 'APPLICATION', ...params }),
  getChuangXinResults: (params) => callCommonApi(86, params),
  getChangJingNeed: (params) => callCommonApi(91, params),
  getChangJingResults: (params) => callCommonApi(92, params),
  getNeedQuantity: () => callCommonApi(85, {}),
  getYunSuanLiList: (params) => callCommonApi(89, { _extendedTypeId: 1, resourceType: 'CLOUD', ...params }),
  getZuJianList: (params) => callCommonApi(93, { _extendedTypeId: 1, resourceType: 'COMPONENT', ...params }),
  getChangJingNeedDetails: (params) => callCommonApi(94, params),
  applyActive: (params) => callCommonApi(168, { ...params }),
  getMonthRemainingCapacity: (params) => callCommonApi(169, { ...params }),
  saveNeed: (params) => callCommonApi(173, { ...params }),
  getStatCnt: (params) => callCommonApi(122, { ...params }),
  applyJoin: (params) => callCommonApi(129, { ...params }),
  getOptionsData: (params) => callCommonApi(132, { ...params }),
  saveBusinessForm: (params) => callCommonApi(131, { ...params }),
  zjSaveApi: (params) => callCommonApi(134, { ...params }),
  getDataInnovationProjects: (params) => callCommonApi(139, { ...params }),
  getComputedStyleProjects: (params) => callCommonApi(140, { ...params }),
  applyModelFrom: (params) => callCommonApi(145, { ...params }),
  changjing: {
    getChangjStatCntId: 97,
    getPublicProjectsId: 98,
    changjProjectDetails: 95,
    getDataInnovationProjects: 139,
    getComputedStyleProjects: 140
  },
  wms: { saveAccesslog: 127 }
}
