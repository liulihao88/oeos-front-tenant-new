import request, { requestOld } from '@/utils/request.js'

// 获取桶列表
export function getBucketList(params) {
  return request('tenant/bucket/summary', { params })
}

// 根据桶名称, 获取桶详情
export function getBucketDetail(bucketName) {
  return request(`tenant/bucket/${bucketName}/gauge`)
}

export function getSpaceHistogram() {
  return request(`tenant/space/histogram`)
}
// 获取桶容量详情
export function getHistogram(bucketName) {
  return request(`tenant/bucket/${bucketName}/histogram`)
}

// 获取桶容量
export function getUsage(bucketName) {
  return request(`tenant/${bucketName}/usage`)
}

export function getOverview() {
  return request('tenant/info/overview')
}
