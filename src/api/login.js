import request, { requestOld } from '@/utils/request.js'

export function getTenants() {
  return request('sys/tenant/tenants?filter=Actived', {
    baseURL: '/api/v1/admin',
  })
}

export function login(data) {
  return requestOld({
    url: 'auth/signin',
    method: 'put',
    data: data,
  })
}
export function encrypt(pwd) {
  return request('common/communicationkey', { type: 'common' })
}

// 获取路由
export function getMenu() {
  return request('tenant/ui/menu')
}
