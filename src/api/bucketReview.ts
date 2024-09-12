import request, { requestOld } from '@/utils/request.js'

// 获取桶列表
export function getBucketOptions(params) {
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
