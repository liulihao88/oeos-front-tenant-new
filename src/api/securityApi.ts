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

// 查看所属组
export function viewGroup(name) {
  return request(`security/user/${name}/groups`)
}

// 保存所属组
export function putGroup(name, data) {
  return request(`security/user/${name}/groups`, 'put', { data })
}

// 获取桶操作权限
export function getBucketPermission(name) {
  return request(`security/user/${name}/permission`)
}

// 更新桶操作权限
export function updateBucketPermission(name, data) {
  return request(`security/user/${name}/permission`, 'put', { data })
}

/**
 * 组管理
 */

// 获取组列表
export function getGroupList() {
  return request(`security/groups`)
}

// 组详情
export function getGroupDetails(groupName) {
  return request(`security/group/${groupName}`)
}

// 新增组 security/group
export function addNewGroupApi(data) {
  return request(`security/group`, 'put', { data })
}

// 删除组
export function deleteGroupApi(name) {
  return request(`security/group/${name}`, 'delete')
}

// 某个组的组用户
export function getGroupMember(groupName) {
  return request(`security/group/${groupName}/member/list`)
}

// 增加组用户  security/group/aaa1/member/add
export function addGroupMember(name, data) {
  return request(`security/group/${name}/member/add`, 'put', { data })
}

// 移除组用户
export function removeMember(name, memberList) {
  return request(`security/group/${name}/member/remove`, 'put', { data: memberList })
}

// 获取某个组的桶权限
export function getGroupMemberPermission(name) {
  return request(`security/group/${name}/permission`)
}
// 更改某个组的桶权限
export function putGroupMemberPermission(name, data) {
  return request(`security/group/${name}/permission`, 'put', { data })
}
