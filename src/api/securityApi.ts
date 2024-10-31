import request from '@/utils/request.ts'

// 数据统计
export function userStatistic() {
  return request('security/user/statistic')
}

// 用户列表
export function getUsers(params) {
  return request('security/users', { params })
}

// 删除用户
export function deleteUser(user) {
  return request(`security/user/${user}`, 'delete')
}

// 启用用户
export function enableUser(user) {
  return request(`/security/user/${user}/enable`, 'put')
}

// 未启用用户
export function disableUser(user) {
  return request(`/security/user/${user}/disable`, 'put')
}

// 用户新增或编辑
/**
description:"dddd"
fullName:"aaa"
password:"I1C3UiusbBc74xTmnoRStJtT5J9W6kgUB4Z5Afj1M+ReXPsqTocsdqckrn7QQJ0J80HVFaVdVD+R9fhKOirtMA=="
status:"on"
username:"aaa"
 */
export function addUser(data) {
  return request('security/user', 'put', { data })
}

// security/user/andy1/roles
export function putRoles(name, data) {
  return request(`security/user/${name}/roles`, 'put', { data })
}

// 获取桶操作权限
export function getBucketPermission(name) {
  return request(`security/user/${name}/permission`)
}

// 更新桶操作权限
export function updateBucketPermission(name, data) {
  return request(`security/user/${name}/permission`, 'put', { data })
}
