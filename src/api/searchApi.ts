import request, { requestOld } from '@/utils/request.ts'

// 简单查询
export function querySimple(params) {
  return request('object/query/simple', { params, resolve: 'data' })
}

// 高级查询
export function queryAdvance(data) {
  return request('object/query/advance', 'put', { data, resolve: 'data' })
}

// 获取存储类型列表
export function getStorageClassList() {
  return request('space/accessiblestorages')
}
