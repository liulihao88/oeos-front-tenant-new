import request from '@/utils/request.ts'

/**
 * 内置命令
 * @returns
 */
// 内置命令列表
export function getInnerCommand() {
  return request('command/status', {})
}

// 开始运行
export function startRunning(id) {
  return request(`command/${id}/start`, 'put')
}

// 终止运行
export function stopRunning(id) {
  return request(`command/${id}/stop`, 'put')
}

/**
 * 租户事件
 */
// 事件等级
export function getLevels() {
  return request(`/common/support/levels`, { type: 'common' })
}
// 事件列表
export function getEventList(data) {
  return request(`event/query`, 'put', { data: data })
}

// 标记处理
export function markHandle(id, type) {
  return request(`mark/${id}/${type}`, 'put')
}

// 删除事件
export function deleteEvent(id) {
  return request(`delete/${id}`, 'delete')
}

// 租户事件导出
export function exportEvent(data) {
  return request('query/export', 'put', { data: data })
}
