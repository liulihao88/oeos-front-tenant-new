import request, { requestOld } from '@/utils/request'

// 获取桶列表
export function getBucketOptions(params = {}) {
  return request('bucket/buckets', { params })
}

export function getObjectList(params) {
  return request('object/list', { params: params })
}

export function uploadFile(data) {
  return request('object/upload', 'put', {
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
export function deleteBatch(data) {
  return request('object/delete/batch', 'put', { data: data })
}

export function deleteOne(data) {
  return request('object/delete', 'delete', { params: data })
}

export function getHistory(params) {
  return request('object/listversion', {
    params: params,
  })
}

// 批量下载
export function objectDownloadBatch(data) {
  return request('object/download/batch', 'put', {
    data: data,
  })
}

// 详情 object/property
export function objectPropertyDetail(data) {
  return request('object/property', { params: data })
}

// 恢复
export function objectRestore(data) {
  return request('object/restore', 'put', { params: data })
}

// 批量恢复 object/restore/batch
export function objectRestoreBatch(data) {
  return request('object/restore/batch', 'put', { data: data })
}
