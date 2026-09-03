$(function () {
    // 初始化上传文件
    initializeUploadHandlers();
    // 设置表单验证
    setupFormValidation();
});
// 创建表单配置
function createFormConfig(prefix, options) {
    return {
        formSelector: options.formSelector,
        type: options.type,
        selectors: {
            organizationName: `#cnName-${prefix}`,
            uscc: `#uscCode-${prefix}`,
            registeredAddress: `#regAddress-${prefix}`,
            legalRepresentative: `#legal-${prefix}`,
            applicationContactName: `#applyUserName-${prefix}`,
            applicationContactPhone: `#applyUserMobile-${prefix}`,
            applicationContactTitle: `#applyUserJob-${prefix}`,
            applicationContactEmail: `#applyUserEmail-${prefix}`,
            organizationProfile: options.organizationProfileSelector,
            applicationProjectIntroduction: options.applicationIntroSelector,
            uploadList: options.uploadListSelector,
            uploadWrapper: options.uploadWrapperSelector
        }
    };
}

// 表单配置
const FORM_CONFIGS = [
    createFormConfig('data', {
        formSelector: '#register-form',
        type: 1,
        organizationProfileSelector: '#myTextarea',
        applicationIntroSelector: '#myTextarea2',
        uploadListSelector: '#file-list',
        uploadWrapperSelector: '#upload-wrapper-data'
    }),
    createFormConfig('scene', {
        formSelector: '#register-form-tgcj',
        type: 3,
        organizationProfileSelector: '#myTextarea7',
        applicationIntroSelector: '#myTextarea8',
        uploadListSelector: '#file-list4',
        uploadWrapperSelector: '#upload-wrapper-scene'
    }),
    createFormConfig('app', {
        formSelector: '#register-form-tgyy',
        type: 4,
        organizationProfileSelector: '#myTextarea9',
        applicationIntroSelector: '#myTextarea10',
        uploadListSelector: '#file-list5',
        uploadWrapperSelector: '#upload-wrapper-app'
    }),
    createFormConfig('service', {
        formSelector: '#register-form-tgfw',
        type: 5,
        organizationProfileSelector: '#myTextarea11',
        applicationIntroSelector: '#myTextarea12',
        uploadListSelector: '#file-list6',
        uploadWrapperSelector: '#upload-wrapper-service'
    }),
    createFormConfig('other', {
        formSelector: '#register-form-tgqt',
        type: 6,
        organizationProfileSelector: '#myTextarea13',
        applicationIntroSelector: '#myTextarea14',
        uploadListSelector: '#file-list7',
        uploadWrapperSelector: '#upload-wrapper-other'
    })
];
// 提交
function setupFormValidation() {
    FORM_CONFIGS.forEach((config) => {
        const $form = $(config.formSelector);
        if (!$form.length) return;
        const $submitBtn = $form.find('.confirm');
        if (!$submitBtn.length) return;
        let submitting = false;

        $submitBtn.on('click', function (e) {
            e.preventDefault();
            if ($submitBtn.prop('disabled')) return;
            if (submitting) return;
            if (!validateForm(config)) {
                if (window.layer) {
                    layer.msg('请按照正确格式填写', { icon: 0 });
                } else {
                    alert('请按照正确格式填写');
                }
                return;
            }

            submitting = true;
            $submitBtn.prop('disabled', true).text('提交中...');
            submitCreateFlow(config, true, function () {
                submitting = false;
                $submitBtn.prop('disabled', false).text('提交申请');
            });
        });
    });

    $(document).on('input change', 'input, textarea', function () {
        clearError($(this));
    });
}

