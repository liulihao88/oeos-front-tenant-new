import request, { requestOld } from '@/utils/request.ts'

// 获取桶列表
export function getCustomBucketList(params) {
  return request('bucket/summary', { params, resolve: 'data' })
}

// 获取桶对象总数和总大小
export function getSpace() {
  return request('space/gauge')
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

// 获取配额
export function getBucketTotal(bucketName) {
  return request(`bucket/${bucketName}/config/quota`)
}

// 设置多版本控制是否启用
export function setVersion(bucketName, data) {
  return request(`bucket/${bucketName}/config/version`, 'put', { data: data })
}

//
export function getVersion(bucketName, data) {
  return request(`bucket/${bucketName}/config/version`)
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

// 获取过期时间
export function getRetentionAutodelete(bucketName, data) {
  return request(`bucket/${bucketName}/config/retention/autodelete`)
}

// 设置过期时间
export function retentionAutodelete(bucketName, data) {
  return request(`bucket/${bucketName}/config/retention/autodelete`, 'put', { data })
}

// 获取标签列表
export function getTagging(bucket) {
  return request(`bucket/${bucket}/config/tagging`)
}

// 保存标签列表
export function saveTagging(bucket, data) {
  return request(`bucket/${bucket}/config/tagging`, 'put', { data: data })
}

// 获取匿名访问列表
export function getAnonymous(bucket) {
  return request(`bucket/${bucket}/config/anonymous`)
}

// 保存匿名访问列表
/**
 *  {
  "path": "/a",
  "permission": "read",
  "effect": "allow"
}
['read', 'write', 'all]
 */

export function saveAnonymous(bucket, data) {
  return request(`bucket/${bucket}/config/anonymous`, 'put', { data: data })
}
