$(function () {
    $(document).ready(function () {
        setupFormValidation();
    })
    // 提交
    function submitCreateFlow(wantCreateFlow, done) {
        // 收集表单数据
        // 只取自定义上传文件的 fileId，如果没有就是空
        // const fileId = $("#file-list li").eq(1).data("file-id") || '';
        const formData = {
            organizationName: sanitizeInput($('#cnName').val()?.trim()) || '',
            uscc: sanitizeInput($('#uscCode').val()?.trim()) || '',
            registeredAddress: sanitizeInput($('#regAddress').val()?.trim()) || '',
            legalRepresentative: sanitizeInput($('#legal').val()?.trim()) || '',
            applicationContactName: sanitizeInput($('#applyUserName').val()?.trim()) || '',
            applicationContactPhone: $('#applyUserMobile').val()?.trim() || '',
            applicationContactTitle: sanitizeInput($('#applyUserJob').val()?.trim()) || '',
            applicationContactEmail: $('#applyUserEmail').val()?.trim() || '',
            wantCreateFlow: wantCreateFlow,
            capabilityRequirementsIdList: capabilityRequirementsIdList.join(','),
            type:"1"
        };

        // console.log('提交的表单数据', formData);
        apiService.saveBusinessForm(formData).then(res => {
            if (res.success) {
                if (wantCreateFlow) {
                    startClosePageCountdown();
                } else {
                    layer.msg('保存成功', { icon: 1 });
                }
            }
            if (typeof done === 'function') done();
        }).catch(function () {
            if (typeof done === 'function') done();
        });
    }

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
    // 页面加载后批量请求
    let capabilityRequirementsIdList = [];
    $(document).on('change', '.capability-checkbox', function () {
        const id = $(this).data('id');
        if (this.checked) {
            if (!capabilityRequirementsIdList.includes(id)) {
                capabilityRequirementsIdList.push(id);
            }
        } else {
            capabilityRequirementsIdList = capabilityRequirementsIdList.filter(i => i !== id);
        }
    });

    // tab选项与tbody id映射
    const TECH_TYPE_MAP = {
        "数据采集治理技术": "tech-tbody-1",
        "数据计算存储技术": "tech-tbody-2",
        "数据智能技术": "tech-tbody-3",
        "数据流通交易技术": "tech-tbody-4",
        "数据开发应用技术": "tech-tbody-5",
        "数据安全技术": "tech-tbody-6"
    };

    // 批量渲染所有方向
    function renderAllTechOptions() {
        // 渲染前清空选中项
        // capabilityRequirementsIdList = [];
        Object.entries(TECH_TYPE_MAP).forEach(([type, tbodyId]) => {
            getOptionsData(type).then(res => {
                const tbody = $('#' + tbodyId);
                tbody.empty();
                let arr = res?.data || [];
                let rowIdx = 1;
                let html = '';
                arr.forEach(item => {
                    html += `
                        <tr>
                          <td class='checkbox-cell'><input type='checkbox' class='capability-checkbox' data-id='${item.id}' name='tech-item-table${tbodyId.split('-')[2]}'></td>
                          <td>${rowIdx++}</td>
                          <td>${item.technicalDirection || ''}</td>
                          <td> ${item.info || ''}</td>
                          <td>${item.orgName || ''}</td>
                          <td>${item.keyApplicationAreas || ''}</td>
                        </tr>
                    `;
                });
                tbody.append(html);
            });
        })
    }
    renderAllTechOptions();

    // 获取选项数据方法
    function getOptionsData(type) {
        return apiService.getOptionsData({ _templateParams: type })
            .then(res => {
                // console.log(type+'请求结果:', res);
                return res;
            });
    }
    function setupFormValidation() {
        // 提交按钮
        var submitting = false;
        $('.confirm').on('click', function (e) {
            e.preventDefault();
            if (submitting) return; // 防止多次点击
            if (validateForm()) {
                submitting = true;
                $('.confirm').prop('disabled', true).text('提交中...');
                submitCreateFlow(true, function () {
                    submitting = false;
                    $('.confirm').prop('disabled', false).text('提交申请');
                });
            }
        });

        // 错误清除
        $('input, textarea, .upload').on('input change', function () {
            clearError($(this));
        });
    }

    // 主验证函数
    function validateForm() {
        let isValid = true;
        const requiredFields = [
            { selector: '#cnName', message: '请输入单位名称' },
            { selector: '#uscCode', message: '请输入统一社会信用代码' },
            { selector: '#regAddress', message: '请输入注册地址' },
            { selector: '#legal', message: '请输入法定代表人' },
            { selector: '#applyUserName', message: '请输入申请联系人姓名' },
            { selector: '#applyUserMobile', message: '请输入申请联系人电话' },
            { selector: '#applyUserJob', message: '请输入申请联系人职务' },
            { selector: '#applyUserEmail', message: '请输入申请联系人邮箱/传真' },
        ];
        requiredFields.forEach(({ selector, message }) => {
            const $field = $(selector);
            if (!$field.length) {
                console.warn(`字段 ${selector} 不存在`);
                return;
            }
            const value = $field.val()?.trim() || '';
            // 验证字段是否为空
            if (!value) {
                showError($field, message);
                isValid = false;
            }
        });

        // 单位名称需为字符串（仅中文、英文和部分符号，禁止数字）
        const orgName = $('#cnName').val()?.trim() || '';
        const orgNameStrReg = /^[\u4e00-\u9fa5a-zA-Z\(\)（）·•.,，。\-\s]{2,100}$/;
        if (orgName && !orgNameStrReg.test(orgName)) {
            showError($('#cnName'), '单位名称只能是中文、英文及常用符号，不能包含数字');
            isValid = false;
        }

        // 统一社会信用代码
        const uscCode = $("#uscCode").val()?.trim() || '';
        const uscCodeRegex = /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/;
        if (uscCode && !uscCodeRegex.test(uscCode)) {
            showError($('#uscCode'), '请输入正确的统一社会信用代码');
            isValid = false;
        }

        // 电话格式验证
        const mobile = $("#applyUserMobile").val()?.trim() || '';
        const mobileRegex = /^1[3-9]\d{9}$/;
        if (mobile && !mobileRegex.test(mobile)) {
            showError($('#applyUserMobile'), '请输入正确的联系电话');
            isValid = false;
        }

        // 邮箱/传真格式验证
        const emailFax = $("#applyUserEmail").val()?.trim() || '';
        const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
        const faxRegex = /^(\d{3,4}-)?\d{7,8}$/;
        if (emailFax && !emailRegex.test(emailFax) && !faxRegex.test(emailFax)) {
            showError($('#applyUserEmail'), '请输入正确的邮箱或传真格式');
            isValid = false;
        }

        // 验证附件上传
        // const fileListCount = $('#file-list li').length;  // 正确：检查li元素
        // if (fileListCount === 1) {
        //     showError($('.upload'), '请上传附件');
        //     isValid = false;
        // }

        if (!capabilityRequirementsIdList.length) {
            layer.msg('请至少勾选一个技术方向', { icon: 2 });
            isValid = false;
        }

        return isValid;
    }
    // 显示错误提示
    function showError($elem, message) {
        $elem.next('.error-tip').remove();
        $elem.after(`<div class="error-tip" style="color:#f00;font-size:12px">${message}</div>`);
        $elem.css('border-color', '#f00');
    }
    // 清除错误提示
    function clearError($elem) {
        $elem.next('.error-tip').remove();
        $elem.css('border-color', '');
    }
    function sanitizeInput(value) {
        if (typeof value !== "string") return value;
        return value
            .replace(/<script.*?>.*?<\/script>/gi, "") // 移除 script 标签
            .replace(/<\/?[^>]+(>|$)/g, "")            // 移除所有 HTML 标签
            .replace(/on\w+="[^"]*"/gi, "")            // 移除事件属性，如 onclick=""
            .replace(/javascript:/gi, "");             // 移除 javascript: 协议
    }

})
