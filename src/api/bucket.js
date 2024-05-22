import request, { requestOld } from '@/utils/request.js'

// 获取桶列表
export function getBucketList(params) {
  return request('tenant/bucket/summary', { params })
}

// 根据桶名称, 获取桶详情
export function getBucketDetail(bucketName) {
  return request(`tenant/bucket/${bucketName}/gauge`)
}