// 验证表单
function validateForm(config) {
    let isValid = true;
    const selectors = config.selectors;
    const requiredFields = [
        { selector: selectors.organizationName, message: '请输入单位名称' },
        { selector: selectors.uscc, message: '请输入统一社会信用代码' },
        { selector: selectors.registeredAddress, message: '请输入注册地址' },
        { selector: selectors.legalRepresentative, message: '请输入法定代表人' },
        { selector: selectors.applicationContactName, message: '请输入申请联系人姓名' },
        { selector: selectors.applicationContactPhone, message: '请输入申请联系人电话' },
        { selector: selectors.applicationContactTitle, message: '请输入申请联系人职务' },
        { selector: selectors.applicationContactEmail, message: '请输入申请联系人邮箱/传真' },
        { selector: selectors.organizationProfile, message: '请输入单位简介' },
        { selector: selectors.applicationProjectIntroduction, message: '请输入项目介绍' }
    ];

    requiredFields.forEach(({ selector, message }) => {
        const $field = $(selector);
        if (!$field.length) return;
        const value = $field.val()?.trim() || '';
        if (!value) {
            showError($field, message);
            isValid = false;
        }
    });

    const orgName = $(selectors.organizationName).val()?.trim() || '';
    const orgNameStrReg = /^[\u4e00-\u9fa5a-zA-Z\(\)（）·•.,，。\-\s]{2,100}$/;
    if (orgName && !orgNameStrReg.test(orgName)) {
        showError($(selectors.organizationName), '单位名称只能是中文、英文及常用符号，不能包含数字');
        isValid = false;
    }

    const uscCode = $(selectors.uscc).val()?.trim() || '';
    const uscCodeRegex = /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/;
    if (uscCode && !uscCodeRegex.test(uscCode)) {
        showError($(selectors.uscc), '请输入正确的统一社会信用代码');
        isValid = false;
    }

    const mobile = $(selectors.applicationContactPhone).val()?.trim() || '';
    const mobileRegex = /^1[3-9]\d{9}$/;
    if (mobile && !mobileRegex.test(mobile)) {
        showError($(selectors.applicationContactPhone), '请输入正确的联系电话');
        isValid = false;
    }

    const emailFax = $(selectors.applicationContactEmail).val()?.trim() || '';
    const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    const faxRegex = /^(\d{3,4}-)?\d{7,8}$/;
    if (emailFax && !emailRegex.test(emailFax) && !faxRegex.test(emailFax)) {
        showError($(selectors.applicationContactEmail), '请输入正确的邮箱或传真格式');
        isValid = false;
    }

    // const $uploadList = $(selectors.uploadList);
    // if (!$uploadList.length || $uploadList.find('li.uploaded-file').length === 0) {
    //     const $wrapper = $(selectors.uploadWrapper);
    //     if ($wrapper.length) {
    //         showError($wrapper, '请上传附件');
    //     }
    //     isValid = false;
    // }

    return isValid;
}

