import request from '@/utils/request'
import JSEncrypt from 'jsencrypt'

// 获取事件等级
export function getWarningOptions() {
  return request('common/support/levels', {
    type: 'common',
  })
}

// 租户事件列表
export function tenantEventQuery() {
  return request('event/query')
}

// 获取租户概览
export function getInfoOverview() {
  return request('info/overview', { showLoading: true })
}
