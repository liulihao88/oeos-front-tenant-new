import request, { requestOld } from '@/utils/request.ts'

// 简单查询
export function querySimple(params) {
  return request('object/query/simple', { params })
}
