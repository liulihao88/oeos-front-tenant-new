import request from './request.ts'
import Vue from 'vue'
import { setStorage, getStorage } from 'oeos-components'
import JSEncrypt from 'jsencrypt'
import router from '@/router/index.ts'

export async function devLogin() {
  // Vue.prototype.$toast('token过期', 'error')
  if (import.meta.env.DEV) {
    let enRes = await request('/common/communicationkey', {
      type: 'common',
    })
    let publicKey = enRes.communicationKey
    const encryptor = new JSEncrypt()
    encryptor.setPublicKey(publicKey)
    let password_one = encryptor.encrypt('adminadmin')
    let data = {
      username: 'admin',
      password: password_one,
      sysdomain: getStorage('tenant-sysdomain'),
    }
    let res = await request('/auth/signin', 'put', {
      type: 'common',
      data: data,
    })
    let token = `${res.tokenType} ${res.token}`
    setStorage('tenant-token', token)
    router.go(0)
  } else {
    localStorage.removeItem('tenant-token')
    router.push({ name: 'Login' })
  }
}
