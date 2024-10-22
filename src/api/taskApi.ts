import request from '@/utils/request.ts'

// 桶任务
export function getBucketTask() {
  return request('objecthandle/task/status')
}

// 启用或禁用桶任务
export function toggleTaskStatus(id, status) {
  return request(`/objecthandle/task/${id}/${status}`, 'put')
}

// 保存或更新桶任务
export function saveTask(data) {
  return request('objecthandle/task/', 'put', { data: data })
}

// 桶任务详情
export function taskDetails(id) {
  return request(`objecthandle/task/${id}`)
}

// 删除桶任务
export function delTask(id) {
  return request(`objecthandle/task/${id}`, 'delete')
}

// 任务计划列表 /schedule/schedules
export function getSchedules() {
  return request('/schedule/schedules')
}

// 任务详情列表
export function getScheduleDetail(id) {
  return request(`/schedule/${id}`)
}

// 获取数据冷冻目标存储列表
export function getTargetStorageList() {
  return request('space/accessablestorages', {
    params: {
      type: 'GlacierStoragePool',
    },
  })
}

// 删除任务计划
export function deleteSchedule(id) {
  return request(`/schedule/${id}`, 'delete', { customResponse: true })
}

// 保存任务
export function saveSchedule(data) {
  return request(`/schedule`, 'put', { data: data })
}
