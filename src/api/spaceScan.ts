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
