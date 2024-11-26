import request from '@/utils/request'
import JSEncrypt from 'jsencrypt'

export function getTenants() {
  return request('sys/tenant/tenants?filter=Actived', {
    type: 'common',
  })
}

// 获取版本号

export function getVersion() {
  return request('common/version', { type: 'common' })
}

export function login(data) {
  return request('auth/signin', 'put', { type: 'common', data: data })
}
export function encrypt(pwd) {
  return request('common/communicationkey', { type: 'common' })
}

// 获取路由
export function getMenu() {
  return request('ui/menu')
}

// 获取日期的格式
export function getFormat() {
  return request('sys/ui/format', {
    type: 'common',
  })
}

// 获取初始化logo和数据
export function getInitLogo() {
  return request('/common/logo', { type: 'common' })
}

// 修改密码
export function changePwdApi(data) {
  return request('security/changepwd', 'put', { data })
}

// 生成加密后的密码
export async function encryptionPassword(...rest) {
  let enRes = await request('common/communicationkey', { type: 'common' })
  let publicKey = enRes.communicationKey
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey)
  let genPwdList = []
  for (let i = 0; i < rest.length; i++) {
    genPwdList.push(encryptor.encrypt(rest[i]))
  }
  return genPwdList
}
