
const $$baseUrl = "/portal";

/**
 * 统一接口调用
 * @param apiId 接口编号
 * @param templateParams 模版参数
 * @param paramData 参数对象
 * @returns {Promise<unknown>}
 * @constructor
 */
async function Common_AjaxCallApi(apiId, templateParams, paramData) {
    paramData = paramData || {};
    paramData._id = apiId;
    templateParams ? paramData._templateParams = templateParams : templateParams;
    return await new Promise((resolve, reject) => {
        $.ajax({
            url : $$baseUrl + "/api/common/calling/publicCall",
            // postCall
            contentType: "application/json",
            data : JSON.stringify(paramData),
            type : "POST",
            success: resolve,
            error: reject
        })
    })
}