import request from '@/utils/request.ts'

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
