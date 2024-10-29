import request from '@/utils/request'

export function previewImage(params) {
  return request('object/download', {
    params: params,
    responseType: 'arraybuffer',
    customResponse: true,
  })
}

// 解冻浏览列表 object/restore/list
export function restoreList(params) {
  return request('object/restore/list', { params })
}

// 调整优先级
export function adjustLevelApi(level, data) {
  return request(`object/restore/priority?priority=${level}`, 'put', { data })
}

// 全部取消解冻
export function allCancelUnFreeze() {
  return request(`object/restore/cancelall`, 'put')
}

// 取消解冻
export function cancelUnFreezeApi(data) {
  return request(`object/restore/cancel`, 'put', { data })
}
