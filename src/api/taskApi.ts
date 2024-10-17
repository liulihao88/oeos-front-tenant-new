import request from '@/utils/request.ts'

// 桶任务
export function getBucketTask() {
  return request('objecthandle/task/status')
}

// 启用或禁用桶任务
export function toggleTaskStatus(id, status) {
  return request(`/objecthandle/task/${id}/${status}`, 'put')
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
