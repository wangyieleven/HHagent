;(function () {
  // ==================== 局部数据存储（使用闭包，避免全局变量）====================
  var detailData = {
    tableCode: '',
    referenceId: '',
    title: '',
    details: ''
  }

  // 设置详情数据
  function setDetailData(data) {
    detailData = Object.assign({}, detailData, data)
  }

  // 获取详情数据
  function getDetailData() {
    return JSON.parse(JSON.stringify(detailData))
  }

  // 清理数据（防止内存泄漏）
  function clearDetailData() {
    detailData = {
      tableCode: '',
      referenceId: '',
      title: '',
      details: ''
    }
  }

  // ==================== 表单校验规则 ====================
  var ValidationRules = {
    // 中文名校验（只能包含中文、空格、·）
    isChineseName: function (value) {
      var reg = /^[\u4e00-\u9fa5]+([·][\u4e00-\u9fa5]+)*$/
      return reg.test(value)
    },
    // 手机号校验（中国大陆手机号）
    isPhoneNumber: function (value) {
      var reg = /^1[3-9]\d{9}$/
      return reg.test(value)
    },
    // 企业名称校验（中文、英文、数字、下划线、括号）
    isCompanyName: function (value) {
      var reg = /^[\u4e00-\u9fa5a-zA-Z0-9()（）_\-\s]+$/
      return reg.test(value)
    }
  }

  // ==================== 获取数据源类型 ====================
  function getSourceType() {
    // 优先从局部存储获取
    if (detailData.tableCode) return detailData.tableCode

    // 从URL参数获取tableCode
    var tableCode = getUrlParam('tableCode')
    if (tableCode) return tableCode

    // 根据页面类型推断
    var pathname = window.location.pathname
    if (pathname.indexOf('gov') !== -1) return 'GOV_DATA'
    if (pathname.indexOf('lab') !== -1) return 'LAB_DATA'
    if (pathname.indexOf('social') !== -1) return 'SOCIAL_DATA'
    if (pathname.indexOf('gaozhiliang') !== -1) return 'GAOZHILIANG_DATA'
    if (pathname.indexOf('PROJECT') !== -1) return 'SETTLED_PROJECT'

    return '其他'
  }

  // ==================== 获取参考ID ====================
  function getReferenceId() {
    // 优先从局部存储获取
    if (detailData.referenceId) return detailData.referenceId

    // 从URL参数获取
    var id = getUrlParam('id')
    if (id) return id

    return ''
  }

  // ==================== 获取标题（JSON字符串格式）====================
  function getTitle() {
    // 优先从局部存储获取
    if (detailData.title) return detailData.title

    // 从页面基本信息区域构建JSON字符串
    var infoObj = {}

    // 获取页面元素数据
    var infoItems = document.querySelectorAll('.info-item')
    infoItems.forEach(function (item) {
      var label = item.querySelector('.info-label')
      var value = item.querySelector('.info-value')
      if (label && value) {
        var labelText = (label.textContent || label.innerText).replace(
          /：$/,
          ''
        )
        var valueText = value.textContent || value.innerText
        if (valueText && valueText !== '暂无数据') {
          infoObj[labelText] = valueText
        }
      }
    })

    // 如果页面没有基本信息，尝试从其他元素获取
    if (Object.keys(infoObj).length === 0) {
      var titleEl = document.querySelector('.detail-title')
      if (titleEl) {
        var title = titleEl.textContent || titleEl.innerText
        infoObj['数据资源名称'] = title
          .replace(/获取数据|预约参观|申请合作/g, '')
          .trim()
      }
    }

    // 返回JSON字符串
    return JSON.stringify(infoObj)
  }

  // ==================== 获取详情信息 ====================
  function getDetails() {
    // 优先从局部存储获取
    if (detailData.details) return detailData.details

    // 如果是申请入驻按钮触发的需求反馈，直接返回固定值
    var btnApplySettle = document.getElementById('btn-apply-settle')
    if (btnApplySettle) {
      var btnText = btnApplySettle.textContent || btnApplySettle.innerText
      if (btnText && btnText.trim() === '申请入驻') {
        return '申请入驻'
      }
    }

    var details = []

    // ====== 采集基本信息（上半部分，兼容不同页面结构）======
    // 结构1: 详情页通用.html 的 .info-item + .info-label + .info-value
    var infoItems = document.querySelectorAll('.info-item')
    if (infoItems.length > 0) {
      infoItems.forEach(function (item) {
        var label = item.querySelector('.info-label')
        var value = item.querySelector('.info-value')
        if (label && value) {
          var labelText = (label.textContent || label.innerText).replace(
            /：$/,
            ''
          )
          var valueText = value.textContent || value.innerText
          if (valueText && valueText !== '暂无数据') {
            details.push(labelText + '：' + valueText)
          }
        }
      })
    } else {
      // 结构2: 应用创新等页面的 <li><b>标签：</b>值</li>
      var liItems = document.querySelectorAll(
        '#basic-info .basic .iteam li, .content_page2 .basic .iteam li'
      )
      liItems.forEach(function (li) {
        var text = (li.textContent || li.innerText).trim()
        if (text) details.push(text)
      })
    }

    // ====== 采集描述内容（下半部分，部分页面有）======
    // 方式1: .desc-block（详情页通用.html 的描述区域）
    var descBlock = document.querySelector('.desc-block')
    if (descBlock) {
      var descText = (descBlock.textContent || descBlock.innerText).trim()
      if (descText && descText !== '暂无数据') {
        details.push(descText)
      }
    } else {
      // 方式2: #desc（应用创新等页面的描述区域）
      var descEl = document.getElementById('desc')
      if (descEl) {
        var descText2 = (descEl.textContent || descEl.innerText).trim()
        if (descText2 && descText2 !== '暂无数据') {
          // 尝试获取描述区域的标题
          var slideBox = descEl.closest('.slideTxtBox3')
          var sectionTitle = slideBox ? slideBox.querySelector('.hd li') : null
          var titleText = sectionTitle
            ? (sectionTitle.textContent || sectionTitle.innerText).trim()
            : ''
          details.push(titleText ? titleText + '：' + descText2 : descText2)
        }
      }
    }

    // ====== 采集Tab内容（入驻项目、场景需求等页面有多个Tab）======
    var tabItems = document.querySelectorAll('.tab-bar .tab-item')
    if (tabItems.length > 0) {
      tabItems.forEach(function (tab) {
        var tabLabel = (tab.textContent || tab.innerText).trim()
        var targetId = tab.getAttribute('data-target')
        if (targetId) {
          var tabContent = document.getElementById(targetId)
          if (tabContent) {
            var tabText = (
              tabContent.textContent || tabContent.innerText
            ).trim()
            if (tabText && tabText !== '暂无数据') {
              details.push(tabLabel + '：' + tabText)
            }
          }
        }
      })
    }

    return details.join('\n')
  }

  // ==================== URL参数获取 ====================
  function getUrlParam(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
    var r = window.location.search.substring(1).match(reg)
    return r ? decodeURIComponent(r[2]) : ''
  }

  // ==================== 表单验证 ====================
  function validateForm(formData) {
    // 清除之前的错误提示
    clearFormErrors()

    var errors = []
    var isValid = true

    // 联系人姓名校验
    if (!formData.contactPerson) {
      showFieldError('contactPerson', '请输入联系人姓名')
      errors.push('请输入联系人姓名')
      isValid = false
    } else if (!ValidationRules.isChineseName(formData.contactPerson)) {
      showFieldError('contactPerson', '联系人姓名只能包含中文')
      errors.push('联系人姓名只能包含中文')
      isValid = false
    }

    // 联系电话校验
    if (!formData.phoneNumber) {
      showFieldError('phoneNumber', '请输入联系电话')
      errors.push('请输入联系电话')
      isValid = false
    } else if (!ValidationRules.isPhoneNumber(formData.phoneNumber)) {
      showFieldError('phoneNumber', '请输入正确的手机号码')
      errors.push('请输入正确的手机号码')
      isValid = false
    }

    // 企业名称校验
    if (!formData.companyName) {
      showFieldError('companyName', '请输入企业名称或单位')
      errors.push('请输入企业名称或单位')
      isValid = false
    } else if (!ValidationRules.isCompanyName(formData.companyName)) {
      showFieldError(
        'companyName',
        '企业名称只能包含中文、英文、数字、括号和下划线'
      )
      errors.push('企业名称只能包含中文、英文、数字、括号和下划线')
      isValid = false
    }

    return { isValid: isValid, errors: errors }
  }

  // 显示字段错误
  function showFieldError(fieldId, message) {
    var errorEl = document.getElementById(fieldId + 'Error')
    var formGroup = document.getElementById(fieldId)?.closest('.form-group')

    if (errorEl) {
      errorEl.textContent = message
      errorEl.classList.add('show')
    }
    if (formGroup) {
      formGroup.classList.add('error')
    }
  }

  // 清除表单错误
  function clearFormErrors() {
    var errorEls = document.querySelectorAll('.error-message')
    errorEls.forEach(function (el) {
      el.textContent = ''
      el.classList.remove('show')
    })

    var formGroups = document.querySelectorAll('.form-group.error')
    formGroups.forEach(function (group) {
      group.classList.remove('error')
    })
  }

  // ==================== 提交表单 ====================
  function submitForm(formData) {
    var validationResult = validateForm(formData)
    if (!validationResult.isValid) {
      return
    }

    // 构建完整的请求数据
    var requestData = {
      source: 2,
      sourceType: getSourceType(),
      titleGoal: getDetails(), // 使用 getDetails() 获取的详情作为 titleGoal
      details: formData.details || '', // 表单填写的需求描述作为 details
      referenceId: getReferenceId(),
      contactPerson: formData.contactPerson,
      phoneNumber: formData.phoneNumber,
      companyName: formData.companyName
    }

    console.log('提交数据:', requestData)
    apiService
      .saveNeed(requestData)
      .then(function (result) {
        console.log('提交结果:', result)
        if (result && result.success) {
          // 显示成功弹窗（使用 layer）
          showSuccessModal()
          document.getElementById('demandForm').reset()
          // 清理数据，防止内存泄漏
          clearDetailData()
          // 清除错误提示
          clearFormErrors()
        } else {
          showErrorModal('提交失败，请重试')
        }
      })
      .catch(function (error) {
        console.error('提交失败:', error)
        showErrorModal('提交失败，请重试')
      })
  }
  function showErrorModal(message) {
    var contentHtml =
      '<div style="text-align: center; padding: 30px;">' +
      '<div style="width: 80px; height: 80px; margin: 0 auto 20px; background: #ff7a25; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 25px rgba(255, 152, 0, 0.4);">' +
      '<svg style="width: 40px; height: 40px; fill: #fff;" viewBox="0 0 24 24">' +
      '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>' +
      '</svg></div>' +
      '<h3 style="font-size: 18px; font-weight: bold; color: #333; margin-bottom: 15px;">提交失败</h3>' +
      '<p style="font-size: 14px; color: #666; line-height: 1.8; margin-bottom: 30px;">' +
      message +
      '</p>' +
      '<button id="errorConfirmBtn" style="' +
      'width: 100%; max-width: 200px; height: 44px; border: none; border-radius: 22px;' +
      'background: #ff7a25;' +
      'color: #fff; font-size: 16px; font-weight: 500; cursor: pointer;' +
      'transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);">' +
      '确定</button></div>'

    layer.open({
      type: 1,
      title: false,
      closeBtn: 0,
      shade: 0.5,
      shadeClose: false,
      area: 'auto',
      content: contentHtml,
      success: function (layero) {
        $('#errorConfirmBtn', layero).on('click', function () {
          layer.closeAll()
        })
      }
    })
  }
  // 显示成功弹窗
  function showSuccessModal() {
    var contentHtml =
      '<div style="text-align: center; padding: 30px;">' +
      '<div style="width: 80px; height: 80px; margin: 0 auto 20px; background: #ff7a25; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 25px rgba(54, 158, 255, 0.3);">' +
      '<svg style="width: 40px; height: 40px; fill: #fff;" viewBox="0 0 24 24">' +
      '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>' +
      '</svg></div>' +
      '<h3 style="font-size: 18px; font-weight: bold; color: #333; margin-bottom: 15px; line-height: 1.6;">提交成功</h3>' +
      '<p style="font-size: 14px; color: #666; line-height: 1.8; margin-bottom: 30px;">' +
      '我们会尽快查看您的需求，后续会通过手机跟您联系！</p>' +
      '<button id="successConfirmBtn" style="' +
      'width: 100%; max-width: 200px; height: 44px; border: none; border-radius: 22px;' +
      'background: #ff7a25;' +
      'color: #fff; font-size: 16px; font-weight: 500; cursor: pointer;' +
      'transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(54, 158, 255, 0.3);">' +
      '确定</button></div>'

    var index = layer.open({
      type: 1,
      title: false,
      closeBtn: 0,
      shade: 0.5,
      shadeClose: false,
      area: 'auto',
      content: contentHtml,
      success: function (layero, index) {
        var $btn = $('#successConfirmBtn', layero)
        $btn.on('click', function () {
          layer.close(index)
          // 查找当前激活的弹窗
          var activeOverlay = document.querySelector(
            '.search-login-modal-overlay.is-active'
          )
          if (activeOverlay) {
            activeOverlay.classList.remove('is-active')
          }
          // 重置卡片状态
          var flipCard = activeOverlay
            ? activeOverlay.querySelector('.flip-card')
            : null
          if (flipCard) {
            flipCard.classList.remove('flipped')
            var container = flipCard.closest('.flip-card-container')
            var modal = flipCard.closest('.search-login-modal')
            if (container) {
              container.classList.remove('flipped')
              container.style.minHeight = getCorrectMinHeight() + 'px'
            }
            if (modal) {
              modal.classList.remove('flipped')
              modal.style.minHeight = getCorrectMinHeight() + 'px'
            }
          }
          // 重置表单
          var form = document.getElementById('demandForm')
          if (form) form.reset()
          // 重置字数统计
          var wordCountEl = document.getElementById('detailsWordCount')
          if (wordCountEl) wordCountEl.textContent = '500'
        })
      }
    })
  }

  // 获取正确的最小高度（根据设备类型）
  function getCorrectMinHeight() {
    return window.innerWidth <= 830 ? 410 : 380
  }

  // ==================== 初始化 ====================
  function init() {
    // 翻转卡片（使用事件委托，兼容静态和动态生成的 #btnRegister）
    document.addEventListener('click', function (e) {
      var target = e.target.closest('#btnRegister')
      if (!target) return
      e.preventDefault()

      // 优先判断按钮是否在翻转卡片容器内（通用场景）
      var flipContainer = target.closest('.flip-card-container')
      if (flipContainer) {
        // 按钮在翻转卡片内
        var flipCard = flipContainer.querySelector('.flip-card')
        // 确保弹窗已激活
        var overlay = flipContainer.closest('.search-login-modal-overlay')
        if (overlay && !overlay.classList.contains('is-active')) {
          overlay.classList.add('is-active')
          // 延迟翻转，让弹窗先显示
          setTimeout(function () {
            doFlipCard(flipCard)
          }, 100)
        } else {
          // 弹窗已激活，直接翻转
          doFlipCard(flipCard)
        }
      } else {
        // 按钮不在翻转卡片内，关闭当前弹窗，打开政府侧弹窗（复用翻转卡片）
        var overlay = target.closest('.search-login-modal-overlay')
        if (overlay) overlay.classList.remove('is-active')
        var govModal = document.getElementById('govGetDataModal')
        if (govModal) govModal.classList.add('is-active')
        // 延迟翻转，让弹窗先显示
        setTimeout(function () {
          var govFlipCard = document.getElementById('govFlipCard')
          doFlipCard(govFlipCard)
        }, 100)
      }
    })

    // 通用翻转卡片函数
    function doFlipCard(flipCardEl) {
      if (!flipCardEl) return
      var container = flipCardEl.closest('.flip-card-container')
      var modal = flipCardEl.closest('.search-login-modal')

      flipCardEl.classList.add('flipped')
      if (container) container.classList.add('flipped')
      if (modal) modal.classList.add('flipped')

      // 动态调整容器高度以适应表单（增加额外高度以容纳校验提示）
      if (container && modal) {
        var backHeight =
          container.querySelector('.flip-card-back')?.offsetHeight || 400
        container.style.minHeight = backHeight + 80 + 'px'
        modal.style.minHeight = backHeight + 90 + 'px'
      }
    }

    // 返回正面
    var btnBack = document.getElementById('btnBack')
    if (btnBack) {
      btnBack.addEventListener('click', function (e) {
        e.preventDefault()
        var flipCard = this.closest('.flip-card')
        var container = this.closest('.flip-card-container')
        var modal = this.closest('.search-login-modal')

        if (flipCard) flipCard.classList.remove('flipped')
        if (container) {
          container.classList.remove('flipped')
          container.style.minHeight = getCorrectMinHeight() + 'px'
        }
        if (modal) {
          modal.classList.remove('flipped')
          modal.style.minHeight = getCorrectMinHeight() + 'px'
        }

        // 清除表单验证错误
        clearFormErrors()
        var form = document.getElementById('demandForm')
        if (form) form.reset()

        // 重置字数统计
        var wordCountEl = document.getElementById('detailsWordCount')
        if (wordCountEl) wordCountEl.textContent = '500'
      })
    }

    // 需求描述字数统计
    var detailsTextarea = document.getElementById('details')
    if (detailsTextarea) {
      detailsTextarea.addEventListener('input', function () {
        var maxLength = 500
        var currentLength = this.value.length
        var remaining = maxLength - currentLength
        var wordCountEl = document.getElementById('detailsWordCount')
        if (wordCountEl) {
          wordCountEl.textContent = remaining.toString()
        }
      })
    }

    // 申请入驻按钮 - 打开数据获取弹窗
    var btnApplySettle = document.getElementById('btn-apply-settle')
    if (btnApplySettle) {
      btnApplySettle.addEventListener('click', function (e) {
        e.preventDefault()
        var govModal = document.getElementById('govGetDataModal')
        if (govModal) {
          govModal.classList.add('is-active')
        }
      })
    }

    // 提交表单
    var btnSubmit = document.getElementById('btnSubmit')
    if (btnSubmit) {
      btnSubmit.addEventListener('click', function (e) {
        e.preventDefault()

        // 获取表单数据
        var contactPerson = document
          .getElementById('contactPerson')
          .value.trim()
        var phoneNumber = document.getElementById('phoneNumber').value.trim()
        var companyName = document.getElementById('companyName').value.trim()
        var details = document.getElementById('details').value.trim()

        submitForm({
          contactPerson: contactPerson,
          phoneNumber: phoneNumber,
          companyName: companyName,
          details: details
        })
      })
    }

    // 弹窗关闭时清理数据
    var modals = document.querySelectorAll('.search-login-modal-overlay')
    modals.forEach(function (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === this) {
          clearDetailData()
        }
      })
    })
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }

  // 暴露全局方法（用于外部设置数据）
  window.DemandRegistration = {
    setDetailData: setDetailData,
    getDetailData: getDetailData,
    clearDetailData: clearDetailData,
    validateForm: validateForm,
    submitForm: submitForm,
    getSourceType: getSourceType,
    getTitle: getTitle
  }
})()
