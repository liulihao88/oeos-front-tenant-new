import request from '@/utils/request.ts'

// 桶任务
export function getBucketTask() {
  return request('objecthandle/task/status')
}

// 启用或禁用桶任务
export function toggleTaskStatus(id, status) {
  return request(`/objecthandle/task/${id}/${status}`, 'put')
}
