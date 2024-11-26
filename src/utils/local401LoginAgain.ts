import request from './request.ts'
import Vue from 'vue'
import { setStorage, getStorage } from 'oeos-components'
import JSEncrypt from 'jsencrypt'
import router from '@/router/index.ts'
import { encryptionPassword } from '@/api/login.ts'

export async function devLogin() {
  if (import.meta.env.DEV) {
    let genPasRes = await encryptionPassword('adminadmin')
    let data = {
      username: 'admin',
      password: genPasRes[0],
      sysdomain: getStorage('tenant-sysdomain').tenantId,
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
