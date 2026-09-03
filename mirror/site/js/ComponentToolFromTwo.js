;(function ($) {
    const ICON_ALLOWED_TYPE = /\.png$/i;
    const ICON_MAX_SIZE = 2 * 1024 * 1024; // 2MB
    const QUALITY_ALLOWED_TYPE = /\.(docx?|pdf)$/i;
    const QUALITY_MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const APK_URL_REGEX = /^https?:\/\//i;
    const COMPONENT_FORM_SELECTOR = '#register-form-tgzj';
    const COMPONENT_CONFIRM_SELECTOR = `${COMPONENT_FORM_SELECTOR} .confirm`;
    const COMPONENT_LOGO_WRAPPER = '#componentLogoWrapper';
    const COMPONENT_LOGO_INPUT = '#componentLogoUpload';
    const COMPONENT_LOGO_LIST = '#file-list2';
    const COMPONENT_QUALITY_WRAPPER = '#qualityUploadWrapper';
    const COMPONENT_QUALITY_INPUT = '#componentQualityUpload';
    const COMPONENT_QUALITY_LIST = '#file-list3';
    const CATEGORY_INPUT_SELECTOR = '#category-input';
    const CATEGORY_HIDDEN_SELECTOR = '#component-category-names';

    $(function () {
        preventNativeSubmit();
        setupQualityPlaceholder();
        setupFormValidation();
        bindLogoUpload();
        bindQualityUpload();
        bindRemoveUpload();
        bindCategoryEvents();
    });

    function preventNativeSubmit() {
        $('#register-form-tgzj').on('submit', function (e) {
            e.preventDefault();
        });
    }

    function setupQualityPlaceholder() {
        const $list = $(COMPONENT_QUALITY_LIST);
        const $first = $list.find('li').first();
        if ($first.length && !$first.hasClass('uploaded-file')) {
            $first.addClass('placeholder');
        }
    }

    function setupFormValidation() {
        let submitting = false;
        $(COMPONENT_CONFIRM_SELECTOR).on('click', function (e) {
            e.preventDefault();
            if (submitting) return;
            if (!validateForm()) {
                if (window.layer) {
                    layer.msg('请按照正确格式填写', { icon: 0 });
                } else {
                    alert('请按照正确格式填写');
                }
                return;
            }
            submitting = true;
            const $btn = $(this);
            $btn.prop('disabled', true).text('提交中...');
            submitComponent(true, function () {
                submitting = false;
                $btn.prop('disabled', false).text('提交申请');
            });
        });

        $(`${COMPONENT_FORM_SELECTOR} input, ${COMPONENT_FORM_SELECTOR} textarea, ${COMPONENT_FORM_SELECTOR} select`).on('input change', function () {
            clearError($(this));
        });

        $(`${COMPONENT_LOGO_WRAPPER}, ${COMPONENT_QUALITY_WRAPPER}`).on('click', function () {
            clearError($(this));
        });
    }

    function bindCategoryEvents() {
        $(document).on('component-category-change', function () {
            clearError($(CATEGORY_INPUT_SELECTOR));
        });
    }

    function bindLogoUpload() {
        $(`${COMPONENT_LOGO_WRAPPER} .upload-button2`).on('click', function () {
            $(COMPONENT_LOGO_INPUT).trigger('click');
        });

        $(COMPONENT_LOGO_INPUT).on('change', function (e) {
            const file = (e.target.files || [])[0];
            if (!file) return;

            if (!ICON_ALLOWED_TYPE.test(file.name)) {
                alert('仅支持 PNG 格式的图标');
                $(this).val('');
                return;
            }
            if (file.size > ICON_MAX_SIZE) {
                alert('图标大小不能超过2MB');
                $(this).val('');
                return;
            }

            const $list = $(COMPONENT_LOGO_LIST);
            removeLogoPlaceholder();
            $list.find('li.uploaded-file').remove();
            const loadingLi = $('<li class="uploaded-file uploading">读取中...</li>');
            $list.append(loadingLi);

            fileToBase64(file).then(function (base64) {
                const fileInfo = {
                    id: '',
                    url: base64,
                    name: file.name,
                    type: getFileExtension(file.name)
                };
                const $li = buildUploadedListItem(fileInfo, 'icon');
                loadingLi.replaceWith($li);
                clearError($(COMPONENT_LOGO_WRAPPER));
                notifyUploadSuccess();
            }).catch(function () {
                loadingLi.text('读取失败').addClass('error');
            }).finally(function () {
                $(COMPONENT_LOGO_INPUT).val('');
            });
        });
    }

    function bindQualityUpload() {
        $(`${COMPONENT_QUALITY_WRAPPER} .upload-button3`).on('click', function () {
            $(COMPONENT_QUALITY_INPUT).trigger('click');
        });

        $(COMPONENT_QUALITY_INPUT).on('change', function (e) {
            const files = Array.from(e.target.files || []);
            if (!files.length) return;

            files.forEach(function (file) {
                if (!QUALITY_ALLOWED_TYPE.test(file.name)) {
                    alert('附件仅支持 Word 或 PDF 格式');
                    return;
                }
                if (file.size > QUALITY_MAX_SIZE) {
                    alert('单个附件不能超过5MB');
                    return;
                }

                const placeholder = $('<li class="uploaded-file uploading">上传中...</li>').attr('data-file-role', 'quality');
                $(COMPONENT_QUALITY_LIST).append(placeholder);

                uploadFile(file).done(function (fileInfo) {
                    removeQualityPlaceholder();
                    placeholder.removeClass('uploading').data('fileInfo', fileInfo).html(`
                        <span class="uploaded-file-name">${fileInfo.name || file.name}</span>
                        <span class="remove-upload-file" style="color:#d00;cursor:pointer;margin-left:10px;">删除</span>
                    `);
                    clearError($(COMPONENT_QUALITY_WRAPPER));
                    notifyUploadSuccess();
                }).fail(function (message) {
                    placeholder.text(message || '上传失败').addClass('error');
                });
            });

            $(COMPONENT_QUALITY_INPUT).val('');
        });
    }

    function bindRemoveUpload() {
        $(document).on('click', `${COMPONENT_LOGO_LIST} .remove-upload-file, ${COMPONENT_QUALITY_LIST} .remove-upload-file`, function () {
            const $li = $(this).closest('li.uploaded-file');
            const role = $li.data('file-role');
            $li.remove();

            if (role === 'quality') {
                ensureQualityPlaceholder();
            }
            if (role === 'icon') {
                $(COMPONENT_LOGO_INPUT).val('');
                ensureLogoPlaceholder();
            }
        });
    }

    function removeLogoPlaceholder() {
        $(`${COMPONENT_LOGO_LIST} li.placeholder`).remove();
    }

    function ensureLogoPlaceholder() {
        const $list = $(COMPONENT_LOGO_LIST);
        if (!$list.find('li.uploaded-file').length) {
            $list.empty().append('<li class="placeholder"><span style="color:#aaa;">请上传PNG格式的组件工具Logo</span></li>');
        }
    }

    function removeQualityPlaceholder() {
        $(`${COMPONENT_QUALITY_LIST} li.placeholder`).remove();
    }

    function ensureQualityPlaceholder() {
        const $list = $(COMPONENT_QUALITY_LIST);
        if (!$list.find('li.uploaded-file').length) {
            $list.empty().append('<li class="placeholder"><span style="color:#aaa;">请上传附件Word或PDF</span></li>');
        }
    }

    function validateForm() {
        let isValid = true;
        const requiredFields = [
            { selector: '#componentName', message: '请输入组件工具名称' },
            { selector: '#componentVendor', message: '请输入组件工具包服务商' },
            { selector: '#componentVersion', message: '请输入组件工具版本号' },
            { selector: '#componentDesc', message: '请输入组件工具说明' },
            { selector: '#componentCall', message: '请输入组件工具调用方式' },
            { selector: '#componentDownload', message: '请输入组件工具安装包下载地址' },
            { selector: '#cnName-component', message: '请输入单位名称' },
            { selector: '#uscCode-component', message: '请输入统一社会信用代码' },
            { selector: '#regAddress-component', message: '请输入注册地址' },
            { selector: '#legal-component', message: '请输入法定代表人' },
            { selector: '#applyUserName-component', message: '请输入申请联系人姓名' },
            { selector: '#applyUserMobile-component', message: '请输入申请联系人电话' },
            { selector: '#applyUserJob-component', message: '请输入申请联系人职务' },
            { selector: '#applyUserEmail-component', message: '请输入申请联系人邮箱/传真' }
        ];

        requiredFields.forEach(function ({ selector, message }) {
            const $field = $(selector);
            const value = $field.val()?.trim() || '';
            if (!value) {
                showError($field, message);
                isValid = false;
            }
        });

        const orgName = $('#cnName-component').val()?.trim() || '';
        const orgNameStrReg = /^[\u4e00-\u9fa5a-zA-Z\(\)（）·•.,，。\-\s]{2,100}$/;
        if (orgName && !orgNameStrReg.test(orgName)) {
            showError($('#cnName-component'), '单位名称只能是中文、英文及常用符号，不能包含数字');
            isValid = false;
        }

        const uscCode = $('#uscCode-component').val()?.trim() || '';
        const uscCodeRegex = /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/;
        if (uscCode && !uscCodeRegex.test(uscCode)) {
            showError($('#uscCode-component'), '请输入正确的统一社会信用代码');
            isValid = false;
        }

        const mobile = $('#applyUserMobile-component').val()?.trim() || '';
        const mobileRegex = /^1[3-9]\d{9}$/;
        if (mobile && !mobileRegex.test(mobile)) {
            showError($('#applyUserMobile-component'), '请输入正确的联系电话');
            isValid = false;
        }

        const emailFax = $('#applyUserEmail-component').val()?.trim() || '';
        const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
        const faxRegex = /^(\d{3,4}-)?\d{7,8}$/;
        if (emailFax && !emailRegex.test(emailFax) && !faxRegex.test(emailFax)) {
            showError($('#applyUserEmail-component'), '请输入正确的邮箱或传真格式');
            isValid = false;
        }

        const archValue = $('#componentArch').val();
        if (!archValue) {
            showError($('#componentArch'), '请选择支持架构');
            isValid = false;
        }

        const apkValue = $('#componentDownload').val()?.trim() || '';
        if (apkValue && !APK_URL_REGEX.test(apkValue)) {
            showError($('#componentDownload'), '请填写有效的下载地址（以 http(s) 开头）');
            isValid = false;
        }

        const categoryNames = getSelectedCategoryNames();
        if (!categoryNames.length) {
            showError($('#category-input'), '请选择组件工具分类');
            isValid = false;
        }

        if (!$(COMPONENT_LOGO_LIST).find('li.uploaded-file').length) {
            showError($(COMPONENT_LOGO_WRAPPER), '请上传组件工具Logo');
            isValid = false;
        }

        if (!$(COMPONENT_QUALITY_LIST).find('li.uploaded-file').length) {
            showError($(COMPONENT_QUALITY_WRAPPER), '请上传质量测试报告');
            isValid = false;
        }

        return isValid;
    }

    function submitComponent(wantCreateFlow, done) {
        const payload = buildSubmitPayload(wantCreateFlow);
        apiService.zjSaveApi(payload).then(function (res) {
            if (res.success) {
                if (wantCreateFlow) {
                    startClosePageCountdown();
                } else if (window.layer) {
                    layer.msg('保存成功', { icon: 1 });
                }
            } else {
                const msg = res.message || '提交失败，请稍后重试';
                if (window.layer) {
                    layer.msg(msg, { icon: 2 });
                } else {
                    alert(msg);
                }
            }
            if (typeof done === 'function') done();
        }).catch(function (err) {
            console.error(err);
            if (window.layer) {
                layer.msg('提交失败，请稍后重试', { icon: 2 });
            } else {
                alert('提交失败，请稍后重试');
            }
            if (typeof done === 'function') done();
        });
    }

    function buildSubmitPayload(isFinalSubmit) {
        const categoryNames = getSelectedCategoryNames();
        const iconInfo = getUploadedIconInfo();
        const qualityFiles = getQualityFiles();
        // const englishCategoryNames = categoryNames.map(extractParenthesisContent);
        return {
            name: sanitizeInput($('#componentName').val()?.trim()) || '',
            version: sanitizeInput($('#componentVersion').val()?.trim()) || '',
            categoryNameStr: categoryNames.map(extractParenthesisContent).join(','),
            categoryNames: categoryNames,
            vendor: sanitizeInput($('#componentVendor').val()?.trim()) || '',
            icon: iconInfo.url || iconInfo.id || '',
            iconType: iconInfo.type || getFileExtension(iconInfo.name),
            description: sanitizeInput($('#componentDesc').val()?.trim()) || '',
            callTypeDesc: sanitizeInput($('#componentCall').val()?.trim()) || '',
            filesString: buildFilesString(qualityFiles),
            apk: sanitizeInput($('#componentDownload').val()?.trim()) || '',
            createUser: $('#header_userIdCode_input_id').val()?.trim() || $('#header_realName_input_id').val()?.trim() || '',
            createTime: formatDate(new Date()),
            arch: $('#componentArch').val() || '',
            isSave: isFinalSubmit ? '1' : '0',
            enterpriseInfo: JSON.stringify(buildEnterpriseInfo())
        };
    }

    function buildFilesString(files) {
        return files.map(function (file) {
            return file.filename || '';
        }).filter(Boolean).join(',');
    }

    function buildEnterpriseInfo() {
        return {
            companyName: sanitizeInput($('#cnName-component').val()?.trim()) || '',
            unifiedSocialCreditCode: sanitizeInput($('#uscCode-component').val()?.trim()) || '',
            registeredAddress: sanitizeInput($('#regAddress-component').val()?.trim()) || '',
            legalRepresentative: sanitizeInput($('#legal-component').val()?.trim()) || '',
            registeredCapital: '',
            establishmentDate: '',
            businessScope: sanitizeInput($('#applyUserJob-component').val()?.trim())||'',
            contactPerson: sanitizeInput($('#applyUserName-component').val()?.trim()) || '',
            contactPhone: $('#applyUserMobile-component').val()?.trim() || '',
            email: $('#applyUserEmail-component').val()?.trim() || '',
            website: ''
        };
    }

    function getSelectedCategoryNames() {
        const names = $(CATEGORY_HIDDEN_SELECTOR).val() || '';
        return names.split(',').map(function (item) {
            return item.trim();
        }).filter(Boolean);
    }

    function getUploadedIconInfo() {
        const $li = $(COMPONENT_LOGO_LIST).find('li.uploaded-file').first();
        return $li.data('fileInfo') || {};
    }

    function getQualityFiles() {
        const files = [];
        $(COMPONENT_QUALITY_LIST).find('li.uploaded-file').each(function () {
            const info = $(this).data('fileInfo');
            if (info) files.push(info);
        });
        return files;
    }

    function uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('pkId', '133');

        const deferred = $.Deferred();
        $.ajax({
            url: $$baseUrl + '/custom/file/commonUpload',
            type: 'POST',
            data: formData,
            cache: false,
            processData: false,
            contentType: false,
            success: function (result) {
                if (result && (result.code === 200 || result.isSuccess === true) && result.data) {
                    deferred.resolve(normalizeUploadResponse(result.data, file));
                } else {
                    deferred.reject(result?.msg || '上传失败');
                }
            },
            error: function () {
                deferred.reject('上传失败');
            }
        });
        return deferred.promise();
    }

    function normalizeUploadResponse(rawData, file) {
        if (!rawData) {
            return {
                id: '',
                url: '',
                name: file?.name || '',
                type: getFileExtension(file?.name)
            };
        }
        if (typeof rawData === 'string') {
            return {
                id: rawData,
                url: rawData,
                name: file?.name || extractNameFromPath(rawData),
                type: getFileExtension(file?.name || rawData)
            };
        }
        if (typeof rawData === 'object') {
            return {
                id: rawData.fileId || rawData.id || rawData.dataId || '',
                url: rawData.url || rawData.fileUrl || rawData.filePath || rawData.path || rawData.fileId || '',
                name: rawData.fileName || rawData.name || file?.name || '',
                type: getFileExtension(rawData.fileName || file?.name || rawData.url || ''),
                filename: rawData.filename || rawData.fileName || ''
            };
        }
        return {
            id: '',
            url: '',
            name: file?.name || '',
            type: getFileExtension(file?.name)
        };
    }

    function buildUploadedListItem(fileInfo, role) {
        const fileName = fileInfo.name || '已上传文件';
        const $li = $(`
            <li class="uploaded-file" data-file-role="${role}">
                <span class="uploaded-file-name">${fileName}</span>
                <span class="remove-upload-file" style="color:#d00;cursor:pointer;margin-left:10px;">删除</span>
            </li>
        `);
        $li.data('fileInfo', fileInfo);
        return $li;
    }

    function showError($elem, message) {
        $elem.next('.error-tip').remove();
        $('<div class="error-tip" style="color:#f00;font-size:12px;margin-top:6px;"></div>')
            .text(message)
            .insertAfter($elem);
        $elem.css('border-color', '#f00');
    }

    function clearError($elem) {
        $elem.next('.error-tip').remove();
        $elem.css('border-color', '');
    }

    function sanitizeInput(value) {
        if (typeof value !== 'string') return value;
        return value
            .replace(/<script.*?>.*?<\/script>/gi, '')
            .replace(/<\/?[^>]+(>|$)/g, '')
            .replace(/on\w+="[^"]*"/gi, '')
            .replace(/javascript:/gi, '');
    }

    function formatDate(date) {
        const pad = function (num) {
            return num.toString().padStart(2, '0');
        };
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    }

    function startClosePageCountdown() {
        let remainingSeconds = 3;
        const contentTemplate = function () {
            return `提交成功，${remainingSeconds}s 后关闭此页面`;
        };
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
        const timer = setInterval(function () {
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
        setTimeout(function () {
            if (!document.hidden && window.history.length > 1) {
                window.history.back();
            }
        }, 150);
    }

    function getFileExtension(name) {
        if (!name) return '';
        const match = /\.([a-zA-Z0-9]+)$/.exec(name);
        return match ? match[1].toLowerCase() : '';
    }

    function extractNameFromPath(path) {
        if (!path) return '';
        const segments = path.split('/');
        return segments[segments.length - 1] || '';
    }

    function notifyUploadSuccess() {
        if (window.layer) {
            layer.msg('上传成功', { icon: 1, time: 1200 });
        }
    }

    function fileToBase64(file) {
        return new Promise(function (resolve, reject) {
            const reader = new FileReader();
            reader.onload = function () {
                resolve(reader.result);
            };
            reader.onerror = function () {
                reject(new Error('读取文件失败'));
            };
            reader.readAsDataURL(file);
        });
    }

    function extractParenthesisContent(str) {
        // 只取 / 后的最后部分里的括号内容
        const afterSlash = str.split('/').pop();
        const match = /[（(]([^)）]+)[)）]/.exec(afterSlash);
        return match ? match[1].trim() : afterSlash;
    }
})(jQuery);