// 提交创建流程
function submitCreateFlow(config, wantCreateFlow, done) {
    const selectors = config.selectors;
    const fileId = $(selectors.uploadList).find('li.uploaded-file').data('file-id') || '';
    const formData = {
        createPersonId: $("#header_userIdCode_input_id").val(),
        createPersonName: $("#header_realName_input_id").val(),
        organizationName: sanitizeInput($(selectors.organizationName).val()?.trim()) || '',
        uscc: sanitizeInput($(selectors.uscc).val()?.trim()) || '',
        registeredAddress: sanitizeInput($(selectors.registeredAddress).val()?.trim()) || '',
        legalRepresentative: sanitizeInput($(selectors.legalRepresentative).val()?.trim()) || '',
        applicationContactName: sanitizeInput($(selectors.applicationContactName).val()?.trim()) || '',
        applicationContactPhone: $(selectors.applicationContactPhone).val()?.trim() || '',
        applicationContactTitle: sanitizeInput($(selectors.applicationContactTitle).val()?.trim()) || '',
        applicationContactEmail: $(selectors.applicationContactEmail).val()?.trim() || '',
        organizationProfile: sanitizeInput($(selectors.organizationProfile).val()?.trim()) || '',
        applicationProjectIntroduction: sanitizeInput($(selectors.applicationProjectIntroduction).val()?.trim()) || '',
        attachmentUploadFileId: fileId,
        wantCreateFlow: wantCreateFlow,
        type: String(config.type)
    };

    apiService.applyJoin(formData).then(res => {
        if (res.success) {
            if (wantCreateFlow) {
                startClosePageCountdown();
            } else if (window.layer) {
                layer.msg('保存成功', { icon: 1 });
            }
        }
        if (typeof done === 'function') done();
    }).catch(function () {
        if (typeof done === 'function') done();
    });
}
// 上传文件
function initializeUploadHandlers() {
    $(document).on('change', '.js-upload-input', function (e) {
        const $input = $(this);
        const files = e.target.files;
        if (!files || !files.length) return;
        const file = files[0];
        const listSelector = $input.data('list');
        const $list = $(listSelector);
        if (!$list.length) return;

        const maxSize = 5 * 1024 * 1024;
        const allowedType = /\.(docx?|pdf)$/i;
        if (!allowedType.test(file.name)) {
            alert('只能上传Word文档或PDF（.doc、.docx、.pdf）');
            $list.find('li.uploaded-file').remove();
            resetFileInput($input);
            return;
        }
        if (file.size > maxSize) {
            alert('文件大小不能超过5MB');
            $list.find('li.uploaded-file').remove();
            resetFileInput($input);
            return;
        }

        const wrapperSelector = $input.data('wrapper');
        const $wrapper = wrapperSelector ? $(wrapperSelector) : $input.closest('.upload');

        const formData = new FormData();
        formData.append('file', file);

        $list.find('li.uploaded-file').remove();
        const loadingLi = $('<li class="uploaded-file">上传中...</li>');
        $list.append(loadingLi);

        $.ajax({
            url: $$baseUrl + '/custom/file/yunYingUpload',
            type: "POST",
            data: formData,
            cache: false,
            processData: false,
            contentType: false,
            success: function (result) {
                if (result && (result.code === 200 || result.isSuccess === true) && result.data) {
                    const fileId = result.data;
                    const $li = $(`<li class="uploaded-file" data-file-id="${fileId}">${file.name} <span class="remove-upload-file" style="color:#d00;cursor:pointer;">删除</span></li>`);
                    loadingLi.replaceWith($li);
                    if ($wrapper && $wrapper.length) {
                        clearError($wrapper);
                    }
                    if (window.layer) {
                        layer.msg('上传成功', { icon: 1, time: 1500 });
                    } else {
                        alert('上传成功');
                    }
                } else {
                    loadingLi.text("上传失败").addClass("error");
                }
            },
            error: function () {
                loadingLi.text("上传失败").addClass("error");
            },
            complete: function () {
                resetFileInput($input);
            }
        });
    });

    $(document).on('click', '.remove-upload-file', function () {
        const $li = $(this).closest('li.uploaded-file');
        const $list = $li.closest('ul');
        const inputSelector = $list.data('input');
        $li.remove();
        if (inputSelector) {
            $(inputSelector).val('');
        }
    });
}

// 重置文件输入
function resetFileInput($input) {
    $input.val('');
}

// 显示错误
function showError($elem, message) {
    $elem.next('.error-tip').remove();
    $elem.after(`<div class="error-tip" style="color:#f00;font-size:12px">${message}</div>`);
    $elem.css('border-color', '#f00');
}

// 清除错误
function clearError($elem) {
    $elem.next('.error-tip').remove();
    $elem.css('border-color', '');
}

// 清除输入
function sanitizeInput(value) {
    if (typeof value !== "string") return value;
    return value
        .replace(/<script.*?>.*?<\/script>/gi, "")
        .replace(/<\/?[^>]+(>|$)/g, "")
        .replace(/on\w+="[^"]*"/gi, "")
        .replace(/javascript:/gi, "");
}

// 倒计时关闭页面
function startClosePageCountdown() {
    let remainingSeconds = 3;
    const contentTemplate = () => `提交成功，${remainingSeconds}s 后关闭此页面`;
    const index = layer.open({
        type: 1,
        title: false,
        closeBtn: 0,
        shade: 0.3,
        shadeClose: false,
        area: 'auto',
        content: `<div class="submit-success-countdown" style="padding:20px 36px;font-size:16px;text-align:center;">${contentTemplate()}</div>`
    });
    const selector = `#layui-layer${index} .submit-success-countdown`;
    const timer = setInterval(() => {
        remainingSeconds -= 1;
        if (remainingSeconds > 0) {
            $(selector).text(contentTemplate());
        } else {
            clearInterval(timer);
            layer.close(index);
            attemptClosePage();
        }
    }, 1000);
}

function attemptClosePage() {
    window.close();
    setTimeout(() => {
        if (!document.hidden && window.history.length > 1) {
            window.history.back();
        }
    }, 150);
}
