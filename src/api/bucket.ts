import request, { requestOld } from '@/utils/request.ts'

// 获取桶列表
export function getBucketList(params) {
  return request('bucket/summary', { params })
}

// 根据桶名称, 获取桶详情
export function getBucketDetail(bucketName) {
  return request(`bucket/${bucketName}/gauge`)
}

export function getSpaceHistogram() {
  return request(`space/histogram`)
}
// 获取桶容量详情
export function getHistogram(bucketName) {
  return request(`bucket/${bucketName}/histogram`)
}

// 获取桶容量
export function getUsage(bucketName) {
  return request(`${bucketName}/usage`)
}

export function getOverview() {
  return request('info/overview')
}

export function saveBucket(data) {
  return request('bucket', 'post', { data: data })
}
export function deleteBucket(bucketName) {
  return request(`bucket/${bucketName}`, 'delete')
}

/**
 * 桶详情
 */

// 获取总容量
export function getBucketTotal(bucketName) {
  return request(`bucket/${bucketName}/config/quota`)
}

// 修改容量
export function editBucketTotal(bucketName, data) {
  return request(`bucket/${bucketName}/config/quota`, 'put', { data })
}

// 获取使用量
export function getBucketUse(bucketName) {
  return request(`bucket/quota/limit/floor`, {
    params: {
      bucketName: bucketName,
    },
  })
}
