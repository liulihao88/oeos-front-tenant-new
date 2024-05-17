import request from '@/utils/request.js'

export function getTenants() {
  return request('sys/tenant/tenants?filter=Actived')
}
