// commonUrl.js
const BASE_HOST = "http://172.25.169.103";

const ApiModules = {
    changj: `${BASE_HOST}/ChuangXinApi/v1/changj`,
};

const ApiUrls = {
    getChangjingReqMana: `${ApiModules.changj}/getChangjingReqMana`,
    getPublishList: `${ApiModules.changj}/getPublishList`,
    getChengGuoList: `${ApiModules.changj}/getChengGuoList`,
	getPublishReqCnt: `${ApiModules.changj}/getPublishReqCnt`,

    getPublishListByType: function (type) {
        return `${ApiModules.changj}/getPublishList?changjingType=${type}`;
    }
};

// 挂到全局，便于 Freemarker 模板里其他 JS 使用
window.BASE_HOST = BASE_HOST;
window.ApiModules = ApiModules;
window.ApiUrls = ApiUrls;
