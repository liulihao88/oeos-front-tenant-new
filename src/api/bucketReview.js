import request, { requestOld } from '@/utils/request.js'

// 获取桶列表
export function getBucketOptions(params) {
  return request('bucket/buckets', { params })
}

export function getObjectList(params) {
  return request('object/list', { params: params })
}
