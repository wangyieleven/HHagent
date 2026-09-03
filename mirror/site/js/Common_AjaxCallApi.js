/* Legacy API adapter. Demo mode returns deterministic local empty data. */
const $$runtimeConfig = window.__HH_RUNTIME_CONFIG__ || {};
const $$apiRoot = $$runtimeConfig.enableLiveApi === true && $$runtimeConfig.apiBase
  ? String($$runtimeConfig.apiBase).replace(/\/+$/, '')
  : '';
const $$baseUrl = $$apiRoot + '/portal';

function hhIsDemoRuntime() {
  return $$runtimeConfig.mode === 'demo' || $$runtimeConfig.enableLiveApi !== true || !$$apiRoot;
}

function hhDemoApiEnvelope() {
  return {
    code: 0,
    isSuccess: true,
    success: true,
    msg: 'HHagent demo mode: live API disabled',
    data: null
  };
}

/**
 * 统一接口调用。仅在部署侧显式启用 live API 后才发起请求。
 */
async function Common_AjaxCallApi(apiId, templateParams, paramData) {
  if (hhIsDemoRuntime()) return hhDemoApiEnvelope();

  paramData = Object.assign({}, paramData || {}, { _id: apiId });
  if (templateParams) paramData._templateParams = templateParams;

  return await new Promise((resolve, reject) => {
    $.ajax({
      url: $$baseUrl + '/api/common/calling/publicCall',
      contentType: 'application/json',
      data: JSON.stringify(paramData),
      type: 'POST',
      xhrFields: { withCredentials: true },
      success: resolve,
      error: reject
    });
  });
}
