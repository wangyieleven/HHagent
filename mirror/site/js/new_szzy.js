// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
  // 分别加载数据资源、组件资源和云算力资源
  queryComponentByType('DATA', 'shujuList', { current: 1, size: 6 })
  queryComponentByType('COMPONENT', 'zujianList', { current: 1, size: 6 })
  queryComponentByType('CLOUD', 'yunsuanliList', { current: 1, size: 6 })
  loadSjTotal()
})

const GOV_DATA_TOTAL = 11038 // 10659 + 联合实验8+高质量数据集364

function getNodeChildren(node) {
  if (!node || !Array.isArray(node.childCatalogList)) return []
  return node.childCatalogList
}

function getLabRootNode(list) {
  const queue = Array.isArray(list) ? list.slice() : []
  while (queue.length) {
    const item = queue.shift() || {}
    const id = String(item.idStr || item.id || '').trim()
    const name = String(item.catalogName || '').trim()
    if (
      id === '99999' ||
      name.indexOf('联合实验室') !== -1 ||
      name.indexOf('实验室') !== -1
    ) {
      return item
    }
    queue.push(...getNodeChildren(item))
  }
  return null
}

function getLabResourceTotal(response) {
  const roots =
    response && response.success && Array.isArray(response.data)
      ? response.data
      : []
  const labRoot = getLabRootNode(roots)
  return Number(labRoot && labRoot.resourceCount) || 0
}

function getSocialData(){
    return $.ajax({
      url: '/portal/api/common/calling/page',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        tableCode: 'SOCIAL_DATA',
        pageNum: 1,
        pageSize: 12,
        equalsParams: {},
        likeParams: {}
      })
    })

}

function loadSjTotal() {
  apiService
    .getStatCnt({
      resourceType: 'DATA'
    })
    .then((res) => {
      document.getElementById('sjTotal').textContent =
        GOV_DATA_TOTAL + getLabResourceTotal(res)
      getSocialData()
      .then(function (resp1) {
        let first = resp1.data
        let total = first.total || 0
        document.getElementById('sjTotal').textContent =
        GOV_DATA_TOTAL + getLabResourceTotal(res) + total
        const allTotal = GOV_DATA_TOTAL + getLabResourceTotal(res) + total
      return allTotal
      }).catch(function (err) {
        console.error('Error fetching social data:', err)
      })
    })
    .catch(() => {
      document.getElementById('sjTotal').textContent = GOV_DATA_TOTAL
    })
}

// 请求组件数据并渲染到指定 ul 元素中
function queryComponentByType(resourceType, targetUlId, params) {
  let apiCall

  switch (resourceType) {
    case 'DATA':
      apiCall = apiService.getShujuList(params)
      break
    case 'COMPONENT':
      apiCall = apiService.getZuJianList(params).then((res) => {
        // console.log('------',res)
        document.getElementById('zjTotal').textContent = res.data.total
        return res
      })
      break
    case 'CLOUD':
      apiCall = apiService.getYunSuanLiList(params).then((res) => {
        document.getElementById('ywslTotal').textContent = res.data.total
        return res
      })
      break
    default:
      console.error('未知的资源类型:', resourceType)
      return
  }
  apiCall
    .then((response) => {
      const { success, empty, data } = handleResponse(response)

      if (success && data && !empty) {
        const records = data.records || []
        renderComponentList(records, targetUlId, resourceType)
      } else {
        const targetElement = document.getElementById(targetUlId)
        if (targetElement) {
          targetElement.innerHTML = '<li>暂无数据</li>'
        }
      }
    })
    .catch((error) => {
      console.error(`加载 ${resourceType} 失败:`, error)
      const targetElement = document.getElementById(targetUlId)
      if (targetElement) {
        targetElement.innerHTML = '<li>加载失败</li>'
      }
    })
}

// 渲染组件列表
function renderComponentList(records, ulId, resourceType) {
  const ul = document.getElementById(ulId)
  if (!ul) return

  ul.innerHTML = ''

  records.forEach((rawItem) => {
    const item = normalizeItem(rawItem, resourceType)
    const li = document.createElement('li')

    // 解析 resourceServiceJson 字段并渲染服务类型
    let serviceTypeHtml = item.resourceType // 默认使用原始类型
    if (rawItem.resourceServiceJson) {
      try {
        const decodedString = decodeHtmlEntities(rawItem.resourceServiceJson)
        const serviceJson = JSON.parse(decodedString)
        const serviceTypes = serviceJson
          .map((service) => service.physicalResourceType)
          .filter(Boolean)
          .join(', ')
        serviceTypeHtml = serviceTypes || item.resourceType
      } catch (e) {
        console.error('解析 resourceServiceJson 失败:', e)
        serviceTypeHtml = item.resourceType
      }
    }

    // 渲染该项的所有内容，包括服务类型
    li.innerHTML = ` 
            <h3><img src="/fz/images/index_icon_002.png" alt="icon" />${item.resourceName}</h3>
            <p><b>服务类型：</b><span>${serviceTypeHtml}</span></p>
            <p><b>描述：</b><span>${item.description}</span></p>
        `

    // 只有不是 'CLOUD' 类型的资源才显示 "查看详情" 按钮
    if (resourceType !== 'CLOUD') {
      li.innerHTML += `
                <a class="more" href="/fz/cxfw/szzyml/szzyxq?id=${item.id}&type=${resourceType}" target="_blank">查看详情</a>
            `
    }
    ul.appendChild(li)
  })
}

// 对资源记录字段做统一处理
function normalizeItem(item, resourceType) {
  let name = item.resourceName || '无标题'
  let desc = ''
  let id = item.id

  switch (resourceType) {
    case 'CLOUD':
      desc = item.catalogDescription || item.description || '暂无描述'
      break
    case 'DATA':
    case 'COMPONENT':
    default:
      desc = item.description || '暂无描述'
      break
  }

  return {
    resourceName: name,
    resourceType: resourceType,
    description: desc,
    id: id
  }
}

// 解码 HTML 实体
function decodeHtmlEntities(str) {
  const parser = new DOMParser()
  const decodedString = parser.parseFromString(str, 'text/html').documentElement
    .textContent
  return decodedString
}
