import request from './request.ts'
import { setStorage, getStorage } from 'oeos-components'
import router from '@/router/index.ts'
import { encryptionPassword } from '@/api/login.ts'

export async function devLogin() {
  if (import.meta.env.DEV) {
    let sysdomain = getStorage('tenant-sysdomain')
    if (!sysdomain) {
      localStorage.removeItem('tenant-token')
      router.push({ name: 'Login' })
      return
    }
    let genPasRes = await encryptionPassword('adminadmin')
    let data = {
      username: 'admin',
      password: genPasRes[0],
      sysdomain: sysdomain.tenantId || 'T04',
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
