import request from '@/utils/request.ts'

// 简单查询
export function queryCustomSimple(params) {
  return request('object/query/simple', { params, resolve: 'data', showLoading: true })
}

// 高级查询
export function queryCustomAdvance(data) {
  return request('object/query/advance', 'put', { data, resolve: 'data', showLoading: true })
}

// 获取存储类型列表
export function getStorageClassList() {
  return request('space/accessiblestorages')
}
